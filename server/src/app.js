const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = process.env.CLIENT_URL;
      if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin) || origin === allowed) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  })
);
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/venues', require('./routes/venueRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/events/:eventId/seats', require('./routes/seatRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));

// Health check
app.get('/api/health', async (req, res) => {
  const mongoose = require('mongoose');
  const { getRedisClient } = require('./config/redis');

  const dbStatus =
    mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  let redisStatus = 'disconnected';
  try {
    const redis = getRedisClient();
    const pong = await redis.ping();
    redisStatus = pong === 'PONG' ? 'connected' : 'error';
  } catch (err) {
    redisStatus = 'error';
  }

  res.json({
    success: true,
    status: 'ok',
    db: dbStatus,
    redis: redisStatus,
    timestamp: new Date().toISOString(),
  });
});

// Serve client build in production if available, else API info
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  const fs = require('fs');
  const clientDistPath = path.join(__dirname, '../../client/dist');
  
  if (fs.existsSync(path.join(clientDistPath, 'index.html'))) {
    app.use(express.static(clientDistPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(clientDistPath, 'index.html'));
    });
  } else {
    app.get('/', (req, res) => {
      res.json({
        name: 'entrio API Server',
        status: 'online',
        health: '/api/health',
      });
    });
  }
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
