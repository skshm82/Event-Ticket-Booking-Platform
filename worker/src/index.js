require('dotenv').config();

const mongoose = require('mongoose');
const { Worker } = require('bullmq');
const Redis = require('ioredis');
const { QUEUE_NAMES } = require('../../shared/constants');

// Import processors
const processHoldExpiry = require('./processors/holdExpiry');
const processNotification = require('./processors/notification');

const start = async () => {
  // Connect to MongoDB
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[Worker] MongoDB connected');
  } catch (err) {
    console.error('[Worker] MongoDB connection failed:', err.message);
    process.exit(1);
  }

  // Redis connection for BullMQ
  const redisConnection = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

  // Hold expiry worker
  const holdExpiryWorker = new Worker(
    QUEUE_NAMES.HOLD_EXPIRY,
    async (job) => {
      console.log(
        `[Worker] Processing ${job.name} (ID: ${job.id})`,
        job.data
      );
      await processHoldExpiry(job);
    },
    { connection: redisConnection }
  );

  holdExpiryWorker.on('completed', (job) => {
    console.log(`[Worker] Hold expiry job ${job.id} completed`);
  });

  holdExpiryWorker.on('failed', (job, err) => {
    console.error(`[Worker] Hold expiry job ${job?.id} failed:`, err.message);
  });

  // Notification worker
  const notificationWorker = new Worker(
    QUEUE_NAMES.NOTIFICATION,
    async (job) => {
      console.log(
        `[Worker] Processing ${job.name} (ID: ${job.id})`,
        job.data
      );
      await processNotification(job);
    },
    { connection: redisConnection }
  );

  notificationWorker.on('completed', (job) => {
    console.log(`[Worker] Notification job ${job.id} completed`);
  });

  notificationWorker.on('failed', (job, err) => {
    console.error(
      `[Worker] Notification job ${job?.id} failed:`,
      err.message
    );
  });

  console.log(
    `[Worker] Ready, processing queues: ${QUEUE_NAMES.HOLD_EXPIRY}, ${QUEUE_NAMES.NOTIFICATION}`
  );

  // Graceful shutdown
  const shutdown = async () => {
    console.log('[Worker] Shutting down...');
    await holdExpiryWorker.close();
    await notificationWorker.close();
    await redisConnection.quit();
    await mongoose.connection.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

start().catch((err) => {
  console.error('[Worker] Failed to start:', err);
  process.exit(1);
});
