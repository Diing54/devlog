const { Pool } = require('pg');

let pool;

async function connectDB() {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    connectionTimeoutMillis: 5000,
  });

  const client = await pool.connect();
  console.log('[db] Connected to PostgreSQL');

  await client.query(`
    CREATE TABLE IF NOT EXISTS logs (
      id          SERIAL PRIMARY KEY,
      title       VARCHAR(255) NOT NULL,
      description TEXT,
      tags        TEXT[]       DEFAULT '{}',
      created_at  TIMESTAMPTZ  DEFAULT NOW()
    );
  `);

  // Index on created_at — all queries ORDER BY created_at DESC
  // Without this Postgres does a full sequential scan on every request
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_logs_created_at
    ON logs(created_at DESC);
  `);

  // GIN index on the tags array column
  // Makes ANY(tags) lookups O(log n) instead of O(n)
  // GIN = Generalized Inverted Index, designed exactly for array columns
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_logs_tags
    ON logs USING GIN(tags);
  `);

  console.log('[db] Schema and indexes ready');
  client.release();
}

function getDB() {
  if (!pool) throw new Error('[db] Pool not initialized — call connectDB() first');
  return pool;
}

module.exports = { connectDB, getDB };
