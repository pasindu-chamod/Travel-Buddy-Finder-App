const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  status: { type: String, enum: ['ACTIVE', 'SUSPENDED'], default: 'ACTIVE' },
  photo: { type: String, default: '' },
  bio: { type: String, default: 'Excited to explore new destinations!' },
  gender: { type: String, default: 'Not specified' },
  age: { type: Number, default: 24 },
  phone: { type: String, default: '' },
  emergencyContactName: { type: String, default: '' },
  emergencyContactPhone: { type: String, default: '' },
  homeCountry: { type: String, default: 'Sri Lanka' },
  instagramHandle: { type: String, default: '' },
  style: { type: String, default: 'Backpacking & Nature' },
  budgetTier: { type: String, default: 'Moderate ($50-100/day)' },
  interests: { type: [String], default: ['Hiking', 'Photography', 'Food Tours', 'Beach'] },
  languages: { type: [String], default: ['English'] },
  isVerified: { type: Boolean, default: true },
  trustScore: { type: Number, default: 5.0 },
  expeditionsCompleted: { type: Number, default: 0 }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare plain password with hashed
userSchema.methods.comparePassword = async function (candidatePw) {
  return bcrypt.compare(candidatePw, this.password);
};

// Never return password in JSON responses
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
