const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Challenge = require('../models/Challenge');

// Get all challenges for a user
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }
    
    // Convert userId to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    // Auto-cleanup: Deactivate completed challenges from previous days
    // Use local date instead of UTC
    const now = new Date();
    const today = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
      .toISOString()
      .split('T')[0];
    await Challenge.updateMany(
      {
        userId: userObjectId,
        isCompleted: true,
        isActive: true,
        completedAt: { $exists: true }
      },
      [
        {
          $set: {
            isActive: {
              $cond: {
                if: {
                  $eq: [
                    { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
                    today
                  ]
                },
                then: true, // Keep active if completed today
                else: false // Deactivate if completed on previous days
              }
            }
          }
        }
      ]
    );
    
    const challenges = await Challenge.find({ userId: userObjectId }).sort({ createdAt: -1 });
    res.json(challenges);
  } catch (error) {
    console.error('❌ Error fetching challenges:', error.message);
    res.status(500).json({ message: 'Error fetching challenges', error: error.message });
  }
});

// Get today's progress for all active challenges (MUST be before /:id route)
router.get('/today-progress', async (req, res) => {
  try {
    const { userId } = req.query;
    
    console.log('📊 Getting today progress for userId:', userId);
    
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }
    
    // Convert userId to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    const challenges = await Challenge.find({ 
      userId: userObjectId,
      isActive: true,
      isCompleted: false,
      hasFailed: false
    });
    
    console.log(`📊 Found ${challenges.length} active challenges`);
    
    // Use local date instead of UTC
    const now = new Date();
    const today = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
      .toISOString()
      .split('T')[0];
    const progress = {};
    
    challenges.forEach(challenge => {
      const todayEntry = challenge.completedDays.find(day => day.date === today);
      
      console.log(`   - "${challenge.title}": completedDays has ${challenge.completedDays.length} entries, today's entry:`, todayEntry ? `${todayEntry.minutes} min (${todayEntry.sessions.length} sessions)` : 'NOT FOUND');
      
      progress[challenge._id] = {
        challengeId: challenge._id,
        title: challenge.title,
        targetMinutes: challenge.dailyTargetMinutes,
        minutesLogged: todayEntry ? todayEntry.minutes : 0,
        isCompleted: todayEntry ? todayEntry.isGoalReached : false,
        sessionsCount: todayEntry ? todayEntry.sessions.length : 0
      };
    });
    
    console.log('📊 Today progress:', progress);
    res.json(progress);
  } catch (error) {
    console.error('❌ Error in today-progress:', error);
    res.status(500).json({ message: 'Error fetching today progress', error: error.message });
  }
});

// GET single challenge by ID
router.get('/:id', async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    res.json(challenge);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching challenge', error: error.message });
  }
});

// CREATE new challenge
router.post('/', async (req, res) => {
  try {
    console.log('📥 Received challenge creation request:', JSON.stringify(req.body, null, 2));
    
    // Convert userId string to ObjectId if needed
    const challengeData = { ...req.body };
    if (challengeData.userId && typeof challengeData.userId === 'string') {
      challengeData.userId = new mongoose.Types.ObjectId(challengeData.userId);
    }
    
    // Initialize safeDaysRemaining to match safeDaysTotal
    if (challengeData.safeDaysTotal) {
      challengeData.safeDaysRemaining = challengeData.safeDaysTotal;
    }
    
    // Handle multi-bet mode: if betItems array exists, use it
    if (challengeData.betMode === 'multi' && challengeData.betItems && Array.isArray(challengeData.betItems)) {
      console.log(`✅ Multi-bet challenge with ${challengeData.betItems.length} bets`);
      // Keep betItems array as is
    } else if (challengeData.betItem) {
      // Single bet mode - keep betItem as is
      console.log(`✅ Single-bet challenge`);
    }
    
    const challenge = new Challenge(challengeData);
    const savedChallenge = await challenge.save();
    console.log(`✅ Created challenge "${savedChallenge.title}" with ${savedChallenge.betMode} mode`);
    res.status(201).json(savedChallenge);
  } catch (error) {
    console.error('❌ Error creating challenge:', error.message);
    console.error('❌ Error stack:', error.stack);
    res.status(400).json({ message: 'Error creating challenge', error: error.message, details: error.stack });
  }
});

// UPDATE challenge
router.put('/:id', async (req, res) => {
  try {
    const updatedChallenge = await Challenge.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedChallenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    res.json(updatedChallenge);
  } catch (error) {
    res.status(400).json({ message: 'Error updating challenge', error: error.message });
  }
});

// DELETE challenge
router.delete('/:id', async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    // NEW: Simple 24-hour rule - can delete within 24 hours of creation
    const now = new Date();
    const createdDate = new Date(challenge.createdAt);
    const hoursSinceCreation = (now - createdDate) / (1000 * 60 * 60); // Convert to hours
    
    // RULE: Can only delete within 24 hours of creation
    if (hoursSinceCreation > 24) {
      console.log(`❌ DELETE BLOCKED for "${challenge.title}"`);
      console.log(`  - Hours since creation: ${hoursSinceCreation.toFixed(2)} hours`);
      console.log(`  - Created: ${createdDate.toISOString()}`);
      console.log(`  - Current time: ${now.toISOString()}`);
      
      return res.status(403).json({ 
        message: 'Cannot delete challenge after 24 hours',
        reason: `Challenge was created ${Math.floor(hoursSinceCreation)} hours ago. Delete is only allowed within 24 hours of creation.`,
        canDelete: false,
        details: {
          createdAt: createdDate.toISOString(),
          hoursSinceCreation: Math.floor(hoursSinceCreation),
          deleteDeadline: new Date(createdDate.getTime() + 24 * 60 * 60 * 1000).toISOString()
        }
      });
    }
    
    // DELETE ALLOWED - within 24 hours
    console.log(`✅ DELETE ALLOWED for "${challenge.title}" - Within 24-hour window (${hoursSinceCreation.toFixed(2)} hours old)`);
    await Challenge.findByIdAndDelete(req.params.id);
    
    res.json({ 
      message: 'Challenge deleted successfully',
      reason: 'Deleted within 24-hour grace period'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting challenge', error: error.message });
  }
});

