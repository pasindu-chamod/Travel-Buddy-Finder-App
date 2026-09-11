const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, enum: ['user', 'admin'], default: 'user' },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // target user or admin
  recipientName: { type: String, default: '' },
  conversationKey: { type: String, index: true }, // e.g. "admin_userId" or "userA_userB"
  text: { type: String, required: true, trim: true },
  timestamp: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
