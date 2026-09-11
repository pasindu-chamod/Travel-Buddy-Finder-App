const express = require('express');
const SosAlert = require('../models/SosAlert');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/sos — admin gets all, user gets their own
router.get('/', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { userId: req.user._id };
    const alerts = await SosAlert.find(filter).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/sos — user triggers SOS
router.post('/', protect, async (req, res) => {
  try {
    const { coordinates, location, phone, emergencyContact, severity, details } = req.body;
    const alert = await SosAlert.create({
      userId: req.user._id,
      userName: req.user.name,
      coordinates: coordinates || 'Location unavailable',
      location: location || req.user.homeCountry || 'Unknown',
      phone: phone || req.user.phone || 'Not provided',
      emergencyContact: emergencyContact || `${req.user.emergencyContactName} (${req.user.emergencyContactPhone})`,
      severity: severity || 'Emergency Request',
      details: details || 'Emergency SOS alert dispatched by traveler.',
      status: 'ACTIVE'
    });
    res.status(201).json(alert);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/sos/:id/resolve — admin resolves alert
router.patch('/:id/resolve', protect, adminOnly, async (req, res) => {
  try {
    const alert = await SosAlert.findByIdAndUpdate(
      req.params.id,
      { status: 'RESOLVED' },
      { new: true }
    );
    if (!alert) return res.status(404).json({ message: 'Alert not found.' });
    res.json(alert);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
