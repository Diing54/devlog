const express = require('express');
const router = express.Router();
const { getDB } = require('../db');
const { getRedis } = require('../redis');

const CACHE_KEY = 'recent_logs';
const CACHE_TTL = 60; // seconds

// GET /api/logs — fetch all logs (cache-first)
router.get('/', async (req, res) => {
  try {
    const redis = getRedis();

    // 1. Try Redis cache first
    const cached = await redis.get(CACHE_KEY);
    if (cached) {
      return res.json({ source: 'cache', data: JSON.parse(cached) });
    }

    // 2. Cache miss — query Postgres
    const db = getDB();
    const result = await db.query(
      'SELECT * FROM logs ORDER BY created_at DESC LIMIT 50'
    );

    // 3. Store in Redis for next 60 seconds
    await redis.setEx(CACHE_KEY, CACHE_TTL, JSON.stringify(result.rows));

    res.json({ source: 'database', data: result.rows });
  } catch (err) {
    console.error('[GET /api/logs]', err);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// POST /api/logs — create a new log entry
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

    // Invalidate cache so next GET hits Postgres for fresh data
    const redis = getRedis();
    await redis.del(CACHE_KEY);

    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    console.error('[POST /api/logs]', err);
    res.status(500).json({ error: 'Failed to create log' });
  }
});

// DELETE /api/logs/:id — remove a log entry
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
    await redis.del(CACHE_KEY);

    res.status(204).send();
  } catch (err) {
    console.error('[DELETE /api/logs/:id]', err);
    res.status(500).json({ error: 'Failed to delete log' });
  }
});

module.exports = router;
