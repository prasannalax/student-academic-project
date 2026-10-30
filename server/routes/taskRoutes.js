const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  toggleTaskComplete,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router
  .route('/')
  .get(protect, getTasks)
  .post(protect, upload.single('file'), createTask);

router.put('/:id/toggle-complete', protect, toggleTaskComplete);

router
  .route('/:id')
  .put(protect, upload.single('file'), updateTask)
  .delete(protect, deleteTask);

module.exports = router;
