const mongoose = require('mongoose');

const inboxTaskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  task: {
    type: String,
    required: true
  },
  reminderDate: {
    type: Date
  },
  reminderTime: {
    type: String
  },
  category: {
    type: String,
    enum: ['today', 'week', 'month', 'someday', 'unprocessed', 'completed'],
    default: 'unprocessed'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  notificationShown: {
    type: Boolean,
    default: false
  },
  linkedPageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Page'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('InboxTask', inboxTaskSchema);
