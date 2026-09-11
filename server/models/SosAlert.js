const mongoose = require('mongoose');

const sosAlertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  coordinates: { type: String, default: 'Location unavailable' },
  location: { type: String, default: '' },
  phone: { type: String, default: '' },
  emergencyContact: { type: String, default: '' },
  severity: { type: String, default: 'Emergency Request' },
  details: { type: String, default: '' },
  status: { type: String, enum: ['ACTIVE', 'RESOLVED'], default: 'ACTIVE' }
}, { timestamps: true });

module.exports = mongoose.model('SosAlert', sosAlertSchema);
