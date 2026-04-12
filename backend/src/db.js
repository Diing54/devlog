const { Pool } = require('pg');

let pool;

async function connectDB() {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // max connections in pool (default 10 is fine for dev)
    max: 10,
    // how long to wait for a connection before erroring
    connectionTimeoutMillis: 5000,
  });

  const client = await pool.connect();
  console.log('[db] Connected to PostgreSQL');

  // Run schema migration — idempotent, safe to run every startup
  await client.query(`
    CREATE TABLE IF NOT EXISTS logs (
      id          SERIAL PRIMARY KEY,
      title       VARCHAR(255) NOT NULL,
      description TEXT,
      tags        TEXT[]       DEFAULT '{}',
      created_at  TIMESTAMPTZ  DEFAULT NOW()
    );
  `);

  console.log('[db] Schema ready');
  client.release();
}

function getDB() {
  if (!pool) throw new Error('[db] Pool not initialized — call connectDB() first');
  return pool;
}

module.exports = { connectDB, getDB };
