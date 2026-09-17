const mongoose = require('mongoose');
const { BOOKING_STATUS } = require('../../../shared/constants');

const bookingSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event reference is required'],
    },
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      trim: true,
    },
    seats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seat',
      },
    ],
    seatLabels: [
      {
        type: String,
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.CONFIRMED,
    },
    confirmedAt: {
      type: Date,
      default: Date.now,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fetching user's booking history
bookingSchema.index({ userId: 1, createdAt: -1 });

// Index for fetching bookings by event
bookingSchema.index({ event: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
