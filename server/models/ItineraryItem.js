const mongoose = require('mongoose');

const itineraryItemSchema = new mongoose.Schema({
  time: { type: String, default: '09:00 AM' },
  title: { type: String, required: true, trim: true },
  activity: { type: String, default: '' },
  location: { type: String, default: '' },
  cost: { type: Number, default: 0 },
  votes: { type: Number, default: 1 },
  votedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('ItineraryItem', itineraryItemSchema);
