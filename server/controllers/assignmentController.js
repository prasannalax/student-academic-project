const Assignment = require('../models/Assignment');
const User = require('../models/User');
const Notification = require('../models/Notification');
const fs = require('fs');
const path = require('path');
const { DEPARTMENT } = require('../config/sections');

// @desc    Create new assignment (with section targeting)
// @route   POST /api/assignments
// @access  Private (Teacher, Faculty, Admin)
const createAssignment = async (req, res, next) => {
  try {
    const { title, description, subject, semester, deadline, targetSection = 'All CSE Sections' } =
      req.body;

    if (!title || !description || !subject || !semester || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (title, description, subject, semester, deadline)',
      });
    }

    let attachmentUrl = '';
    let originalFileName = '';

    if (req.file) {
      attachmentUrl = `/uploads/assignments/${req.file.filename}`;
      originalFileName = req.file.originalname;
    }

    const assignment = await Assignment.create({
      title: title.trim(),
      description: description.trim(),
      subject: subject.trim(),
      department: DEPARTMENT,
      targetSection,
      semester: semester || 'Semester 1',
      deadline: new Date(deadline),
      createdBy: req.user._id,
      creatorName: req.user.name,
      attachmentUrl,
      originalFileName,
    });

    // Notify students of the assignment targeted to their section
    try {
      const studentFilter = {
        role: 'student',
        department: DEPARTMENT,
      };

      if (targetSection !== 'All CSE Sections') {
        studentFilter.section = targetSection;
      }

      const targetStudents = await User.find(studentFilter).select('_id');

      if (targetStudents.length > 0) {
        const notifs = targetStudents.map((st) => ({
          recipient: st._id,
          title: `New Assignment (${targetSection}): ${subject}`,
          message: `${req.user.name} posted "${title}". Deadline: ${new Date(
            deadline
          ).toLocaleDateString()}.`,
          type: 'assignment',
          relatedId: assignment._id.toString(),
        }));
        await Notification.insertMany(notifs);
      }
    } catch (notifErr) {
      console.error('Assignment notification warning:', notifErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Assignment published successfully',
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get assignments (with student section filtering)
// @route   GET /api/assignments
// @access  Private
const getAssignments = async (req, res, next) => {
  try {
    const { semester, subject, isClosed, targetSection } = req.query;
    const query = { department: DEPARTMENT };

    // Student section isolation: only view assignments for their section or All CSE Sections
    if (req.user && req.user.role === 'student' && req.user.section) {
      query.targetSection = { $in: [req.user.section, 'All CSE Sections'] };
    } else if (targetSection && targetSection !== 'All') {
      query.targetSection = targetSection;
    }

    if (semester && semester !== 'All') query.semester = semester;
    if (subject && subject !== 'All') query.subject = new RegExp(subject, 'i');
    if (isClosed !== undefined) query.isClosed = isClosed === 'true';

    const assignments = await Assignment.find(query)
      .populate('createdBy', 'name email role')
      .sort({ deadline: 1 });

    // Mark completion status for the requesting user
    const formatted = assignments.map((a) => {
      const obj = a.toObject();
      obj.isCompletedByMe = a.completedBy.some(
        (userId) => userId.toString() === req.user._id.toString()
      );
      return obj;
    });

    res.json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle student personal task completion
// @route   PUT /api/assignments/:id/toggle-complete
// @access  Private (Student)
const toggleComplete = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const userIdStr = req.user._id.toString();
    const index = assignment.completedBy.findIndex(
      (id) => id.toString() === userIdStr
    );

    let completed = false;
    if (index > -1) {
      assignment.completedBy.splice(index, 1);
      completed = false;
    } else {
      assignment.completedBy.push(req.user._id);
      completed = true;
    }

    await assignment.save();

    res.json({
      success: true,
      message: completed ? 'Assignment marked as completed' : 'Assignment marked as pending',
      isCompletedByMe: completed,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private (Creator or Admin)
const updateAssignment = async (req, res, next) => {
  try {
    let assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    if (
      assignment.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this assignment',
      });
    }

    const { title, description, subject, semester, deadline, isClosed, targetSection } =
      req.body;

    if (title) assignment.title = title.trim();
    if (description) assignment.description = description.trim();
    if (subject) assignment.subject = subject.trim();
    if (semester) assignment.semester = semester;
    if (targetSection) assignment.targetSection = targetSection;
    if (deadline) assignment.deadline = new Date(deadline);
    if (isClosed !== undefined) assignment.isClosed = isClosed;

    if (req.file) {
      assignment.attachmentUrl = `/uploads/assignments/${req.file.filename}`;
      assignment.originalFileName = req.file.originalname;
    }

    await assignment.save();

    res.json({
      success: true,
      message: 'Assignment updated successfully',
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private (Creator or Admin)
const deleteAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    if (
      assignment.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this assignment',
      });
    }

    if (assignment.attachmentUrl) {
      const filename = path.basename(assignment.attachmentUrl);
      const filePath = path.join(__dirname, '../uploads/assignments', filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error('File unlink error:', e);
        }
      }
    }

    await Assignment.findByIdAndDelete(assignment._id);

    res.json({
      success: true,
      message: 'Assignment removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAssignment,
  getAssignments,
  toggleComplete,
  updateAssignment,
  deleteAssignment,
};
