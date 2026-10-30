const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a task title'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    subject: {
      type: String,
      trim: true,
      default: '',
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
      default: 'Semester 1',
      trim: true,
    },
    deadline: {
      type: Date,
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
    creatorRole: {
      type: String,
      enum: ['student', 'teacher', 'faculty', 'admin'],
      default: 'teacher',
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

taskSchema.index({ targetSection: 1, department: 1, deadline: 1, createdAt: -1 });

module.exports = mongoose.model('Task', taskSchema);
