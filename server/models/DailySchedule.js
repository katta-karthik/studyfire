const mongoose = require('mongoose');

const timeBlockSchema = new mongoose.Schema({
  time: {
    type: String,
    required: true
  },
  task: {
    type: String,
    default: ''
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  linkedChallengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge'
  },
  linkedEventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CalendarEvent'
  }
});

const dailyScheduleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  dayStartTime: {
    type: Number,
    default: 7, // Hour the day starts (0-23)
    min: 0,
    max: 23
  },
  schedule: [timeBlockSchema],
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Ensure one schedule per user per day
dailyScheduleSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailySchedule', dailyScheduleSchema);
