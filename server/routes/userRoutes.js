const express = require('express');
const router = express.Router();
const { getAllUsers, hideUser } = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');
router.get('/', protect, getAllUsers);
router.patch('/hide/:studentId', protect, hideUser);
module.exports = router;
