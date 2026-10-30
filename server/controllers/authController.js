const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
  DEPARTMENT,
  getSectionFromRoll,
  validateCollegeEmail,
  MIN_ROLL_STR,
  MAX_ROLL_STR,
} = require('../config/sections');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'super_secret_academic_companion_jwt_key_2026!',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new user (with CSE validation & section auto-mapping)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const {
      name,
      rollNumber,
      email,
      password,
      confirmPassword,
      role = 'student',
      semester,
      bio,
    } = req.body;

    // Faculty / Teacher registration
    if (role === 'teacher' || role === 'faculty') {
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide name, email, and password for faculty registration.',
        });
      }

      if (confirmPassword && password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Passwords do not match.',
        });
      }

      const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'A faculty member with this email address is already registered.',
        });
      }

      const faculty = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        role: 'faculty',
        department: DEPARTMENT,
        section: null,
        semester: semester || 'All Semesters',
        rollOrEmployeeId: rollNumber ? rollNumber.trim() : 'FAC-CSE',
        bio: bio || '',
      });

      const token = generateToken(faculty._id);
      return res.status(201).json({
        success: true,
        message: 'Faculty account registered successfully',
        token,
        user: {
          id: faculty._id,
          name: faculty.name,
          email: faculty.email,
          role: faculty.role,
          department: faculty.department,
          section: faculty.section,
          semester: faculty.semester,
          rollOrEmployeeId: faculty.rollOrEmployeeId,
          bio: faculty.bio,
        },
      });
    }

    // Student Registration
    if (!name || !rollNumber || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: Name, Roll Number, College Email, and Password.',
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password and Confirm Password do not match.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const cleanRoll = String(rollNumber).trim();
    const cleanEmail = String(email).trim().toLowerCase();

    // 1. Validate CSE roll number range and auto-identify section
    const identifiedSection = getSectionFromRoll(cleanRoll);
    if (!identifiedSection) {
      return res.status(400).json({
        success: false,
        message: `Only CSE students with roll numbers between ${MIN_ROLL_STR} and ${MAX_ROLL_STR} are eligible to register. ECE, EEE, and other department roll numbers are not permitted.`,
      });
    }

    // 2. Validate college email format and roll number correlation
    const emailValidation = validateCollegeEmail(cleanEmail, cleanRoll);
    if (!emailValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: emailValidation.error,
      });
    }

    // 3. Check duplicate roll number
    const existingRoll = await User.findOne({ rollNumber: cleanRoll });
    if (existingRoll) {
      return res.status(400).json({
        success: false,
        message: `A student with roll number ${cleanRoll} is already registered.`,
      });
    }

    // 4. Check duplicate email
    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: `A user with email ${cleanEmail} is already registered.`,
      });
    }

    // 5. Create student record with auto-assigned section and department CSE
    const user = await User.create({
      name: name.trim(),
      rollNumber: cleanRoll,
      email: cleanEmail,
      password,
      role: 'student',
      department: DEPARTMENT,
      section: identifiedSection,
      semester: semester || 'Semester 1',
      rollOrEmployeeId: cleanRoll,
      bio: bio || '',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: `Account registered successfully! Assigned to ${identifiedSection}.`,
      token,
      user: {
        id: user._id,
        name: user.name,
        rollNumber: user.rollNumber,
        email: user.email,
        role: user.role,
        department: user.department,
        section: user.section,
        semester: user.semester,
        rollOrEmployeeId: user.rollOrEmployeeId,
        bio: user.bio,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token (login by roll number or college email)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, rollNumber, identifier, password } = req.body;
    const loginIdentifier = (identifier || rollNumber || email || '').trim();

    if (!loginIdentifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your Roll Number or College Email and Password.',
      });
    }

    // Find by roll number or lowercase email or employee ID
    const user = await User.findOne({
      $or: [
        { rollNumber: loginIdentifier },
        { email: loginIdentifier.toLowerCase() },
        { rollOrEmployeeId: loginIdentifier },
      ],
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your roll number/email and password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Please contact an administrator.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your password.',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        rollNumber: user.rollNumber,
        email: user.email,
        role: user.role,
        department: user.department,
        section: user.section,
        semester: user.semester,
        rollOrEmployeeId: user.rollOrEmployeeId,
        bio: user.bio,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      rollNumber: req.user.rollNumber,
      email: req.user.email,
      role: req.user.role,
      department: req.user.department,
      section: req.user.section,
      semester: req.user.semester,
      rollOrEmployeeId: req.user.rollOrEmployeeId,
      bio: req.user.bio,
      createdAt: req.user.createdAt,
    },
  });
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, semester, bio } = req.body;
    if (name) user.name = name.trim();
    if (semester) user.semester = semester;
    if (bio !== undefined) user.bio = bio;

    // Notice: rollNumber, department, and section are locked and cannot be edited by students.

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        rollNumber: user.rollNumber,
        email: user.email,
        role: user.role,
        department: user.department,
        section: user.section,
        semester: user.semester,
        rollOrEmployeeId: user.rollOrEmployeeId,
        bio: user.bio,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser, loginUser, getMe, updateProfile };
