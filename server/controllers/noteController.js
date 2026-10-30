const fs = require('fs');
const path = require('path');
const Note = require('../models/Note');
const Review = require('../models/Review');
const Report = require('../models/Report');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { DEPARTMENT } = require('../config/sections');

// @desc    Upload a new note (with section isolation)
// @route   POST /api/notes
// @access  Private (Student, Teacher, Faculty, Admin)
const createNote = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please attach a document file (PDF, PPT, DOC, Image, etc.)',
      });
    }

    const {
      title,
      subject,
      topic,
      description,
      department,
      semester,
      classDate,
      targetSection,
    } = req.body;

    if (!title || !subject || !topic || !semester || !classDate) {
      if (req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, subject, topic, semester, and classDate',
      });
    }

    const isFaculty =
      req.user.role === 'teacher' ||
      req.user.role === 'faculty' ||
      req.user.role === 'admin';

    // Student note is strictly locked to student's assigned section
    const noteSection = isFaculty
      ? (targetSection || 'All CSE Sections')
      : req.user.section;

    const noteTargetSection = isFaculty
      ? (targetSection || 'All CSE Sections')
      : req.user.section;

    const note = await Note.create({
      title: title.trim(),
      subject: subject.trim(),
      topic: topic.trim(),
      description: description || '',
      fileUrl: `/uploads/notes/${req.file.filename}`,
      originalFileName: req.file.originalname,
      fileType: path.extname(req.file.originalname).replace('.', '').toUpperCase(),
      fileSize: req.file.size,
      uploader: req.user._id,
      uploaderName: req.user.name,
      uploaderRole: req.user.role,
      department: DEPARTMENT,
      section: noteSection,
      targetSection: noteTargetSection,
      semester: semester || 'Semester 1',
      classDate: new Date(classDate),
      isTeacherMaterial: isFaculty,
      status: 'active',
    });

    // Notify appropriate audience
    try {
      if (isFaculty) {
        // Faculty upload: notify all students or targeted section students
        const studentQuery = {
          role: 'student',
          department: DEPARTMENT,
          _id: { $ne: req.user._id },
        };
        if (noteTargetSection !== 'All CSE Sections') {
          studentQuery.section = noteTargetSection;
        }

        const eligibleStudents = await User.find(studentQuery).select('_id');
        if (eligibleStudents.length > 0) {
          const notificationsData = eligibleStudents.map((st) => ({
            recipient: st._id,
            title: `New Faculty Material: ${subject}`,
            message: `${req.user.name} posted notes on "${topic}" (${title}) for ${noteTargetSection}.`,
            type: 'teacher_material',
            relatedId: note._id.toString(),
          }));
          await Notification.insertMany(notificationsData);
        }
      } else {
        // Student upload: notify ONLY classmates in the same section!
        if (req.user.section) {
          const eligibleClassmates = await User.find({
            role: 'student',
            section: req.user.section,
            _id: { $ne: req.user._id },
          }).select('_id');

          if (eligibleClassmates.length > 0) {
            const notificationsData = eligibleClassmates.map((st) => ({
              recipient: st._id,
              title: `New Note in ${req.user.section}: ${subject}`,
              message: `${req.user.name} shared notes on "${topic}" (${title}).`,
              type: 'note',
              relatedId: note._id.toString(),
            }));
            await Notification.insertMany(notificationsData);
          }
        }
      }
    } catch (notifErr) {
      console.error('Notification creation error:', notifErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Note uploaded successfully',
      data: note,
    });
  } catch (error) {
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// @desc    Get all notes with section isolation, search, filters & pagination
// @route   GET /api/notes
// @access  Public / Private
const getNotes = async (req, res, next) => {
  try {
    const {
      search,
      subject,
      topic,
      department,
      section,
      semester,
      uploader,
      startDate,
      endDate,
      classDate,
      isTeacherMaterial,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const andConditions = [{ status: 'active' }];

    // Section Isolation for students:
    // Students only see notes from their section + faculty materials for their section or all sections
    if (req.user && req.user.role === 'student' && req.user.section) {
      andConditions.push({
        $or: [
          {
            isTeacherMaterial: true,
            targetSection: { $in: [req.user.section, 'All CSE Sections'] },
          },
          {
            isTeacherMaterial: false,
            section: req.user.section,
          },
        ],
      });
    } else if (section && section !== 'All') {
      // For faculty/admin or explicit section filtering
      andConditions.push({
        $or: [
          { section: section },
          { targetSection: section },
          { targetSection: 'All CSE Sections' },
        ],
      });
    }

    // Text or regex search across title, subject, topic, description, uploaderName
    if (search && search.trim() !== '') {
      const s = search.trim();
      const regex = new RegExp(s, 'i');
      andConditions.push({
        $or: [
          { title: regex },
          { subject: regex },
          { topic: regex },
          { description: regex },
          { uploaderName: regex },
        ],
      });
    }

    if (subject && subject !== 'All') {
      andConditions.push({ subject: new RegExp(`^${subject}$`, 'i') });
    }

    if (topic && topic.trim() !== '') {
      andConditions.push({ topic: new RegExp(topic.trim(), 'i') });
    }

    if (semester && semester !== 'All') {
      andConditions.push({ semester });
    }

    if (uploader) {
      andConditions.push({ uploader });
    }

    if (isTeacherMaterial !== undefined && isTeacherMaterial !== '') {
      andConditions.push({ isTeacherMaterial: isTeacherMaterial === 'true' });
    }

    // Date filtering (by class date)
    if (classDate) {
      const target = new Date(classDate);
      const startOfDay = new Date(target.setHours(0, 0, 0, 0));
      const endOfDay = new Date(target.setHours(23, 59, 59, 999));
      andConditions.push({ classDate: { $gte: startOfDay, $lte: endOfDay } });
    } else if (startDate || endDate) {
      const dateCond = {};
      if (startDate) dateCond.$gte = new Date(startDate);
      if (endDate) dateCond.$lte = new Date(endDate);
      andConditions.push({ classDate: dateCond });
    }

    const query = andConditions.length > 1 ? { $and: andConditions } : andConditions[0];

    // Sorting
    let sortObj = { createdAt: -1 };
    if (sort === 'highest_rated') {
      sortObj = { averageRating: -1, totalReviews: -1 };
    } else if (sort === 'downloads') {
      sortObj = { downloadCount: -1 };
    } else if (sort === 'class_date_desc') {
      sortObj = { classDate: -1 };
    } else if (sort === 'class_date_asc') {
      sortObj = { classDate: 1 };
    } else if (sort === 'title_asc') {
      sortObj = { title: 1 };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [notes, total] = await Promise.all([
      Note.find(query)
        .populate('uploader', 'name email role department section')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum),
      Note.countDocuments(query),
    ]);

    res.json({
      success: true,
      count: notes.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: notes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single note by ID
// @route   GET /api/notes/:id
// @access  Public / Private
const getNoteById = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id).populate(
      'uploader',
      'name email role department section'
    );

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    // Verify section permission for student
    if (req.user && req.user.role === 'student' && req.user.section) {
      const allowed =
        (note.isTeacherMaterial &&
          (note.targetSection === 'All CSE Sections' ||
            note.targetSection === req.user.section)) ||
        (!note.isTeacherMaterial && note.section === req.user.section);

      if (!allowed) {
        return res.status(403).json({
          success: false,
          message: `Access denied: This note belongs to ${note.section || note.targetSection}. You are registered in ${req.user.section}.`,
        });
      }
    }

    // Increment view count
    note.viewCount += 1;
    await note.save({ validateBeforeSave: false });

    res.json({
      success: true,
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download note file
// @route   GET /api/notes/:id/download
// @access  Public / Private
const downloadNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    // Strict section enforcement on downloads
    if (req.user && req.user.role === 'student' && req.user.section) {
      const allowed =
        (note.isTeacherMaterial &&
          (note.targetSection === 'All CSE Sections' ||
            note.targetSection === req.user.section)) ||
        (!note.isTeacherMaterial && note.section === req.user.section);

      if (!allowed) {
        return res.status(403).json({
          success: false,
          message: `Access denied: You do not have permission to download notes belonging to ${note.section || note.targetSection}.`,
        });
      }
    }

    const filename = path.basename(note.fileUrl);
    const filePath = path.join(__dirname, '../uploads/notes', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Physical file not found on server storage',
      });
    }

    // Increment download count
    note.downloadCount += 1;
    await note.save({ validateBeforeSave: false });

    res.download(filePath, note.originalFileName);
  } catch (error) {
    next(error);
  }
};

// @desc    Update note
// @route   PUT /api/notes/:id
// @access  Private (Owner or Admin)
const updateNote = async (req, res, next) => {
  try {
    let note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    if (
      note.uploader.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this note',
      });
    }

    const { title, subject, topic, description, semester, classDate, targetSection } =
      req.body;

    if (title) note.title = title.trim();
    if (subject) note.subject = subject.trim();
    if (topic) note.topic = topic.trim();
    if (description !== undefined) note.description = description;
    if (semester) note.semester = semester;
    if (classDate) note.classDate = new Date(classDate);

    if (req.user.role === 'teacher' || req.user.role === 'faculty' || req.user.role === 'admin') {
      if (targetSection) {
        note.targetSection = targetSection;
        note.section = targetSection;
      }
    }

    await note.save();

    res.json({
      success: true,
      message: 'Note updated successfully',
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete note
// @route   DELETE /api/notes/:id
// @access  Private (Owner or Admin)
const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    if (
      note.uploader.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this note',
      });
    }

    // Remove file from disk
    const filename = path.basename(note.fileUrl);
    const filePath = path.join(__dirname, '../uploads/notes', filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Error removing file:', err);
      }
    }

    // Clean up reviews & reports associated with this note
    await Promise.all([
      Note.findByIdAndDelete(note._id),
      Review.deleteMany({ note: note._id }),
      Report.deleteMany({ note: note._id }),
    ]);

    res.json({
      success: true,
      message: 'Note and associated records removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get organized hierarchical tree of notes
// @route   GET /api/notes/categories/hierarchy
// @access  Public / Private
const getCategoriesHierarchy = async (req, res, next) => {
  try {
    const filter = { status: 'active' };

    if (req.user && req.user.role === 'student' && req.user.section) {
      filter.$or = [
        {
          isTeacherMaterial: true,
          targetSection: { $in: [req.user.section, 'All CSE Sections'] },
        },
        {
          isTeacherMaterial: false,
          section: req.user.section,
        },
      ];
    }

    const notes = await Note.find(filter)
      .select('title subject topic department section targetSection semester classDate isTeacherMaterial averageRating originalFileName')
      .sort({ subject: 1, classDate: -1 });

    const hierarchy = {};

    notes.forEach((n) => {
      const subj = n.subject || 'Uncategorized';
      if (!hierarchy[subj]) {
        hierarchy[subj] = [];
      }
      hierarchy[subj].push(n);
    });

    res.json({
      success: true,
      data: hierarchy,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createNote,
  getNotes,
  getNoteById,
  downloadNote,
  updateNote,
  deleteNote,
  getCategoriesHierarchy,
};
