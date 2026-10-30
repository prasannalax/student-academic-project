const express = require('express');
const router = express.Router();
const {
  createAnnouncement,
  getAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcementController');
const { protect, optionalAuth, authorizeRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router
  .route('/')
  .get(optionalAuth, getAnnouncements)
  .post(
    protect,
    authorizeRole('teacher', 'faculty', 'admin'),
    upload.single('file'),
    createAnnouncement
  );

router
  .route('/:id')
  .put(
    protect,
    authorizeRole('teacher', 'faculty', 'admin'),
    upload.single('file'),
    updateAnnouncement
  )
  .delete(protect, authorizeRole('teacher', 'faculty', 'admin'), deleteAnnouncement);

module.exports = router;
