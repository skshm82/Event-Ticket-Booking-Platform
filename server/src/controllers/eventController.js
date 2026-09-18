const Event = require('../models/Event');
const Venue = require('../models/Venue');
const Seat = require('../models/Seat');
const { getSeatLabel } = require('../../../shared/constants');

/**
 * Create a new event and auto-generate seats for the venue layout.
 * POST /api/events
 */
const createEvent = async (req, res, next) => {
  try {
    const { title, description, venue, date, time, category, price, imageUrl } =
      req.body;

    // Verify the venue exists
    const venueDoc = await Venue.findById(venue);
    if (!venueDoc) {
      return res.status(404).json({
        success: false,
        error: 'Venue not found',
      });
    }

    // Create the event
    const event = await Event.create({
      title,
      description,
      venue,
      date,
      time,
      category,
      price,
      imageUrl,
    });

    // Generate seats for the venue grid (rows × columns)
    const seats = [];
    for (let row = 0; row < venueDoc.rows; row++) {
      for (let col = 0; col < venueDoc.columns; col++) {
        seats.push({
          event: event._id,
          row,
          column: col,
          label: getSeatLabel(row, col),
        });
      }
    }

    await Seat.insertMany(seats);

    // Populate venue in the response
    const populatedEvent = await Event.findById(event._id)
      .populate('venue', 'name rows columns totalSeats')
      .lean();

    res.status(201).json({
      success: true,
      data: populatedEvent,
      seatsGenerated: seats.length,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all events with optional category filter.
 * GET /api/events
 * Query params: ?category=concert
 */
const getEvents = async (req, res, next) => {
  try {
    const filter = {};

    // Optional category filter
    if (req.query.category) {
      filter.category = req.query.category.toLowerCase();
    }

    // Optional status filter (default to upcoming)
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const events = await Event.find(filter)
      .populate('venue', 'name rows columns totalSeats')
      .sort({ date: 1 })
      .lean();

    // For each event, get the count of available seats
    const eventsWithCounts = await Promise.all(
      events.map(async (event) => {
        const availableCount = await Seat.countDocuments({
          event: event._id,
          status: 'available',
        });
        const totalCount = await Seat.countDocuments({ event: event._id });
        return {
          ...event,
          availableSeats: availableCount,
          totalSeats: totalCount,
        };
      })
    );

    res.json({
      success: true,
      count: eventsWithCounts.length,
      data: eventsWithCounts,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get a single event by ID with venue populated.
 * GET /api/events/:id
 */
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('venue', 'name rows columns totalSeats')
      .lean();

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
      });
    }

    // Get seat counts
    const availableCount = await Seat.countDocuments({
      event: event._id,
      status: 'available',
    });
    const totalCount = await Seat.countDocuments({ event: event._id });

    res.json({
      success: true,
      data: {
        ...event,
        availableSeats: availableCount,
        totalSeats: totalCount,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createEvent, getEvents, getEventById };
