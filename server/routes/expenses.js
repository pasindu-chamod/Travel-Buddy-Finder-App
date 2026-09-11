const express = require('express');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/expenses
router.get('/', protect, async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ createdAt: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/expenses
router.post('/', protect, async (req, res) => {
  try {
    const { title, amount, category } = req.body;
    if (!title || !amount) return res.status(400).json({ message: 'Title and amount are required.' });

    const expense = await Expense.create({
      title: title.trim(),
      amount: parseFloat(amount),
      paidBy: req.user.name,
      paidById: req.user._id,
      category: category || 'Other'
    });
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/expenses/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Expense deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
