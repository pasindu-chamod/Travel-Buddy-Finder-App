const express = require('express');
const ItineraryItem = require('../models/ItineraryItem');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/itinerary
router.get('/', protect, async (req, res) => {
  try {
    const items = await ItineraryItem.find().sort({ createdAt: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/itinerary
router.post('/', protect, async (req, res) => {
  try {
    const { time, title, cost, activity, location } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required.' });

    const item = await ItineraryItem.create({
      time: time || '09:00 AM',
      title: title.trim(),
      activity: activity ? activity.trim() : '',
      location: location ? location.trim() : '',
      cost: parseFloat(cost) || 0,
      votes: 1,
      votedBy: [req.user._id],
      createdBy: req.user._id
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/itinerary/:id/upvote — toggle upvote
router.patch('/:id/upvote', protect, async (req, res) => {
  try {
    const item = await ItineraryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found.' });

    const userId = req.user._id.toString();
    const alreadyVoted = item.votedBy.some(id => id.toString() === userId);

    if (!alreadyVoted) {
      item.votedBy.push(req.user._id);
      item.votes += 1;
      await item.save();
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/itinerary/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    await ItineraryItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Itinerary item deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
