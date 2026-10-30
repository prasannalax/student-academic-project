const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');
const fs = require('fs');
const path = require('path');
const { DEPARTMENT } = require('../config/sections');

// @desc    Create a new section task
// @route   POST /api/tasks
// @access  Private (Teacher, Faculty, Student, Admin)
const createTask = async (req, res, next) => {
  try {
    const { title, description, subject, semester, deadline, targetSection } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required',
      });
    }

    const isFaculty =
      req.user.role === 'teacher' ||
      req.user.role === 'faculty' ||
      req.user.role === 'admin';

    // If student creates, lock to student's section
    const resolvedSection = isFaculty
      ? (targetSection || 'All CSE Sections')
      : (req.user.section || 'All CSE Sections');

    let attachmentUrl = '';
    let originalFileName = '';

    if (req.file) {
      attachmentUrl = `/uploads/assignments/${req.file.filename}`;
      originalFileName = req.file.originalname;
    }

    const task = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      subject: subject ? subject.trim() : '',
      department: DEPARTMENT,
      targetSection: resolvedSection,
      semester: semester || 'Semester 1',
      deadline: deadline ? new Date(deadline) : null,
      createdBy: req.user._id,
      creatorName: req.user.name,
      creatorRole: req.user.role,
      attachmentUrl,
      originalFileName,
    });

    // Notify targeted section students
    try {
      const studentFilter = {
        role: 'student',
        department: DEPARTMENT,
        _id: { $ne: req.user._id },
      };

      if (resolvedSection !== 'All CSE Sections') {
        studentFilter.section = resolvedSection;
      }

      const students = await User.find(studentFilter).select('_id');
      if (students.length > 0) {
        const notifs = students.map((st) => ({
          recipient: st._id,
          title: `New Task (${resolvedSection}): ${title}`,
          message: `${req.user.name} posted a new academic task for ${resolvedSection}.`,
          type: 'task',
          relatedId: task._id.toString(),
        }));
        await Notification.insertMany(notifs);
      }
    } catch (notifErr) {
      console.error('Task notification warning:', notifErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get section tasks (filtered by student's section)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const { targetSection, subject, isClosed } = req.query;
    const query = { department: DEPARTMENT };

    // Student section isolation
    if (req.user && req.user.role === 'student' && req.user.section) {
      query.targetSection = { $in: [req.user.section, 'All CSE Sections'] };
    } else if (targetSection && targetSection !== 'All') {
      query.targetSection = targetSection;
    }

    if (subject && subject !== 'All') {
      query.subject = new RegExp(subject, 'i');
    }

    if (isClosed !== undefined) {
      query.isClosed = isClosed === 'true';
    }

    const tasks = await Task.find(query)
      .populate('createdBy', 'name email role section')
      .sort({ deadline: 1, createdAt: -1 });

    const formatted = tasks.map((t) => {
      const obj = t.toObject();
      obj.isCompletedByMe = t.completedBy.some(
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
// @route   PUT /api/tasks/:id/toggle-complete
// @access  Private
const toggleTaskComplete = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const userIdStr = req.user._id.toString();
    const index = task.completedBy.findIndex(
      (id) => id.toString() === userIdStr
    );

    let completed = false;
    if (index > -1) {
      task.completedBy.splice(index, 1);
      completed = false;
    } else {
      task.completedBy.push(req.user._id);
      completed = true;
    }

    await task.save();

    res.json({
      success: true,
      message: completed ? 'Task marked as completed' : 'Task marked as pending',
      isCompletedByMe: completed,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private (Creator or Admin)
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (
      task.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task',
      });
    }

    const { title, description, subject, semester, deadline, isClosed, targetSection } =
      req.body;

    if (title) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (subject !== undefined) task.subject = subject.trim();
    if (semester) task.semester = semester;
    if (deadline) task.deadline = new Date(deadline);
    if (isClosed !== undefined) task.isClosed = isClosed;
    if (targetSection) task.targetSection = targetSection;

    if (req.file) {
      task.attachmentUrl = `/uploads/assignments/${req.file.filename}`;
      task.originalFileName = req.file.originalname;
    }

    await task.save();

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Creator or Admin)
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (
      task.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this task',
      });
    }

    if (task.attachmentUrl) {
      const filename = path.basename(task.attachmentUrl);
      const filePath = path.join(__dirname, '../uploads/assignments', filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error('File unlink error:', e);
        }
      }
    }

    await Task.findByIdAndDelete(task._id);

    res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  toggleTaskComplete,
  updateTask,
  deleteTask,
};
