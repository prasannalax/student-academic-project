const Report = require('../models/Report');
const Note = require('../models/Note');
const Notification = require('../models/Notification');
const fs = require('fs');
const path = require('path');

// @desc    Submit a report on a note
// @route   POST /api/reports
// @access  Private (Student, Teacher, Admin)
const createReport = async (req, res, next) => {
  try {
    const { noteId, reason, description } = req.body;

    if (!noteId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide noteId and reason for reporting',
      });
    }

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    // Check if user already reported this note
    const existingReport = await Report.findOne({
      note: noteId,
      reportedBy: req.user._id,
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a report for this note. An administrator is reviewing it.',
      });
    }

    const report = await Report.create({
      note: noteId,
      noteTitle: note.title,
      reportedBy: req.user._id,
      reporterName: req.user.name,
      reporterEmail: req.user.email,
      reason,
      description: description ? description.trim() : '',
      status: 'Pending',
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Thank you for helping keep academic resources accurate.',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reports (with filter by status)
// @route   GET /api/reports
// @access  Private (Admin only)
const getReports = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    const reports = await Report.find(filter)
      .populate('note', 'title subject topic uploaderName fileUrl department semester isTeacherMaterial status')
      .populate('reportedBy', 'name email department')
      .populate('resolvedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update report status and take moderation action
// @route   PUT /api/reports/:id
// @access  Private (Admin only)
const updateReport = async (req, res, next) => {
  try {
    const { status, adminNotes, deleteNote: shouldDeleteNote } = req.body;

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (status) {
      report.status = status;
      if (status === 'Resolved' || status === 'Reviewed') {
        report.resolvedBy = req.user._id;
        report.resolvedAt = new Date();
      }
    }

    if (adminNotes !== undefined) {
      report.adminNotes = adminNotes;
    }

    await report.save();

    // If admin opted to delete or flag the inappropriate note
    if (shouldDeleteNote) {
      const note = await Note.findById(report.note);
      if (note) {
        const filename = path.basename(note.fileUrl);
        const filePath = path.join(__dirname, '../uploads/notes', filename);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (e) {
            console.error('File unlink error:', e);
          }
        }
        await Note.findByIdAndDelete(note._id);
      }
    }

    // Notify the reporter that their report has been reviewed
    try {
      await Notification.create({
        recipient: report.reportedBy,
        title: `Report Update: ${report.noteTitle}`,
        message: `Your report regarding "${report.noteTitle}" has been marked as ${report.status} by administration. ${
          adminNotes ? `Admin note: ${adminNotes}` : ''
        }`,
        type: 'report',
        relatedId: report.note.toString(),
      });
    } catch (notifErr) {
      console.error('Notification error:', notifErr.message);
    }

    res.json({
      success: true,
      message: `Report status updated to ${report.status}`,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createReport, getReports, updateReport };
