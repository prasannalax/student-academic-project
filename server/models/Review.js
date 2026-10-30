const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    note: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userRole: {
      type: String,
      default: 'student',
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating between 1 and 5'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// One review per user per note
reviewSchema.index({ note: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
