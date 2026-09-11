const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, enum: ['user', 'admin'], required: true },
  text: { type: String, required: true, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