// GET statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }
    
    // Convert userId to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const challenges = await Challenge.find({ userId: userObjectId });
    
    const stats = {
      totalChallenges: challenges.length,
      activeChallenges: challenges.filter(c => c.isActive && !c.isCompleted).length,
      completedChallenges: challenges.filter(c => c.isCompleted).length,
      failedChallenges: challenges.filter(c => c.isBetLocked).length,
      totalStreak: challenges.reduce((sum, c) => sum + c.currentStreak, 0),
      longestStreak: Math.max(...challenges.map(c => c.longestStreak), 0),
      totalMinutes: challenges.reduce((sum, c) => sum + c.totalMinutes, 0),
      totalHours: Math.floor(challenges.reduce((sum, c) => sum + c.totalMinutes, 0) / 60),
      completionRate: challenges.length > 0 
        ? ((challenges.filter(c => c.isCompleted).length / challenges.length) * 100).toFixed(1)
        : 0
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

// DOWNLOAD bet file - ONLY if challenge is completed
router.get('/:id/download-bet', async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    // STRICT: Only allow download if challenge is fully completed AND bet is unlocked
    if (!challenge.isCompleted || challenge.isBetLocked) {
      return res.status(403).json({ 
        message: '🔒 ACCESS DENIED. Your bet is LOCKED until you complete the entire challenge. No shortcuts.',
        isCompleted: challenge.isCompleted,
        isBetLocked: challenge.isBetLocked,
        hasFailed: challenge.hasFailed
      });
    }
    
    if (!challenge.betItem || !challenge.betItem.fileData) {
      return res.status(404).json({ message: 'No bet file found' });
    }
    
    // Return the file data (base64)
    res.json({
      name: challenge.betItem.name,
      type: challenge.betItem.type,
      fileData: challenge.betItem.fileData
    });
  } catch (error) {
    res.status(500).json({ message: 'Error downloading bet', error: error.message });
  }
});

// NEW: Start a session for a challenge
router.post('/:id/start-session', async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    res.json({ 
      message: 'Session started',
      challenge,
      startTime: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ message: 'Error starting session', error: error.message });
  }
});

// NEW: Stop a session and update challenge progress
router.post('/:id/stop-session', async (req, res) => {
  try {
    const { startTime, endTime, duration, elapsedSeconds } = req.body;
    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    // Find or create today's entry
    let todayEntry = challenge.completedDays.find(day => day.date === today);
    
    if (!todayEntry) {
      todayEntry = {
        date: today,
        minutes: 0,
        seconds: 0,
        isGoalReached: false,
        sessions: []
      };
      challenge.completedDays.push(todayEntry);
    }
    
    // Add this session
    todayEntry.sessions.push({
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      duration
    });
    
    // Update total time for today
    todayEntry.minutes += duration;
    todayEntry.seconds += (elapsedSeconds % 60);
    
    // Handle seconds overflow
    if (todayEntry.seconds >= 60) {
      todayEntry.minutes += Math.floor(todayEntry.seconds / 60);
      todayEntry.seconds = todayEntry.seconds % 60;
    }
    
    // Check if daily goal is reached
    const wasGoalReached = todayEntry.isGoalReached;
    todayEntry.isGoalReached = todayEntry.minutes >= challenge.dailyTargetMinutes;
    
    // Update total minutes
    challenge.totalMinutes += duration;
    
    // Update streak only if goal just reached (not already reached)
    if (todayEntry.isGoalReached && !wasGoalReached) {
      // Check if this continues the streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      const yesterdayEntry = challenge.completedDays.find(
        day => day.date === yesterdayStr && day.isGoalReached
      );
      
      if (yesterdayEntry || challenge.currentStreak === 0) {
        challenge.currentStreak += 1;
        if (challenge.currentStreak > challenge.longestStreak) {
          challenge.longestStreak = challenge.currentStreak;
        }
      } else {
        // Streak broken, reset
        challenge.currentStreak = 1;
      }
      
      challenge.lastCompletedDate = new Date();
      
      // Check if challenge is complete
      if (challenge.currentStreak >= challenge.duration) {
        challenge.isCompleted = true;
        challenge.isActive = false;
        challenge.completedAt = new Date();
        challenge.isBetReturned = true;
        challenge.isBetLocked = false;
      }
    }
    
    await challenge.save();
    
    res.json({ 
      message: 'Session saved',
      challenge,
      todayProgress: {
        minutes: todayEntry.minutes,
        isGoalReached: todayEntry.isGoalReached,
        targetMinutes: challenge.dailyTargetMinutes,
        sessionsCount: todayEntry.sessions.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error stopping session', error: error.message });
  }
});

// DELETE bet file - Called when challenge fails
router.delete('/:id/delete-bet', async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    // Delete bet file from database
    challenge.betItem = {
      name: '[DELETED - Challenge Failed]',
      size: 0,
      type: '',
      uploadedAt: null,
      fileData: ''
    };
    challenge.isBetLocked = true;
    challenge.hasFailed = true;
    
    await challenge.save();
    
    res.json({ 
      message: '🔥 Bet file PERMANENTLY DELETED. No mercy for quitters.',
      challenge 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting bet', error: error.message });
  }
});

module.exports = router;
