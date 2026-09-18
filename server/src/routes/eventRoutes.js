const express = require('express');
const router = express.Router();
const {
  createEvent,
  getEvents,
  getEventById,
} = require('../controllers/eventController');
const {
  validateRequired,
  validateObjectId,
} = require('../middleware/validateRequest');

// POST /api/events — Create an event (auto-generates seats)
router.post(
  '/',
  validateRequired(['title', 'venue', 'date', 'time', 'category', 'price']),
  createEvent
);

// GET /api/events — List events (optional ?category= filter)
router.get('/', getEvents);

// GET /api/events/:id — Get event details with venue populated
router.get('/:id', validateObjectId('id'), getEventById);

module.exports = router;
