const path = require('path');
const fs = require('fs');
const NoteRequest = require('../models/NoteRequest');
const Note = require('../models/Note');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { DEPARTMENT } = require('../config/sections');

// @desc    Create a new notes request (student to same-section classmates only)
// @route   POST /api/note-requests
// @access  Private (Student only)
const createNoteRequest = async (req, res, next) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can request class notes from classmates.',
      });
    }

    if (!req.user.section) {
      return res.status(400).json({
        success: false,
        message: 'You must have an assigned section to request notes.',
      });
    }

    const { subject, topic, classDate, description } = req.body;

    if (!subject || !topic || !classDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide subject name, topic, and the class lecture date.',
      });
    }

    const noteRequest = await NoteRequest.create({
      requester: req.user._id,
      requesterName: req.user.name,
      department: DEPARTMENT,
      section: req.user.section,
      semester: req.user.semester || 'Semester 1',
      subject: subject.trim(),
      topic: topic.trim(),
      classDate: new Date(classDate),
      description: description ? description.trim() : '',
      status: 'Pending',
    });

    // Notify ONLY fellow classmates in the same section
    // STRICT RULE: Never notify teachers, faculty, or students of other sections
    try {
      const classmates = await User.find({
        role: 'student',
        section: req.user.section,
        _id: { $ne: req.user._id },
        isActive: true,
      }).select('_id');

      if (classmates.length > 0) {
        const dateStr = new Date(classDate).toLocaleDateString();
        const notificationsData = classmates.map((st) => ({
          recipient: st._id,
          title: `Notes Request (${req.user.section}): ${subject}`,
          message: `${req.user.name} requested notes for "${topic}" on ${dateStr}.`,
          type: 'notes_request',
          relatedId: noteRequest._id.toString(),
        }));

        await Notification.insertMany(notificationsData);
      }
    } catch (notifErr) {
      console.error('Notes request notification warning:', notifErr.message);
    }

    res.status(201).json({
      success: true,
      message: `Notes request submitted and sent to ${req.user.section} classmates.`,
      data: noteRequest,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get notes requests for current student's section
// @route   GET /api/note-requests
// @access  Private (Student, Admin)
const getNoteRequests = async (req, res, next) => {
  try {
    if (req.user.role === 'teacher' || req.user.role === 'faculty') {
      return res.status(403).json({
        success: false,
        message: 'Faculty members cannot access student-to-student notes requests.',
      });
    }

    const { status, subject, myRequests } = req.query;
    const query = {};

    // Strictly isolate to student's section
    if (req.user.role === 'student') {
      query.section = req.user.section;
    }

    // Filter by my requests if requested
    if (myRequests === 'true') {
      query.requester = req.user._id;
    }

    // Status filter
    if (status && status !== 'All') {
      query.status = status;
    }

    // Subject filter
    if (subject && subject !== 'All') {
      query.subject = new RegExp(`^${subject}$`, 'i');
    }

    const requests = await NoteRequest.find(query)
      .populate('requester', 'name email department section rollNumber rollOrEmployeeId')
      .populate('fulfilledNote', 'title fileUrl originalFileName fileType fileSize averageRating downloadCount section')
      .populate('fulfilledBy', 'name role section')
      .populate('responses.note', 'title fileUrl originalFileName fileType section')
      .populate('responses.responder', 'name section')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single note request by ID
// @route   GET /api/note-requests/:id
// @access  Private (Student, Admin)
const getNoteRequestById = async (req, res, next) => {
  try {
    if (req.user.role === 'teacher' || req.user.role === 'faculty') {
      return res.status(403).json({
        success: false,
        message: 'Faculty members cannot access student-to-student notes requests.',
      });
    }

    const request = await NoteRequest.findById(req.params.id)
      .populate('requester', 'name email department section rollNumber rollOrEmployeeId')
      .populate('fulfilledNote')
      .populate('fulfilledBy', 'name role section')
      .populate('responses.note')
      .populate('responses.responder', 'name section');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Notes request not found' });
    }

    // Check same section if student
    if (
      req.user.role === 'student' &&
      request.section !== req.user.section
    ) {
      return res.status(403).json({
        success: false,
        message: `You can only view notes requests from your own section (${req.user.section}).`,
      });
    }

    res.json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Respond to notes request by uploading requested notes
// @route   POST /api/note-requests/:id/respond
// @access  Private (Student only)
const respondToNoteRequest = async (req, res, next) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can respond to student notes requests.',
      });
    }

    const request = await NoteRequest.findById(req.params.id);
    if (!request) {
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ success: false, message: 'Notes request not found' });
    }

    // Confirm responder is in the same section
    if (request.section !== req.user.section) {
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(403).json({
        success: false,
        message: `You can only fulfill notes requests from your own section (${req.user.section}).`,
      });
    }

    if (request.status === 'Closed') {
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'This request has already been closed by the requester.',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please attach the document file to fulfill this notes request.',
      });
    }

    const { title, message } = req.body;
    const noteTitle =
      title && title.trim() !== ''
        ? title.trim()
        : `${request.subject} - ${request.topic} (Requested Notes)`;

    // Create the Note document in the notes library locked to this section
    const note = await Note.create({
      title: noteTitle,
      subject: request.subject,
      topic: request.topic,
      description: message || `Uploaded in response to a class request by ${request.requesterName}.`,
      fileUrl: `/uploads/notes/${req.file.filename}`,
      originalFileName: req.file.originalname,
      fileType: path.extname(req.file.originalname).replace('.', '').toUpperCase(),
      fileSize: req.file.size,
      uploader: req.user._id,
      uploaderName: req.user.name,
      uploaderRole: 'student',
      department: DEPARTMENT,
      section: req.user.section,
      targetSection: req.user.section,
      semester: request.semester,
      classDate: request.classDate,
      isTeacherMaterial: false,
      status: 'active',
    });

    // Add response to the request and mark fulfilled
    request.responses.push({
      note: note._id,
      responder: req.user._id,
      responderName: req.user.name,
      message: message ? message.trim() : '',
      createdAt: new Date(),
    });

    request.fulfilledNote = note._id;
    request.fulfilledBy = req.user._id;
    request.status = 'Fulfilled';
    await request.save();

    // Notify the requesting student
    try {
      await Notification.create({
        recipient: request.requester,
        title: `Notes Request Fulfilled: ${request.subject}`,
        message: `${req.user.name} uploaded notes for your request on "${request.topic}"!`,
        type: 'request_fulfilled',
        relatedId: note._id.toString(),
      });
    } catch (notifErr) {
      console.error('Notification error on fulfillment:', notifErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Thank you! Your notes have been shared with your section and the request is marked as fulfilled.',
      data: {
        request,
        note,
      },
    });
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// @desc    Update request status (Mark as Fulfilled or Closed)
// @route   PUT /api/note-requests/:id/status
// @access  Private (Requester or Admin)
const updateNoteRequestStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Fulfilled', 'Closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be Pending, Fulfilled, or Closed.',
      });
    }

    const request = await NoteRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Notes request not found' });
    }

    // Only requester or admin can update status
    if (
      request.requester.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Only the requesting student or an administrator can update this status.',
      });
    }

    request.status = status;
    await request.save();

    res.json({
      success: true,
      message: `Notes request status updated to ${status}.`,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a note request
// @route   DELETE /api/note-requests/:id
// @access  Private (Requester or Admin)
const deleteNoteRequest = async (req, res, next) => {
  try {
    const request = await NoteRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Notes request not found' });
    }

    if (
      request.requester.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this request.',
      });
    }

    await NoteRequest.findByIdAndDelete(request._id);

    res.json({
      success: true,
      message: 'Notes request deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createNoteRequest,
  getNoteRequests,
  getNoteRequestById,
  respondToNoteRequest,
  updateNoteRequestStatus,
  deleteNoteRequest,
};
