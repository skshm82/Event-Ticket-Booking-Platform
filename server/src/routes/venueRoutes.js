const express = require('express');
const router = express.Router();
const {
  createVenue,
  getVenues,
  getVenueById,
} = require('../controllers/venueController');
const {
  validateRequired,
  validateObjectId,
} = require('../middleware/validateRequest');

// POST /api/venues — Create a new venue
router.post('/', validateRequired(['name', 'rows', 'columns']), createVenue);

// GET /api/venues — List all venues
router.get('/', getVenues);

// GET /api/venues/:id — Get venue by ID
router.get('/:id', validateObjectId('id'), getVenueById);

module.exports = router;
