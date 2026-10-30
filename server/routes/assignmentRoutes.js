const express = require('express');
const router = express.Router();
const {
  createAssignment,
  getAssignments,
  toggleComplete,
  updateAssignment,
  deleteAssignment,
} = require('../controllers/assignmentController');
const { protect, authorizeRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router
  .route('/')
  .get(protect, getAssignments)
  .post(
    protect,
    authorizeRole('teacher', 'faculty', 'admin'),
    upload.single('file'),
    createAssignment
  );

router.put('/:id/toggle-complete', protect, toggleComplete);

router
  .route('/:id')
  .put(
    protect,
    authorizeRole('teacher', 'faculty', 'admin'),
    upload.single('file'),
    updateAssignment
  )
  .delete(protect, authorizeRole('teacher', 'faculty', 'admin'), deleteAssignment);

module.exports = router;
