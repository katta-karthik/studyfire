const express = require('express');
const router = express.Router();
const TimeEntry = require('../models/TimeEntry');
const Challenge = require('../models/Challenge');
const User = require('../models/User');

// Get all time entries for a user
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const entries = await TimeEntry.find({ userId })
      .populate('challengeId', 'title')
      .sort({ startTime: -1 });
    
    res.json(entries);
  } catch (error) {
    console.error('Error fetching time entries:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start a new time entry
router.post('/start', async (req, res) => {
  try {
    const { userId, challengeId, description } = req.body;
    
    console.log('🚀 Starting timer:', { userId, challengeId, description });

    // Stop any running timers first
    await TimeEntry.updateMany(
      { userId, isRunning: true },
      { 
        endTime: new Date(),
        isRunning: false
      }
    );

    // Recalculate durations for stopped entries
    const stoppedEntries = await TimeEntry.find({ 
      userId, 
      isRunning: false,
      endTime: { $ne: null },
      duration: 0
    });

    for (const entry of stoppedEntries) {
      entry.duration = Math.floor((entry.endTime - entry.startTime) / 1000);
      await entry.save();
    }

    // Create new time entry
    const newEntry = new TimeEntry({
      userId,
      challengeId,
      description,
      startTime: new Date(),
      isRunning: true
    });

    await newEntry.save();
    await newEntry.populate('challengeId', 'title');
    
    res.json(newEntry);
  } catch (error) {
    console.error('Error starting time entry:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Stop the running time entry
router.post('/stop/:id', async (req, res) => {
  try {
    const entry = await TimeEntry.findById(req.params.id);
    
    if (!entry) {
      return res.status(404).json({ message: 'Time entry not found' });
    }
    
    console.log('⏹️ Stopping timer:', { id: entry._id, challengeId: entry.challengeId });

    entry.endTime = new Date();
    entry.isRunning = false;
    entry.duration = Math.floor((entry.endTime - entry.startTime) / 1000);
    
    await entry.save();
    
    console.log('⏹️ Timer stopped. Duration:', entry.duration, 'seconds');
    
    // UPDATE CHALLENGE PROGRESS if challengeId exists
    if (entry.challengeId) {
      // Get the actual ID (it might be populated or just an ObjectId)
      const challengeId = entry.challengeId._id || entry.challengeId;
      console.log('🔍 Looking for challenge:', challengeId);
      
      const challenge = await Challenge.findById(challengeId);
      
      if (challenge) {
        console.log('✅ Found challenge:', challenge.title);
        
        // Use local date instead of UTC
        const now = new Date();
        const utcDate = now.toISOString().split('T')[0];
        const today = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
          .toISOString()
          .split('T')[0];
        const durationMinutes = Math.floor(entry.duration / 60);
        const durationSeconds = entry.duration % 60;
        
        console.log('🕐 Server time:', now.toString());
        console.log('📅 UTC date:', utcDate);
        console.log('📅 Local date:', today, '| Timezone offset:', now.getTimezoneOffset(), 'minutes');
        console.log('⏱️  Duration:', durationMinutes, 'min', durationSeconds, 'sec');
        
        // Find or create today's entry (using INDEX to ensure Mongoose tracks changes)
        let todayEntryIndex = challenge.completedDays.findIndex(day => day.date === today);
        
        if (todayEntryIndex === -1) {
          console.log('📝 Creating new entry for today');
          challenge.completedDays.push({
            date: today,
            minutes: 0,
            seconds: 0,
            isGoalReached: false,
            sessions: []
          });
          todayEntryIndex = challenge.completedDays.length - 1;
        } else {
          console.log('📝 Found existing entry for today:', challenge.completedDays[todayEntryIndex].minutes, 'min');
        }
        
        // Get reference to the actual subdocument
        const todayEntry = challenge.completedDays[todayEntryIndex];
        
        // Add this session
        todayEntry.sessions.push({
          startTime: entry.startTime,
          endTime: entry.endTime,
          duration: durationMinutes
        });
        
        // Update total time for today
        todayEntry.minutes += durationMinutes;
        todayEntry.seconds += durationSeconds;
        
        // Handle seconds overflow
        if (todayEntry.seconds >= 60) {
          todayEntry.minutes += Math.floor(todayEntry.seconds / 60);
          todayEntry.seconds = todayEntry.seconds % 60;
        }
        
        // Check if daily goal is reached
        const wasGoalReached = todayEntry.isGoalReached;
        todayEntry.isGoalReached = todayEntry.minutes >= challenge.dailyTargetMinutes;
        
        // CRITICAL: Mark the subdocument as modified so Mongoose saves it
        challenge.markModified('completedDays');
        
        // Update total minutes
        challenge.totalMinutes += durationMinutes;
        
        // Update streak only if goal just reached (not already reached)
        if (todayEntry.isGoalReached && !wasGoalReached) {
          console.log(`🎯 Daily goal reached for "${challenge.title}"! Checking if ALL challenges are done...`);
          
          // Get all active challenges for this user
          const allChallenges = await Challenge.find({
            userId: challenge.userId,
            isActive: true,
            isCompleted: false,
            hasFailed: false
          });
          
          console.log(`📊 Found ${allChallenges.length} active challenges to check`);
          
          // Check if ALL active challenges have reached their goal today
          const allChallengesComplete = allChallenges.every(c => {
            // Need to check the LATEST state (including current challenge we just updated)
            const cId = c._id.toString();
            const currentChallengeId = challenge._id.toString();
            
            // If this is the current challenge, check todayEntry directly
            if (cId === currentChallengeId) {
              console.log(`  - "${c.title}" (current): ✅ Just completed!`);
              return true;
            }
            
            // For other challenges, check their completedDays
            const todayData = c.completedDays.find(day => day.date === today && day.isGoalReached);
            const isComplete = todayData ? true : false;
            console.log(`  - "${c.title}": ${isComplete ? '✅ Complete' : '❌ Not complete'}`);
            return isComplete;
          });
          
          console.log(`📊 All challenges complete? ${allChallengesComplete}`);
          
          if (allChallengesComplete) {
            console.log('🔥🔥🔥 ALL CHALLENGES COMPLETE FOR TODAY! Updating streaks...');
            
            // 🛡️ UPDATE OVERALL STREAK (for shield earning)
            const user = await User.findById(userId);
            if (user) {
              const now = new Date();
              const todayLocal = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
                .toISOString()
                .split('T')[0];
              
              // Check if we already updated overall streak today
              if (user.lastOverallStreakDate !== todayLocal) {
                // Check if yesterday was also completed (streak continues)
                const yesterdayLocal = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
                yesterdayLocal.setDate(yesterdayLocal.getDate() - 1);
                const yesterdayStr = yesterdayLocal.toISOString().split('T')[0];
                
                if (user.lastOverallStreakDate === yesterdayStr || user.overallStreak === 0) {
                  // Streak continues!
                  user.overallStreak += 1;
                } else {
                  // Streak was broken, start fresh
                  user.overallStreak = 1;
                }
                
                if (user.overallStreak > user.longestOverallStreak) {
                  user.longestOverallStreak = user.overallStreak;
                }
                
                user.lastOverallStreakDate = todayLocal;
                
                console.log(`📊 OVERALL STREAK: ${user.overallStreak} days (longest: ${user.longestOverallStreak})`);
                
                // 🛡️ AWARD STREAK SHIELD every 15 days of OVERALL streak!
                if (user.overallStreak % 15 === 0 && user.overallStreak > 0 && user.lastShieldEarnedAt < user.overallStreak) {
                  user.streakShields += 1;
                  user.lastShieldEarnedAt = user.overallStreak;
                  console.log(`🛡️✨ STREAK SHIELD EARNED! ${user.overallStreak} overall days = ${user.streakShields} total shields!`);
                  console.log(`💪 Keep going! Next shield at ${user.overallStreak + 15} days!`);
                }
                
                await user.save();
              }
            }
            
            // Update streak for ALL challenges
            for (const c of allChallenges) {
              // Check if this continues the streak (use local timezone)
              const now = new Date();
              const yesterday = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
              yesterday.setDate(yesterday.getDate() - 1);
              const yesterdayStr = yesterday.toISOString().split('T')[0];
              
              const yesterdayEntry = c.completedDays.find(
                day => day.date === yesterdayStr && day.isGoalReached
              );
              
              const oldStreak = c.currentStreak;
              
              if (yesterdayEntry || c.currentStreak === 0) {
                // Streak continues normally
                c.currentStreak += 1;
                if (c.currentStreak > c.longestStreak) {
                  c.longestStreak = c.currentStreak;
                }
              } else {
                // Yesterday was missed! Check if THIS challenge has Safe Days
                if (c.safeDaysRemaining > 0) {
                  // USE A SAFE DAY! Streak continues but mark it
                  c.safeDaysRemaining -= 1;
                  c.safeDaysUsed = c.safeDaysUsed || [];
                  c.safeDaysUsed.push({
                    date: yesterdayStr,
                    reason: 'Missed daily goal'
                  });
                  c.currentStreak += 1; // Streak continues!
                  if (c.currentStreak > c.longestStreak) {
                    c.longestStreak = c.currentStreak;
                  }
                  
                  console.log(`  ⚡⚡⚡ "${c.title}": SAFE DAY USED! Missed ${yesterdayStr} but SURVIVED!`);
                  console.log(`  📊 Safe Days remaining: ${c.safeDaysRemaining}/${c.safeDaysTotal}`);
                  if (c.safeDaysRemaining === 0) {
                    console.log(`  ⚠️⚠️⚠️ WARNING: "${c.title}" - LAST SAFE DAY USED! Next miss = BET BURNS!`);
                  }
                } else {
                  // No safe days left - CHALLENGE FAILED! 💀
                  console.log(`  💀💀💀 "${c.title}": NO SAFE DAYS LEFT! CHALLENGE FAILED!`);
                  console.log(`  🔥 Bet item "${c.betItem?.name}" has been LOCKED FOREVER!`);
                  console.log(`  ⚠️ Challenge marked as FAILED and will be moved to Failed Challenges section`);
                  
                  // MARK CHALLENGE AS FAILED
                  c.hasFailed = true;
                  c.isActive = false; // Remove from active challenges
                  c.isBetLocked = true;
                  c.isBetReturned = false;
                  c.failedDates = c.failedDates || [];
                  c.failedDates.push({
                    date: yesterdayStr,
                    reason: 'Missed daily goal with no safe days remaining - Challenge failed permanently'
                  });
                  
                  // DON'T increment streak - this challenge is dead
                  c.currentStreak = 0;
                  
                  console.log(`  🚨🚨🚨 CRITICAL: "${c.title}" FAILED! OVERALL STREAK WILL BE RESET!`);
                  
                  // Save the failed challenge immediately
                  await c.save();
                  
                  // CHECK FOR STREAK SHIELDS BEFORE RESETTING OVERALL STREAK
                  // Shield protects the USER'S OVERALL STREAK (consecutive days ALL challenges complete)
                  const user = await User.findById(userId);
                  
                  if (user && user.streakShields > 0) {
                    // USE A STREAK SHIELD! 🛡️
                    user.streakShields -= 1;
                    user.streakShieldsUsed = user.streakShieldsUsed || [];
                    user.streakShieldsUsed.push({
                      date: yesterdayStr,
                      reason: `Protected overall streak when "${c.title}" failed`,
                      overallStreakAtTime: user.overallStreak || 0
                    });
                    // DON'T reset overallStreak - shield saved it!
                    await user.save();
                    
                    console.log(`  🛡️🛡️🛡️ STREAK SHIELD USED! OVERALL STREAK SAVED!`);
                    console.log(`  📊 Overall streak protected: ${user.overallStreak} days`);
                    console.log(`  📊 Shields remaining: ${user.streakShields}`);
                    if (user.streakShields === 0) {
                      console.log(`  ⚠️⚠️⚠️ WARNING: LAST SHIELD USED! Next failure = OVERALL STREAK RESETS!`);
                    }
                  } else {
                    // NO SHIELDS - RESET USER'S OVERALL STREAK TO ZERO
                    console.log(`  💔 NO STREAK SHIELDS! Resetting overall streak to 0...`);
                    
                    if (user) {
                      const oldOverallStreak = user.overallStreak || 0;
                      user.overallStreak = 0; // RESET OVERALL STREAK
                      await user.save();
                      console.log(`  💔 Overall streak reset: ${oldOverallStreak} → 0 (due to "${c.title}" failure)`);
                    }
                    
                    console.log(`  ☠️ CHALLENGE FAILED = OVERALL STREAK RESET. Game continues with remaining challenges.`);
                  }
                  
                  // Skip the rest for this failed challenge
                  continue;
                }
              }
              
              c.lastCompletedDate = new Date();
              
              // 🎮 CHECK MULTI-BET MILESTONE UNLOCKS!
              if (c.betMode === 'multi' && c.betItems && c.betItems.length > 0) {
                for (const bet of c.betItems) {
                  // If bet unlocks at this streak day and hasn't been unlocked yet
                  if (!bet.isUnlocked && c.currentStreak >= bet.unlockDay) {
                    bet.isUnlocked = true;
                    bet.unlockedAt = new Date();
                    console.log(`  🎁🎁🎁 MILESTONE UNLOCKED! Bet ${bet.milestone} "${bet.name}" unlocked at Day ${bet.unlockDay}!`);
                    console.log(`  🎮 User can now download this reward! Keep going for the rest!`);
                  }
                }
              }
              
              // Check if challenge is complete (reached full duration)
              if (c.currentStreak >= c.duration) {
                c.isCompleted = true;
                c.completedAt = new Date();
                c.isBetReturned = true;
                c.isBetLocked = false;
                
                // 🎮 UNLOCK ALL REMAINING MULTI-BETS ON COMPLETION!
                if (c.betMode === 'multi' && c.betItems && c.betItems.length > 0) {
                  for (const bet of c.betItems) {
                    if (!bet.isUnlocked) {
                      bet.isUnlocked = true;
                      bet.unlockedAt = new Date();
                      console.log(`  🎁 Final unlock: Bet ${bet.milestone} "${bet.name}" unlocked on completion!`);
                    }
                  }
                }
                
                console.log(`  🎉 "${c.title}" COMPLETED! Challenge finished after ${c.duration} days!`);
                
                // Keep it active for TODAY so streak shows
                // It will be marked inactive tomorrow by a cleanup job or manually
              }
              
              // Save each challenge
              await c.save();
              console.log(`  ✅ "${c.title}": Streak updated ${oldStreak} → ${c.currentStreak} days`);
            }
          } else {
            console.log('⏳ Not all challenges complete yet. Streak will update when all are done.');
          }
        }
        
        await challenge.save();
        console.log(`✅ Updated challenge "${challenge.title}" - Today: ${todayEntry.minutes}/${challenge.dailyTargetMinutes} min, Sessions: ${todayEntry.sessions.length}, Goal Reached: ${todayEntry.isGoalReached}`);
      } else {
        console.log(`⚠️ Challenge not found for ID: ${challengeId}`);
      }
    } else {
      console.log('⚠️ No challengeId associated with this time entry');
    }
    
    // Populate challengeId before returning
    await entry.populate('challengeId', 'title');
    
    // NEW: Include Safe Day info AND Challenge Failure info AND Bet Unlock info in response
    let safeDayInfo = null;
    let challengeFailureInfo = null;
    let betUnlockInfo = null;
    
    if (challengeId) {
      const challenge = await Challenge.findById(challengeId);
      
      // Calculate yesterday's date (use local timezone to match other calculations)
      const now = new Date();
      const yesterday = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      // 🎮 Check if any bets were just unlocked (multi-bet mode)
      if (challenge?.betMode === 'multi' && challenge.betItems && challenge.betItems.length > 0) {
        const justUnlockedBets = challenge.betItems.filter(bet => {
          // Find bets that unlock at current streak and were unlocked recently (within last minute)
          if (bet.isUnlocked && bet.unlockDay === challenge.currentStreak) {
            const unlockedTime = new Date(bet.unlockedAt);
            const nowTime = new Date();
            const diffMs = nowTime - unlockedTime;
            return diffMs < 60000; // Within last minute
          }
          return false;
        });
        
        if (justUnlockedBets.length > 0) {
          betUnlockInfo = {
            challengeId: challenge._id.toString(),
            challengeTitle: challenge.title,
            currentStreak: challenge.currentStreak,
            unlockedBets: justUnlockedBets.map(bet => ({
              milestone: bet.milestone,
              name: bet.name,
              unlockDay: bet.unlockDay
            }))
          };
          console.log(`🎁🎁🎁 Sending Bet Unlock info to frontend: ${JSON.stringify(betUnlockInfo)}`);
        }
      }
      
      // Check if THIS challenge just failed
      if (challenge?.hasFailed && challenge.failedDates?.length > 0) {
        const lastFailureDate = challenge.failedDates[challenge.failedDates.length - 1].date;
        // If it failed yesterday (during this timer stop)
        if (lastFailureDate === yesterdayStr) {
          challengeFailureInfo = {
            failedChallengeId: challenge._id.toString(),
            failedChallengeTitle: challenge.title,
            failedBetItem: challenge.betItem?.name || 'Unknown',
            failedDate: lastFailureDate,
            reason: challenge.failedDates[challenge.failedDates.length - 1].reason,
            longestStreak: challenge.longestStreak
          };
          console.log(`💀 Sending Challenge Failure info to frontend: ${JSON.stringify(challengeFailureInfo)}`);
        }
      }
      
      // Check if a Safe Day was used for YESTERDAY (when completing today)
      const safeDayUsedForYesterday = challenge?.safeDaysUsed?.some(d => d.date === yesterdayStr);
      if (safeDayUsedForYesterday && !challenge?.hasFailed) { // Don't show safe day if challenge failed
        safeDayInfo = {
          challengeId: challenge._id.toString(),
          challengeTitle: challenge.title,
          safeDaysRemaining: challenge.safeDaysRemaining,
          safeDaysTotal: challenge.safeDaysTotal,
          missedDate: yesterdayStr
        };
        console.log(`📤 Sending Safe Day info to frontend: ${JSON.stringify(safeDayInfo)}`);
      }
    }
    
    res.json({ 
      ...entry.toObject(), 
      safeDayInfo,
      challengeFailureInfo,
      betUnlockInfo
    });
  } catch (error) {
    console.error('Error stopping time entry:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update running time entry (for auto-save)
router.put('/:id', async (req, res) => {
  try {
    const { description } = req.body;
    const entry = await TimeEntry.findById(req.params.id);
    
    if (!entry) {
      return res.status(404).json({ message: 'Time entry not found' });
    }

    if (description !== undefined) {
      entry.description = description;
    }
    
    await entry.save();
    await entry.populate('challengeId', 'title');
    
    res.json(entry);
  } catch (error) {
    console.error('Error updating time entry:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a time entry
router.delete('/:id', async (req, res) => {
  try {
    const entry = await TimeEntry.findByIdAndDelete(req.params.id);
    
    if (!entry) {
      return res.status(404).json({ message: 'Time entry not found' });
    }
    
    res.json({ message: 'Time entry deleted' });
  } catch (error) {
    console.error('Error deleting time entry:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get active/running time entry
router.get('/active', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const activeEntry = await TimeEntry.findOne({ userId, isRunning: true })
      .populate('challengeId', 'title');
    
    res.json(activeEntry);
  } catch (error) {
    console.error('Error fetching active entry:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
