const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    default: 'Untitled'
  },
  content: {
    type: String,
    default: ''
  },
  coverImage: {
    type: String,
    default: ''
  },
  tags: [{
    type: String
  }],
  deadline: {
    type: Date
  },
  linkedChallengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge'
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  viewType: {
    type: String,
    enum: ['gallery', 'list'],
    default: 'gallery'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Page', pageSchema);
