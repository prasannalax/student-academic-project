const jwt = require('jsonwebtoken');
const User = require('../models/User');

const extractToken = (req) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    return req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    return req.query.token;
  }
  return null;
};

const protect = async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Please log in.',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'super_secret_academic_companion_jwt_key_2026!'
    );

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact an administrator.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token. Please log in again.',
    });
  }
};

const optionalAuth = async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'super_secret_academic_companion_jwt_key_2026!'
    );

    const user = await User.findById(decoded.id);
    if (user && user.isActive) {
      req.user = user;
    }
  } catch (error) {
    // Ignore invalid optional tokens and proceed unauthenticated
  }

  next();
};

const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'unauthenticated'}' is not authorized to access this action.`,
      });
    }
    next();
  };
};

module.exports = { protect, optionalAuth, authorizeRole };
