const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');

// Route imports
const authRoutes = require('./routes/auth');
const tripRoutes = require('./routes/trips');
const userRoutes = require('./routes/users');
const expenseRoutes = require('./routes/expenses');
const postRoutes = require('./routes/posts');
const itineraryRoutes = require('./routes/itinerary');
const sosRoutes = require('./routes/sos');
const chatRoutes = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── MIDDLEWARE ───────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://127.0.0.1:5173'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── API ROUTES ───────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/itinerary', itineraryRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Travel Buddy Finder API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

// ─── MONGODB + SERVER STARTUP ─────────────────────────────
async function seedAdminAccount() {
  try {
    const User = require('./models/User');
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        name: 'System Administrator',
        email: 'admin@travelbuddy.com',
        password: 'admin123',   // hashed by pre-save hook
        role: 'admin',
        status: 'ACTIVE',
        bio: 'Platform Administrator & Safety Coordinator.',
        isVerified: true,
        trustScore: 5.0,
        homeCountry: 'Global Command',
        instagramHandle: '@travelbuddy_official'
      });
      console.log('✅ Admin account seeded: admin@travelbuddy.com / admin123');
    } else {
      console.log('ℹ️  Admin account already exists.');
    }
  } catch (err) {
    console.error('❌ Failed to seed admin:', err.message);
  }
}

async function startServer() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/travel_buddy_finder';
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ MongoDB connected:', mongoose.connection.host);

    // Seed admin on first run
    await seedAdminAccount();

    app.listen(PORT, () => {
      console.log('');
      console.log('🚀 Travel Buddy Finder API');
      console.log(`   Server:  http://localhost:${PORT}`);
      console.log(`   Health:  http://localhost:${PORT}/api/health`);
      console.log('');
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    console.error('');
    console.error('💡 Make sure MongoDB is running:');
    console.error('   - Local: start mongod service');
    console.error('   - Atlas: check MONGO_URI in server/.env');
    process.exit(1);
  }
}

startServer();
