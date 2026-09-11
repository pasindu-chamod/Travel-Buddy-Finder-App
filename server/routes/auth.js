const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Helper: generate JWT token
const signToken = (id) =>
  jwt.sign(
    { id },
    process.env.JWT_SECRET || 'travel_buddy_super_secret_jwt_key_2026_change_in_production',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, style, gender, age, homeCountry } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone || '',
      style: style || 'Backpacking & Nature',
      gender: gender || 'Not specified',
      age: age || 24,
      homeCountry: homeCountry || 'Sri Lanka'
    });

    const token = signToken(user._id);
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    if (!emailOrUsername || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const query = emailOrUsername.trim().toLowerCase();

    // Support login with 'admin' shorthand
    let user;
    if (query === 'admin') {
      user = await User.findOne({ role: 'admin' }).select('+password');
    } else {
      user = await User.findOne({ email: query }).select('+password');
    }

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ message: 'This account has been suspended.' });
    }

    const token = signToken(user._id);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me — verify token and get current user
router.get('/me', protect, async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
