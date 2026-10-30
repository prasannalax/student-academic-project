const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an assignment title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide assignment instructions or description'],
    },
    subject: {
      type: String,
      required: [true, 'Please specify subject'],
      trim: true,
    },
    department: {
      type: String,
      default: 'CSE',
      trim: true,
    },
    targetSection: {
      type: String,
      enum: ['CSE 1', 'CSE 2', 'CSE 3', 'CSE 4', 'All CSE Sections'],
      default: 'All CSE Sections',
    },
    semester: {
      type: String,
      required: [true, 'Please specify semester'],
      trim: true,
    },
    deadline: {
      type: Date,
      required: [true, 'Please provide a deadline'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    creatorName: {
      type: String,
      required: true,
    },
    attachmentUrl: {
      type: String,
      default: '',
    },
    originalFileName: {
      type: String,
      default: '',
    },
    completedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isClosed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

assignmentSchema.index({ department: 1, targetSection: 1, semester: 1, deadline: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
