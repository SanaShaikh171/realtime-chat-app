const User = require('../models/User');
const getAllUsers = async (req, res) => {
  try {
    const me = await User.findById(req.userId);
    const users = await User.find({
      _id: { $nin: [...me.hiddenUsers, req.userId] },
    }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};
const hideUser = async (req, res) => {
  try {
    const { studentId } = req.params;
    await User.findByIdAndUpdate(req.userId, {
      $addToSet: { hiddenUsers: studentId },
    });
    res.json({ message: 'Student hidden from your list' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to hide student' });
  }
};
module.exports = { getAllUsers, hideUser };
