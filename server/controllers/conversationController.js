const Conversation = require('../models/Conversation');
const getMyConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.userId,
    }).populate('participants', 'name email isOnline');
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch conversations' });
  }
};
const startConversation = async (req, res) => {
  try {
    const { otherUserId } = req.body;
    let conversation = await Conversation.findOne({
      isGroup: false,
      participants: { $all: [req.userId, otherUserId], $size: 2 },
    });
    if (!conversation) {
      conversation = await Conversation.create({
        isGroup: false,
        participants: [req.userId, otherUserId],
      });
    }
    res.json(conversation);
  } catch (err) {
    res.status(500).json({ message: 'Failed to start conversation' });
  }
};
const createGroup = async (req, res) => {
  try {
    const { groupName, participantIds } = req.body;
    const conversation = await Conversation.create({
      isGroup: true,
      groupName,
      participants: [...participantIds, req.userId],
      admin: req.userId,
    });
    res.status(201).json(conversation);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create group' });
  }
};
module.exports = { getMyConversations, startConversation, createGroup };
