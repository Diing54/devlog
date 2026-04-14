const express = require('express');
const router = express.Router();
const { getDB } = require('../db');
const { getRedis } = require('../redis');

const ALL_LOGS_CACHE_KEY = 'logs:all';
const CACHE_TTL = 60;

// GET /api/logs?q=optional_search_term
router.get('/', async (req, res) => {
  const q = req.query.q?.trim() || '';

  try {
    // --- Path A: no search term → cache-aside against Postgres ---
    if (!q) {
      const redis = getRedis();
      const cached = await redis.get(ALL_LOGS_CACHE_KEY);

      if (cached) {
        return res.json({ source: 'cache', data: JSON.parse(cached) });
      }

      const db = getDB();
      const result = await db.query(
        'SELECT * FROM logs ORDER BY created_at DESC LIMIT 50'
      );

      await redis.setEx(ALL_LOGS_CACHE_KEY, CACHE_TTL, JSON.stringify(result.rows));
      return res.json({ source: 'database', data: result.rows });
    }

    // --- Path B: search term present → always hit Postgres ---
    // Why no cache for search: search queries are highly varied.
    // Caching every unique search string wastes Redis memory and
    // complicates invalidation. The base query (Path A) handles
    // the high-frequency case. Search is inherently lower-frequency.
    const db = getDB();
    const result = await db.query(
      `SELECT * FROM logs
       WHERE  title       ILIKE $1
          OR  description ILIKE $1
          OR  EXISTS (
                SELECT 1
                FROM   unnest(tags) AS tag
                WHERE  tag ILIKE $1
              )
       ORDER BY created_at DESC
       LIMIT 50`,
      [`%${q}%`]
      // Why unnest() + ILIKE instead of ANY():
      //   ANY(tags) only supports exact equality ($1 = ANY(tags))
      //   unnest() expands the array into rows so ILIKE (partial match) works
      //   EXISTS with unnest short-circuits on first match — no full scan
    );

    return res.json({ source: 'database', data: result.rows, query: q });
  } catch (err) {
    console.error('[GET /api/logs]', err);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// POST /api/logs
router.post('/', async (req, res) => {
  const { title, description, tags } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'title is required' });
  }

  try {
    const db = getDB();
    const result = await db.query(
      `INSERT INTO logs (title, description, tags)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title.trim(), description?.trim() || null, tags || []]
    );

    // Invalidate the all-logs cache — next GET will re-populate from Postgres
    // Search results are not cached so no further invalidation needed
    const redis = getRedis();
    await redis.del(ALL_LOGS_CACHE_KEY);

    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    console.error('[POST /api/logs]', err);
    res.status(500).json({ error: 'Failed to create log' });
  }
});

// DELETE /api/logs/:id
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid log id' });
  }

  try {
    const db = getDB();
    const result = await db.query(
      'DELETE FROM logs WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Log not found' });
    }

    const redis = getRedis();
    await redis.del(ALL_LOGS_CACHE_KEY);

    res.status(204).send();
  } catch (err) {
    console.error('[DELETE /api/logs/:id]', err);
    res.status(500).json({ error: 'Failed to delete log' });
  }
});

module.exports = router;
