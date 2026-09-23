const { Worker } = require('bullmq');
const Redis = require('ioredis');
const Seat = require('../models/Seat');
const { QUEUE_NAMES, SEAT_STATUS, SOCKET_EVENTS } = require('../../../shared/constants');
const { getIO } = require('../config/socket');

let holdExpiryWorker = null;
let notificationWorker = null;

function initWorkers() {
  if (!process.env.REDIS_URL) {
    console.warn('[Embedded Worker] REDIS_URL not set, skipping worker startup.');
    return;
  }

  try {
    const redisConnection = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      family: 4,
      connectTimeout: 20000,
      retryStrategy(times) {
        return Math.min(times * 100, 3000);
      },
    });

    // Hold expiry worker
    holdExpiryWorker = new Worker(
      QUEUE_NAMES.HOLD_EXPIRY,
      async (job) => {
        const { eventId, seatIds, userId } = job.data;
        console.log(`[Worker] Checking hold expiry for event ${eventId}, user ${userId}`);

        const result = await Seat.updateMany(
          {
            _id: { $in: seatIds },
            event: eventId,
            status: SEAT_STATUS.HELD,
            heldBy: userId,
          },
          {
            $set: {
              status: SEAT_STATUS.AVAILABLE,
              heldBy: null,
              heldAt: null,
            },
            $inc: { version: 1 },
          }
        );

        if (result.modifiedCount > 0) {
          console.log(`[Worker] Released ${result.modifiedCount} seats back to available`);
          try {
            const io = getIO();
            if (io) {
              const updatedSeats = await Seat.find({ _id: { $in: seatIds } });
              io.to(eventId).emit(SOCKET_EVENTS.SEATS_UPDATED, {
                seats: updatedSeats,
              });
            }
          } catch (socketErr) {
            // Ignore socket errors
          }
        }
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
    notificationWorker = new Worker(
      QUEUE_NAMES.NOTIFICATION,
      async (job) => {
        const { bookingId, userId, eventTitle, seatLabels, type } = job.data;
        console.log('═══════════════════════════════════════════════════════');
        console.log(`[NOTIFICATION] Type: ${type}`);
        console.log(`[NOTIFICATION] Booking: ${bookingId}`);
        console.log(`[NOTIFICATION] User: ${userId}`);
        console.log(`[NOTIFICATION] Event: ${eventTitle}`);
        console.log(`[NOTIFICATION] Seats: ${seatLabels ? seatLabels.join(', ') : ''}`);
        console.log('═══════════════════════════════════════════════════════');
      },
      { connection: redisConnection }
    );

    notificationWorker.on('completed', (job) => {
      console.log(`[Worker] Notification job ${job.id} completed`);
    });

    console.log(`[Worker] Embedded BullMQ workers initialized successfully`);
  } catch (err) {
    console.error('[Worker] Failed to initialize embedded workers:', err.message);
  }
}

module.exports = { initWorkers };
