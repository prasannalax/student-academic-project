const Announcement = require('../models/Announcement');
const User = require('../models/User');
const Notification = require('../models/Notification');
const fs = require('fs');
const path = require('path');
const { DEPARTMENT } = require('../config/sections');

// @desc    Publish a new announcement (with section targeting)
// @route   POST /api/announcements
// @access  Private (Teacher, Faculty, Admin)
const createAnnouncement = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      targetSection = 'All CSE Sections',
      expiryDate,
      link,
      isImportant,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required',
      });
    }

    let attachmentUrl = '';
    let originalFileName = '';

    if (req.file) {
      attachmentUrl = `/uploads/notes/${req.file.filename}`;
      originalFileName = req.file.originalname;
    }

    const announcement = await Announcement.create({
      title: title.trim(),
      description: description.trim(),
      category: category || 'General',
      targetDepartment: DEPARTMENT,
      targetSection,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      attachmentUrl,
      originalFileName,
      link: link ? link.trim() : '',
      isImportant: isImportant === 'true' || isImportant === true,
      createdBy: req.user._id,
      creatorName: req.user.name,
      creatorRole: req.user.role,
    });

    // Notify targeted students
    try {
      const studentQuery = { role: 'student', department: DEPARTMENT };
      if (targetSection !== 'All CSE Sections') {
        studentQuery.section = targetSection;
      }

      const students = await User.find(studentQuery).select('_id');
      if (students.length > 0) {
        const notifs = students.map((st) => ({
          recipient: st._id,
          title: `Notice [${category || 'General'}] (${targetSection}): ${title}`,
          message: `${req.user.name} published: "${title}".`,
          type: 'announcement',
          relatedId: announcement._id.toString(),
        }));
        await Notification.insertMany(notifs);
      }
    } catch (notifErr) {
      console.error('Announcement notification warning:', notifErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Notice published successfully',
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all announcements (with student section filtering)
// @route   GET /api/announcements
// @access  Public / Private
const getAnnouncements = async (req, res, next) => {
  try {
    const { category, targetSection, search } = req.query;
    const query = { targetDepartment: DEPARTMENT };

    // Section isolation for student
    if (req.user && req.user.role === 'student' && req.user.section) {
      query.targetSection = { $in: [req.user.section, 'All CSE Sections'] };
    } else if (targetSection && targetSection !== 'All') {
      query.targetSection = targetSection;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search && search.trim() !== '') {
      const s = search.trim();
      const regex = new RegExp(s, 'i');
      query.$or = [{ title: regex }, { description: regex }];
    }

    const announcements = await Announcement.find(query).sort({
      isImportant: -1,
      createdAt: -1,
    });

    res.json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private (Creator or Admin)
const updateAnnouncement = async (req, res, next) => {
  try {
    let announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    if (
      announcement.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this notice',
      });
    }

    const {
      title,
      description,
      category,
      targetSection,
      expiryDate,
      link,
      isImportant,
    } = req.body;

    if (title) announcement.title = title.trim();
    if (description) announcement.description = description.trim();
    if (category) announcement.category = category;
    if (targetSection) announcement.targetSection = targetSection;
    if (expiryDate) announcement.expiryDate = new Date(expiryDate);
    if (link !== undefined) announcement.link = link.trim();
    if (isImportant !== undefined)
      announcement.isImportant = isImportant === 'true' || isImportant === true;

    if (req.file) {
      announcement.attachmentUrl = `/uploads/notes/${req.file.filename}`;
      announcement.originalFileName = req.file.originalname;
    }

    await announcement.save();

    res.json({
      success: true,
      message: 'Notice updated successfully',
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Creator or Admin)
const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    if (
      announcement.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this notice',
      });
    }

    if (announcement.attachmentUrl) {
      const filename = path.basename(announcement.attachmentUrl);
      const filePath = path.join(__dirname, '../uploads/notes', filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error('File unlink error:', e);
        }
      }
    }

    await Announcement.findByIdAndDelete(announcement._id);

    res.json({
      success: true,
      message: 'Notice removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAnnouncement,
  getAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
};
