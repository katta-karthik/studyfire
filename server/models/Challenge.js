const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  dailyTargetMinutes: {
    type: Number,
    required: true,
    min: 1
  },
  targetTime: {
    type: String,
    default: ''
  },
  
  // 🎮 GAMIFIED BET SYSTEM
  betMode: {
    type: String,
    enum: ['single', 'multi'],
    default: 'single'
  },
  
  // Legacy single bet (kept for backward compatibility)
  betItem: {
    name: { type: String, default: '' },
    size: { type: Number, default: 0 },
    type: { type: String, default: '' },
    uploadedAt: { type: Date, default: null },
    fileData: { type: String, default: '' } // Base64 encoded file
  },
  
  // NEW: Multi-bet milestone system 🎁
  betItems: [{
    name: String,
    size: Number,
    type: String,
    uploadedAt: Date,
    fileData: String, // Base64 encoded file
    milestone: Number, // Which bet number (1, 2, 3, etc.)
    unlockDay: Number, // Day when this bet unlocks (e.g., 15, 30, 60)
    isUnlocked: { type: Boolean, default: false }, // Has user reached this milestone?
    unlockedAt: { type: Date, default: null } // When was it unlocked?
  }],
  
  totalBets: {
    type: Number,
    default: 1, // 1 for single mode, 2-5 for multi mode
    min: 1,
    max: 5
  },
  
  startTimeRequired: {
    type: Boolean,
    default: false
  },
  scheduledStartTime: {
    type: String, // HH:MM format
    default: ''
  },
  // NEW: Safe Days system (lifelines)
  safeDaysTotal: {
    type: Number,
    default: 0, // How many safe days user chose when creating challenge
    min: 0,
    max: 5
  },
  safeDaysRemaining: {
    type: Number,
    default: 0 // How many safe days are left
  },
  safeDaysUsed: [{
    date: String, // Date when safe day was used
    reason: String // "Missed daily goal"
  }],
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  completedDays: [{
    date: String,
    minutes: Number,
    seconds: { type: Number, default: 0 }, // Store remaining seconds for precision
    isGoalReached: { type: Boolean, default: false }, // Track if daily goal was met
    sessions: [{ // NEW: Track all sessions for this day
      startTime: Date,
      endTime: Date,
      duration: Number // in minutes
    }]
  }],
  totalMinutes: {
    type: Number,
    default: 0
  },
  lastCompletedDate: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isBetLocked: {
    type: Boolean,
    default: true // BET IS LOCKED BY DEFAULT - only unlock on completion
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  isBetReturned: {
    type: Boolean,
    default: false
  },
  hasFailed: {
    type: Boolean,
    default: false
  },
  failedDates: [{
    date: String,
    reason: String // e.g., "Late start - missed time window", "Challenge failed"
  }],
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('Challenge', challengeSchema);
