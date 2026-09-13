const express = require('express');
const router = express.Router();
const {
  getMyConversations,
  startConversation,
  createGroup,
} = require('../controllers/conversationController');
const protect = require('../middleware/authMiddleware');
router.get('/', protect, getMyConversations);
router.post('/dm', protect, startConversation);
router.post('/group', protect, createGroup);
module.exports = router;
