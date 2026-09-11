const express = require('express');
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Helper to generate conversation key
const getConversationKey = (userIdA, userIdB, isUserAAdmin, isUserBAdmin) => {
  if (isUserAAdmin || isUserBAdmin) {
    const regularUserId = isUserAAdmin ? userIdB : userIdA;
    return `admin_${regularUserId}`;
  }
  return [userIdA.toString(), userIdB.toString()].sort().join('_');
};

// GET /api/chat — fetch all messages relevant to current user (or all if admin)
router.get('/', protect, async (req, res) => {
  try {
    let messages;
    if (req.user.role === 'admin') {
      messages = await ChatMessage.find().sort({ createdAt: 1 });
    } else {
      messages = await ChatMessage.find({
        $or: [
          { senderId: req.user._id },
          { recipientId: req.user._id },
          { conversationKey: `admin_${req.user._id}` }
        ]
      }).sort({ createdAt: 1 });
    }
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/chat — send a message to a user or admin
router.post('/', protect, async (req, res) => {
  try {
    const { text, targetUserId } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Message text is required.' });
    }

    let recipientId = null;
    let recipientName = 'System Administrator';
    let conversationKey;

    if (req.user.role === 'admin') {
      // Admin sending to a traveler
      if (!targetUserId) {
        return res.status(400).json({ message: 'Target user ID is required.' });
      }
      const targetUser = await User.findById(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ message: 'Target traveler not found.' });
      }
      recipientId = targetUser._id;
      recipientName = targetUser.name;
      conversationKey = `admin_${targetUser._id}`;
    } else {
      // Traveler sending either to Admin or to another Traveler
      if (!targetUserId || targetUserId === 'admin') {
        // Message to Admin
        const adminUser = await User.findOne({ role: 'admin' });
        recipientId = adminUser ? adminUser._id : null;
        recipientName = 'System Administrator';
        conversationKey = `admin_${req.user._id}`;
      } else {
        // Message to another Traveler
        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
          return res.status(404).json({ message: 'Target traveler not found.' });
        }
        recipientId = targetUser._id;
        recipientName = targetUser.name;
        conversationKey = getConversationKey(
          req.user._id,
          targetUser._id,
          false,
          targetUser.role === 'admin'
        );
      }
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const message = await ChatMessage.create({
      senderId: req.user._id,
      senderName: req.user.name,
      senderRole: req.user.role,
      recipientId,
      recipientName,
      conversationKey,
      text: text.trim(),
      timestamp: timeStr
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
