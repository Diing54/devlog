require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { connectDB } = require('./db');
const { connectRedis } = require('./redis');
const logsRouter = require('./routes/logs');

const app = express();
const PORT = process.env.PORT || 3000;

// helmet sets secure HTTP headers (X-Frame-Options, HSTS, etc.)
app.use(helmet());
// cors allows the frontend origin to call the API
app.use(cors());
// morgan logs every request in combined format (standard for prod)
app.use(morgan('combined'));
// parse incoming JSON bodies
app.use(express.json());

// Health check — used by Docker healthchecks and load balancers
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount routes
app.use('/api/logs', logsRouter);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

async function start() {
  await connectDB();
  await connectRedis();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[server] Listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('[startup] Fatal error:', err);
  process.exit(1);
});
