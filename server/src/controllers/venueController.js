const Venue = require('../models/Venue');

/**
 * Create a new venue.
 * POST /api/venues
 */
const createVenue = async (req, res, next) => {
  try {
    const { name, rows, columns } = req.body;

    const venue = await Venue.create({ name, rows, columns });

    res.status(201).json({
      success: true,
      data: venue,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all venues.
 * GET /api/venues
 */
const getVenues = async (req, res, next) => {
  try {
    const venues = await Venue.find().sort({ name: 1 }).lean();

    res.json({
      success: true,
      count: venues.length,
      data: venues,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get a single venue by ID.
 * GET /api/venues/:id
 */
const getVenueById = async (req, res, next) => {
  try {
    const venue = await Venue.findById(req.params.id).lean();

    if (!venue) {
      return res.status(404).json({
        success: false,
        error: 'Venue not found',
      });
    }

    res.json({
      success: true,
      data: venue,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createVenue, getVenues, getVenueById };
