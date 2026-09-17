const mongoose = require('mongoose');
const { SEAT_STATUS } = require('../../../shared/constants');

const seatSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event reference is required'],
    },
    row: {
      type: Number,
      required: true,
      min: 0,
    },
    column: {
      type: Number,
      required: true,
      min: 0,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(SEAT_STATUS),
      default: SEAT_STATUS.AVAILABLE,
    },
    heldBy: {
      type: String,
      default: null,
    },
    heldAt: {
      type: Date,
      default: null,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    version: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: one seat per row/column per event
seatSchema.index({ event: 1, row: 1, column: 1 }, { unique: true });

// Index for fetching all seats for an event efficiently
seatSchema.index({ event: 1, status: 1 });

module.exports = mongoose.model('Seat', seatSchema);
