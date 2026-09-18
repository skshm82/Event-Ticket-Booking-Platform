const express = require('express');
const router = express.Router({ mergeParams: true });
const { getSeatsByEvent } = require('../controllers/seatController');
const { validateObjectId } = require('../middleware/validateRequest');

// GET /api/events/:eventId/seats — Get all seats for an event
router.get('/', validateObjectId('eventId'), getSeatsByEvent);

module.exports = router;
