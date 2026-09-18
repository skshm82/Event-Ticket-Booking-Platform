const Booking = require('../models/Booking');
const Event = require('../models/Event');
const Seat = require('../models/Seat');
const { SEAT_STATUS, BOOKING_STATUS } = require('../../../shared/constants');

/**
 * Hold selected seats (simplified — no Redis locks yet).
 * Full Redis-based implementation comes in Day 5.
 * POST /api/bookings/hold
 * Body: { eventId, seatIds, userId }
 */
const holdSeats = async (req, res, next) => {
  try {
    const { eventId, seatIds, userId } = req.body;

    // Verify the event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
      });
    }

    // Verify all seats exist, belong to this event, and are available
    const seats = await Seat.find({
      _id: { $in: seatIds },
      event: eventId,
      status: SEAT_STATUS.AVAILABLE,
    });

    if (seats.length !== seatIds.length) {
      const foundIds = seats.map((s) => s._id.toString());
      const unavailable = seatIds.filter((id) => !foundIds.includes(id));
      return res.status(409).json({
        success: false,
        error: 'One or more seats are not available',
        unavailableSeats: unavailable,
      });
    }

    // Update seats to held status (simplified — no Redis lock)
    const now = new Date();
    await Seat.updateMany(
      {
        _id: { $in: seatIds },
        event: eventId,
        status: SEAT_STATUS.AVAILABLE,
      },
      {
        $set: {
          status: SEAT_STATUS.HELD,
          heldBy: userId,
          heldAt: now,
        },
        $inc: { version: 1 },
      }
    );

    // Calculate expiry time (5 minutes from now)
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);

    const heldSeats = await Seat.find({ _id: { $in: seatIds } }).lean();

    res.json({
      success: true,
      data: {
        eventId,
        userId,
        seats: heldSeats,
        heldAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Confirm a booking (simplified — no Redis lock verification yet).
 * Full implementation comes in Day 5.
 * POST /api/bookings/confirm
 * Body: { eventId, seatIds, userId }
 */
const confirmBooking = async (req, res, next) => {
  try {
    const { eventId, seatIds, userId } = req.body;

    // Verify the event exists
    const event = await Event.findById(eventId).populate('venue', 'name');
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
      });
    }

    // Verify all seats are held by this user
    const seats = await Seat.find({
      _id: { $in: seatIds },
      event: eventId,
      status: SEAT_STATUS.HELD,
      heldBy: userId,
    });

    if (seats.length !== seatIds.length) {
      return res.status(410).json({
        success: false,
        error: 'Hold expired or seats were taken by another user',
      });
    }

    // Create the booking
    const seatLabels = seats.map((s) => s.label);
    const totalPrice = seats.length * event.price;

    const booking = await Booking.create({
      event: eventId,
      userId,
      seats: seatIds,
      seatLabels,
      totalPrice,
      status: BOOKING_STATUS.CONFIRMED,
      confirmedAt: new Date(),
    });

    // Update seats to booked
    await Seat.updateMany(
      { _id: { $in: seatIds } },
      {
        $set: {
          status: SEAT_STATUS.BOOKED,
          booking: booking._id,
        },
        $inc: { version: 1 },
      }
    );

    // Populate booking for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate({
        path: 'event',
        populate: { path: 'venue', select: 'name' },
      })
      .lean();

    res.status(201).json({
      success: true,
      data: populatedBooking,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Cancel a confirmed booking.
 * POST /api/bookings/:id/cancel
 * Body: { userId }
 */
const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
      });
    }

    if (booking.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You can only cancel your own bookings',
      });
    }

    if (booking.status === BOOKING_STATUS.CANCELLED) {
      return res.status(400).json({
        success: false,
        error: 'Booking is already cancelled',
      });
    }

    // Update booking status
    booking.status = BOOKING_STATUS.CANCELLED;
    booking.cancelledAt = new Date();
    await booking.save();

    // Release seats back to available
    await Seat.updateMany(
      { _id: { $in: booking.seats } },
      {
        $set: {
          status: SEAT_STATUS.AVAILABLE,
          heldBy: null,
          heldAt: null,
          booking: null,
        },
        $inc: { version: 1 },
      }
    );

    res.json({
      success: true,
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get bookings for a user.
 * GET /api/bookings?userId=demo-user
 */
const getBookings = async (req, res, next) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId query parameter is required',
      });
    }

    const bookings = await Booking.find({ userId })
      .populate({
        path: 'event',
        select: 'title date time category price imageUrl',
        populate: { path: 'venue', select: 'name' },
      })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get a single booking by ID.
 * GET /api/bookings/:id
 */
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'event',
        populate: { path: 'venue', select: 'name rows columns' },
      })
      .lean();

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
      });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  holdSeats,
  confirmBooking,
  cancelBooking,
  getBookings,
  getBookingById,
};
