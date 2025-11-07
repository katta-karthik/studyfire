const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String
  },
  endTime: {
    type: String
  },
  type: {
    type: String,
    enum: ['challenge', 'deadline', 'reminder', 'event', 'goal'],
    default: 'event'
  },
  color: {
    type: String,
    default: '#FF6B35'
  },
  linkedChallengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge'
  },
  linkedPageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Page'
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  recurring: {
    enabled: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'daily'
    },
    endDate: {
      type: Date
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CalendarEvent', calendarEventSchema);
