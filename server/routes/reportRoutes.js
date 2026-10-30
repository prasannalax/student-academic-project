const express = require('express');
const router = express.Router();
const {
  createReport,
  getReports,
  updateReport,
} = require('../controllers/reportController');
const { protect, authorizeRole } = require('../middleware/authMiddleware');

router
  .route('/')
  .post(protect, createReport)
  .get(protect, authorizeRole('admin'), getReports);

router.route('/:id').put(protect, authorizeRole('admin'), updateReport);

module.exports = router;
