const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    note: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note',
      required: true,
    },
    noteTitle: {
      type: String,
      required: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reporterName: {
      type: String,
      required: true,
    },
    reporterEmail: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: [true, 'Please select a reason for reporting'],
      enum: ['Incorrect', 'Irrelevant', 'Duplicate', 'Inappropriate'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Reviewed', 'Resolved'],
      default: 'Pending',
    },
    adminNotes: {
      type: String,
      default: '',
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reports from the same user on the same note
reportSchema.index({ note: 1, reportedBy: 1 }, { unique: true });

module.exports = mongoose.model('Report', reportSchema);
