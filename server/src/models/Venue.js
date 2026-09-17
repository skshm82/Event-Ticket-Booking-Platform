const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Venue name is required'],
      trim: true,
      maxlength: [100, 'Venue name cannot exceed 100 characters'],
    },
    rows: {
      type: Number,
      required: [true, 'Number of rows is required'],
      min: [1, 'Must have at least 1 row'],
      max: [26, 'Cannot exceed 26 rows (A-Z)'],
    },
    columns: {
      type: Number,
      required: [true, 'Number of columns is required'],
      min: [1, 'Must have at least 1 column'],
      max: [50, 'Cannot exceed 50 columns'],
    },
    totalSeats: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate totalSeats before saving
venueSchema.pre('save', function (next) {
  this.totalSeats = this.rows * this.columns;
  next();
});

module.exports = mongoose.model('Venue', venueSchema);
