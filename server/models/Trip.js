const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  destination: { type: String, required: true, trim: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  budget: { type: Number, default: 500 },
  maxMembers: { type: Number, default: 4 },
  currentMembers: { type: Number, default: 1 },
  isWomenOnly: { type: Boolean, default: false },
  cover: { type: String, default: '' },
  host: { type: String, required: true },
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hostPhone: { type: String, default: '' },
  hostEmail: { type: String, default: '' },
  description: { type: String, default: '' },
  status: { type: String, enum: ['PENDING', 'APPROVED'], default: 'PENDING' }
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);
