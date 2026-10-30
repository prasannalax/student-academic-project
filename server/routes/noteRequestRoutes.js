const express = require('express');
const router = express.Router();
const {
  createNoteRequest,
  getNoteRequests,
  getNoteRequestById,
  respondToNoteRequest,
  updateNoteRequestStatus,
  deleteNoteRequest,
} = require('../controllers/noteRequestController');
const { protect, authorizeRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Route for creating requests (Students only) & listing requests (Students & Admins, never teachers)
router
  .route('/')
  .post(protect, authorizeRole('student'), createNoteRequest)
  .get(protect, authorizeRole('student', 'admin'), getNoteRequests);

router
  .route('/:id')
  .get(protect, authorizeRole('student', 'admin'), getNoteRequestById)
  .delete(protect, authorizeRole('student', 'admin'), deleteNoteRequest);

// Respond to a classmate's request with notes file (Students only)
router.post(
  '/:id/respond',
  protect,
  authorizeRole('student'),
  upload.single('file'),
  respondToNoteRequest
);

// Update status (Pending / Fulfilled / Closed)
router.put(
  '/:id/status',
  protect,
  authorizeRole('student', 'admin'),
  updateNoteRequestStatus
);

module.exports = router;
