const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a note title'],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Please add a subject name'],
      trim: true,
    },
    topic: {
      type: String,
      required: [true, 'Please add a topic'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    fileUrl: {
      type: String,
      required: [true, 'Note file is required'],
    },
    originalFileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    uploaderName: {
      type: String,
      required: true,
    },
    uploaderRole: {
      type: String,
      enum: ['student', 'teacher', 'faculty', 'admin'],
      required: true,
    },
    department: {
      type: String,
      default: 'CSE',
      trim: true,
    },
    section: {
      type: String,
      enum: ['CSE 1', 'CSE 2', 'CSE 3', 'CSE 4', 'All CSE Sections', null],
      default: null,
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
    classDate: {
      type: Date,
      required: [true, 'Please provide the class date'],
    },
    isTeacherMaterial: {
      type: Boolean,
      default: false,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'flagged', 'archived'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Text index for search functionality
noteSchema.index({
  title: 'text',
  subject: 'text',
  topic: 'text',
  description: 'text',
  uploaderName: 'text',
});

// Compound indexes for rapid filtering
noteSchema.index({ section: 1, targetSection: 1, isTeacherMaterial: 1, createdAt: -1 });
noteSchema.index({ department: 1, subject: 1, classDate: -1 });
noteSchema.index({ averageRating: -1 });

module.exports = mongoose.model('Note', noteSchema);
