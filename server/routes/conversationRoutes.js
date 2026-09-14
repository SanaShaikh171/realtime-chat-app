const express = require('express');
const router = express.Router();
const {
  getMyConversations,
  startConversation,
  createGroup,
  deleteConversation,
} = require('../controllers/conversationController');
const protect = require('../middleware/authMiddleware');
router.get('/', protect, getMyConversations);
router.post('/dm', protect, startConversation);
router.post('/group', protect, createGroup);
router.delete('/:id', protect, deleteConversation);
module.exports = router;
