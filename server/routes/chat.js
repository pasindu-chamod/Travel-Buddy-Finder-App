const express = require('express');
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/chat — user gets own thread, admin gets all messages
router.get('/', protect, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const messages = await ChatMessage.find().sort({ createdAt: 1 });
      res.json(messages);
    } else {
      const messages = await ChatMessage.find({ userId: req.user._id }).sort({ createdAt: 1 });
      res.json(messages);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/chat/threads — admin: list of unique user threads
router.get('/threads', protect, adminOnly, async (req, res) => {
  try {
    // Get unique userIds that have messages
    const userIds = await ChatMessage.distinct('userId');
    const users = await User.find({ _id: { $in: userIds } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/chat/:userId — admin gets specific user thread
router.get('/:userId', protect, adminOnly, async (req, res) => {
  try {
    const messages = await ChatMessage.find({ userId: req.params.userId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/chat — send a message
router.post('/', protect, async (req, res) => {
  try {
    const { text, targetUserId } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: 'Message text is required.' });

    let userId, userName;

    if (req.user.role === 'admin') {
      // Admin sends to a specific user's thread
      if (!targetUserId) return res.status(400).json({ message: 'targetUserId is required for admin messages.' });
      const targetUser = await User.findById(targetUserId);
      if (!targetUser) return res.status(404).json({ message: 'Target user not found.' });
      userId = targetUser._id;
      userName = targetUser.name;
    } else {
      // User sends to their own thread (admin reads it)
      userId = req.user._id;
      userName = req.user.name;
    }

    const message = await ChatMessage.create({
      userId,
      userName,
      senderId: req.user._id,
      senderName: req.user.name,
      senderRole: req.user.role,
      text: text.trim()
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
