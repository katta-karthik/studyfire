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
  estimatedTime: {
    type: Number,
    default: 30
  },
  category: {
    type: String,
    enum: ['today', 'week', 'month', 'someday', 'unprocessed'],
    default: 'unprocessed'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  isProcessed: {
    type: Boolean,
    default: false
  },
  processedAt: {
    type: Date
  },
  movedToSchedule: {
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
