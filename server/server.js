require('dotenv').config();

const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { getRedisClient } = require('./src/config/redis');
const { initSocket } = require('./src/config/socket');

const PORT = process.env.PORT || 5000;

const start = async () => {
  // Connect to MongoDB
  await connectDB();

  // Initialize Redis client (verifies connection)
  const redis = getRedisClient();
  try {
    const pong = await redis.ping();
    console.log(`Redis PING: ${pong}`);
  } catch (err) {
    console.error('Redis connection failed:', err.message);
    console.warn('Server starting without Redis — seat locks will not work.');
  }

  // Create HTTP server and attach Socket.io
  const httpServer = http.createServer(app);
  initSocket(httpServer, process.env.CLIENT_URL);

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
