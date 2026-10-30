const express = require('express');
const router = express.Router();
const {
  createNote,
  getNotes,
  getNoteById,
  downloadNote,
  updateNote,
  deleteNote,
  getCategoriesHierarchy,
} = require('../controllers/noteController');
const {
  addOrUpdateReview,
  getNoteReviews,
} = require('../controllers/reviewController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Category hierarchy route (must precede /:id)
router.get('/categories/hierarchy', optionalAuth, getCategoriesHierarchy);

router
  .route('/')
  .get(optionalAuth, getNotes)
  .post(protect, upload.single('file'), createNote);

// Specific sub-resource route before generic /:id
router.get('/:id/download', optionalAuth, downloadNote);

// Nested reviews endpoints
router
  .route('/:id/reviews')
  .get(getNoteReviews)
  .post(protect, addOrUpdateReview);

router
  .route('/:id')
  .get(optionalAuth, getNoteById)
  .put(protect, updateNote)
  .delete(protect, deleteNote);

module.exports = router;
