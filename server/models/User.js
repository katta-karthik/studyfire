const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: 'User'
  },
  // NEW: Streak Shield System
  streakShields: {
    type: Number,
    default: 0,
    min: 0
  },
  streakShieldsUsed: [{
    date: String,
    reason: String,
    streakAtTime: Number
  }],
  lastShieldEarnedAt: {
    type: Number,
    default: 0 // Streak count when last shield was earned
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
