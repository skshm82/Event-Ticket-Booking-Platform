const express = require('express');
const router = express.Router();
const {
  holdSeats,
  confirmBooking,
  cancelBooking,
  getBookings,
  getBookingById,
} = require('../controllers/bookingController');
const {
  validateRequired,
  validateObjectId,
} = require('../middleware/validateRequest');

// POST /api/bookings/hold — Hold selected seats
router.post(
  '/hold',
  validateRequired(['eventId', 'seatIds', 'userId']),
  holdSeats
);

// POST /api/bookings/confirm — Confirm a booking
router.post(
  '/confirm',
  validateRequired(['eventId', 'seatIds', 'userId']),
  confirmBooking
);

// POST /api/bookings/:id/cancel — Cancel a confirmed booking
router.post(
  '/:id/cancel',
  validateObjectId('id'),
  validateRequired(['userId']),
  cancelBooking
);

// GET /api/bookings — Get bookings for a user (?userId=)
router.get('/', getBookings);

// GET /api/bookings/:id — Get a single booking
router.get('/:id', validateObjectId('id'), getBookingById);

module.exports = router;
