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

const Message = require('../models/Message');
const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findById(id);
    if (!conversation || !conversation.participants.includes(req.userId)) {
      return res
        .status(403)
        .json({ message: 'Not authorized to delete this conversation' });
    }
    await Message.deleteMany({ conversation: id });
    await Conversation.findByIdAndDelete(id);
    res.json({ message: 'Conversation deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete conversation' });
  }
};
module.exports = {
  getMyConversations,
  startConversation,
  createGroup,
  deleteConversation,
};
