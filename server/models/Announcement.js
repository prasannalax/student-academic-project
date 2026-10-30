const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add announcement title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide announcement details'],
    },
    category: {
      type: String,
      enum: ['Exam', 'Internship', 'Workshop', 'Seminar', 'Holiday', 'General'],
      default: 'General',
    },
    targetDepartment: {
      type: String,
      default: 'CSE',
      trim: true,
    },
    targetSection: {
      type: String,
      enum: ['CSE 1', 'CSE 2', 'CSE 3', 'CSE 4', 'All CSE Sections'],
      default: 'All CSE Sections',
    },
    expiryDate: {
      type: Date,
    },
    attachmentUrl: {
      type: String,
      default: '',
    },
    originalFileName: {
      type: String,
      default: '',
    },
    link: {
      type: String,
      default: '',
    },
    isImportant: {
      type: Boolean,
      default: false,
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
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

announcementSchema.index({ createdAt: -1 });
announcementSchema.index({ category: 1, targetDepartment: 1, targetSection: 1 });

module.exports = mongoose.model('Announcement', announcementSchema);
