// Seat status values
const SEAT_STATUS = {
  AVAILABLE: 'available',
  HELD: 'held',
  BOOKED: 'booked',
};

// Booking status values
const BOOKING_STATUS = {
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
};

// Event status values
const EVENT_STATUS = {
  UPCOMING: 'upcoming',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Event categories
const EVENT_CATEGORIES = ['concert', 'sports', 'theater', 'comedy'];

// BullMQ queue names
const QUEUE_NAMES = {
  HOLD_EXPIRY: 'hold-expiry',
  NOTIFICATION: 'notification',
};

// BullMQ job types
const JOB_TYPES = {
  EXPIRE_HOLD: 'expire-hold',
  SEND_NOTIFICATION: 'send-notification',
};

// Notification types
const NOTIFICATION_TYPES = {
  BOOKING_CONFIRMED: 'booking-confirmed',
  BOOKING_CANCELLED: 'booking-cancelled',
};

// Hold duration in milliseconds (5 minutes)
const HOLD_DURATION_MS = 5 * 60 * 1000;

// Hold duration in seconds (for Redis TTL)
const HOLD_DURATION_SECONDS = 300;

// Redis key prefixes
const REDIS_KEYS = {
  SEAT_LOCK: 'seat-lock', // seat-lock:{eventId}:{seatId}
};

// Socket.io events
const SOCKET_EVENTS = {
  JOIN_EVENT: 'join:event',
  LEAVE_EVENT: 'leave:event',
  SEATS_UPDATED: 'seats:updated',
  EVENT_UPDATED: 'event:updated',
};

// Generate a seat label from row and column (0-indexed)
// Row 0 → A, Row 1 → B, etc.
function getSeatLabel(row, column) {
  const rowLetter = String.fromCharCode(65 + row); // A, B, C, ...
  const colNumber = column + 1; // 1-indexed
  return `${rowLetter}${colNumber}`;
}

module.exports = {
  SEAT_STATUS,
  BOOKING_STATUS,
  EVENT_STATUS,
  EVENT_CATEGORIES,
  QUEUE_NAMES,
  JOB_TYPES,
  NOTIFICATION_TYPES,
  HOLD_DURATION_MS,
  HOLD_DURATION_SECONDS,
  REDIS_KEYS,
  SOCKET_EVENTS,
  getSeatLabel,
};
