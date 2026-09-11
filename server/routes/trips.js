const express = require('express');
const Trip = require('../models/Trip');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/trips — public approved trips (logged-in users)
router.get('/', protect, async (req, res) => {
  try {
    const { search, womenOnly } = req.query;
    const filter = { status: 'APPROVED' };
    if (womenOnly === 'true') filter.isWomenOnly = true;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } }
      ];
    }
    const trips = await Trip.find(filter).sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/trips/pending — admin only
router.get('/pending', protect, adminOnly, async (req, res) => {
  try {
    const trips = await Trip.find({ status: 'PENDING' }).sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/trips/all — all trips (admin)
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const trips = await Trip.find().sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/trips/mine — current user's own trips
router.get('/mine', protect, async (req, res) => {
  try {
    const trips = await Trip.find({ hostId: req.user._id }).sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/trips — create new trip (user)
router.post('/', protect, async (req, res) => {
  try {
    const { title, destination, startDate, endDate, budget, maxMembers, isWomenOnly, cover, description } = req.body;
    if (!title || !destination) {
      return res.status(400).json({ message: 'Title and destination are required.' });
    }
    const trip = await Trip.create({
      title: title.trim(),
      destination: destination.trim(),
      startDate,
      endDate,
      budget: parseFloat(budget) || 500,
      maxMembers: parseInt(maxMembers) || 4,
      currentMembers: 1,
      isWomenOnly: isWomenOnly || false,
      cover: cover || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      host: req.user.name,
      hostId: req.user._id,
      hostPhone: req.user.phone || '',
      hostEmail: req.user.email || '',
      description: description ? description.trim() : '',
      status: 'PENDING'
    });
    res.status(201).json(trip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/trips/:id/approve — admin approve
router.patch('/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(req.params.id, { status: 'APPROVED' }, { new: true });
    if (!trip) return res.status(404).json({ message: 'Trip not found.' });
    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/trips/:id/reject — admin reject (delete)
router.patch('/:id/reject', protect, adminOnly, async (req, res) => {
  try {
    await Trip.findByIdAndDelete(req.params.id);
    res.json({ message: 'Trip rejected and deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/trips/:id — admin delete any trip
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Trip.findByIdAndDelete(req.params.id);
    res.json({ message: 'Trip deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
