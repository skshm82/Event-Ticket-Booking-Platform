const Seat = require('../../../server/src/models/Seat');
const { SEAT_STATUS } = require('../../../shared/constants');

/**
 * Process a hold-expiry job.
 * Releases seats that are still held by the specified user back to available.
 * This is a no-op if the seats have already been confirmed or released.
 */
async function processHoldExpiry(job) {
  const { eventId, seatIds, userId } = job.data;

  console.log(
    `[HoldExpiry] Checking ${seatIds.length} seats for event ${eventId}, user ${userId}`
  );

  // Only release seats that are still held by this user
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
    console.log(
      `[HoldExpiry] Released ${result.modifiedCount} seats back to available`
    );

    // TODO (Day 8): Publish seat update via Redis pub/sub for Socket.io
  } else {
    console.log(
      '[HoldExpiry] No seats to release (already confirmed or expired)'
    );
  }
}

module.exports = processHoldExpiry;
