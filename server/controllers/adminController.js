const User = require('../models/User');
const Note = require('../models/Note');
const Report = require('../models/Report');
const Assignment = require('../models/Assignment');
const Announcement = require('../models/Announcement');

// @desc    Get system-wide platform statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getPlatformStats = async (req, res, next) => {
  try {
    const [
      totalStudents,
      totalTeachers,
      totalAdmins,
      totalNotes,
      teacherNotes,
      pendingReports,
      totalReports,
      totalAssignments,
      totalAnnouncements,
      notesAggregation,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'teacher' }),
      User.countDocuments({ role: 'admin' }),
      Note.countDocuments({ status: 'active' }),
      Note.countDocuments({ isTeacherMaterial: true, status: 'active' }),
      Report.countDocuments({ status: 'Pending' }),
      Report.countDocuments(),
      Assignment.countDocuments(),
      Announcement.countDocuments(),
      Note.aggregate([
        {
          $group: {
            _id: null,
            totalDownloads: { $sum: '$downloadCount' },
            totalViews: { $sum: '$viewCount' },
            avgRating: { $avg: '$averageRating' },
          },
        },
      ]),
    ]);

    // Department breakdown
    const departmentBreakdown = await Note.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const aggregateMetrics = notesAggregation[0] || {
      totalDownloads: 0,
      totalViews: 0,
      avgRating: 0,
    };

    res.json({
      success: true,
      data: {
        users: {
          students: totalStudents,
          teachers: totalTeachers,
          admins: totalAdmins,
          total: totalStudents + totalTeachers + totalAdmins,
        },
        notes: {
          total: totalNotes,
          teacherNotes,
          studentNotes: totalNotes - teacherNotes,
          totalDownloads: aggregateMetrics.totalDownloads,
          totalViews: aggregateMetrics.totalViews,
          averageRating: Math.round(aggregateMetrics.avgRating * 10) / 10,
        },
        moderation: {
          pendingReports,
          totalReports,
        },
        activities: {
          totalAssignments,
          totalAnnouncements,
        },
        departmentBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with search and role filters
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getUsers = async (req, res, next) => {
  try {
    const { role, department, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role && role !== 'All') query.role = role;
    if (department && department !== 'All') query.department = department;

    if (search && search.trim() !== '') {
      const s = search.trim();
      const regex = new RegExp(s, 'i');
      query.$or = [{ name: regex }, { email: regex }, { rollOrEmployeeId: regex }];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      count: users.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role or active status
// @route   PUT /api/admin/users/:id
// @access  Private (Admin only)
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { role, isActive, department, semester } = req.body;

    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (department) user.department = department;
    if (semester) user.semester = semester;

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Protect super admin self-deletion
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own administrative account',
      });
    }

    await User.findByIdAndDelete(user._id);

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPlatformStats, getUsers, updateUser, deleteUser };
