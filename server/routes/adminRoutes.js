const express = require('express');
const router = express.Router();
const {
  getPlatformStats,
  getUsers,
  updateUser,
  deleteUser,
} = require('../controllers/adminController');
const { protect, authorizeRole } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorizeRole('admin'));

router.get('/stats', getPlatformStats);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
