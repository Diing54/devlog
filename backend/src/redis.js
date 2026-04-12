const { createClient } = require('redis');

let client;

async function connectRedis() {
  client = createClient({
    url: process.env.REDIS_URL,
  });

  client.on('error', (err) => console.error('[redis] Client error:', err));

  await client.connect();
  console.log('[redis] Connected to Redis');
}

function getRedis() {
  if (!client) throw new Error('[redis] Client not initialized — call connectRedis() first');
  return client;
}

module.exports = { connectRedis, getRedis };
