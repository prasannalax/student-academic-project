const mongoose = require('mongoose');

const noteRequestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requesterName: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      default: 'CSE',
      trim: true,
    },
    section: {
      type: String,
      required: [true, 'Student section is required for note requests'],
      trim: true,
    },
    semester: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Please provide subject name'],
      trim: true,
    },
    topic: {
      type: String,
      required: [true, 'Please specify the topic needed'],
      trim: true,
    },
    classDate: {
      type: Date,
      required: [true, 'Please specify the lecture date for the notes needed'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Fulfilled', 'Closed'],
      default: 'Pending',
    },
    responses: [
      {
        note: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Note',
        },
        responder: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        responderName: {
          type: String,
        },
        message: {
          type: String,
          default: '',
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    fulfilledNote: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note',
    },
    fulfilledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

noteRequestSchema.index({ section: 1, status: 1, createdAt: -1 });
noteRequestSchema.index({ department: 1, semester: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('NoteRequest', noteRequestSchema);
