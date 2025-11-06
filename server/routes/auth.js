const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Simple login - no JWT, just check credentials
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password (plain text for simplicity - just for you!)
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Return user info
    res.json({
      userId: user._id,
      username: user.username,
      name: user.name
    });
  } catch (error) {
    res.status(500).json({ message: 'Login error', error: error.message });
  }
});

// Initialize default user (karthik / 1234)
router.post('/init', async (req, res) => {
  try {
    // Check if user already exists
    const existing = await User.findOne({ username: 'karthik' });
    
    if (existing) {
      return res.json({ message: 'User already exists', user: existing });
    }
    
    // Create default user
    const user = new User({
      username: 'karthik',
      password: '1234',
      name: 'Karthik'
    });
    
    await user.save();
    res.json({ message: 'Default user created!', user });
  } catch (error) {
    res.status(500).json({ message: 'Init error', error: error.message });
  }
});

// Get user details (including Streak Shields)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('-password'); // Exclude password
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      userId: user._id,
      username: user.username,
      name: user.name,
      streakShields: user.streakShields || 0,
      streakShieldsUsed: user.streakShieldsUsed || [],
      lastShieldEarnedAt: user.lastShieldEarnedAt || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

module.exports = router;
