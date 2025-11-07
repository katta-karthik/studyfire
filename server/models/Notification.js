const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['reminder', 'deadline', 'celebration', 'streak', 'goal', 'system'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: '🔔'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  actionUrl: {
    type: String
  },
  linkedChallengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge'
  },
  linkedEventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CalendarEvent'
  },
  linkedPageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Page'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
