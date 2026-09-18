const Seat = require('../models/Seat');

/**
 * Get all seats for an event.
 * GET /api/events/:eventId/seats
 */
const getSeatsByEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const seats = await Seat.find({ event: eventId })
      .sort({ row: 1, column: 1 })
      .lean();

    res.json({
      success: true,
      count: seats.length,
      data: seats,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSeatsByEvent };
