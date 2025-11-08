const express = require('express');
const router = express.Router();
const DailySchedule = require('../models/DailySchedule');
const User = require('../models/User');

// Get schedule for specific date
router.get('/', async (req, res) => {
  try {
    const { userId, date } = req.query;
    
    console.log(`📅 GET schedule request for date: ${date}, user: ${userId}`);
    
    const schedule = await DailySchedule.findOne({
      userId,
      date: new Date(date)
    });
    
    // If no schedule exists, create default hourly schedule
    if (!schedule) {
      // Get user's preferred start time
      const user = await User.findById(userId);
      const startHour = user?.dayStartTime !== undefined ? user.dayStartTime : 7;
      
      console.log(`🆕 Creating new schedule for ${date}`);
      console.log(`👤 User document:`, JSON.stringify({ 
        _id: user?._id, 
        username: user?.username, 
        dayStartTime: user?.dayStartTime 
      }));
      console.log(`⏰ Using start hour: ${startHour} (type: ${typeof startHour})`);
      
      const defaultSchedule = generateDefaultSchedule(startHour);
      const newSchedule = new DailySchedule({
        userId,
        date: new Date(date),
        dayStartTime: parseInt(startHour), // Ensure it's a number
        schedule: defaultSchedule
      });
      const savedSchedule = await newSchedule.save();
      
      console.log(`✅ Saved schedule with dayStartTime: ${savedSchedule.dayStartTime}`);
      
      return res.json(savedSchedule);
    }
    
    console.log(`📋 Found existing schedule for ${date}, dayStartTime: ${schedule.dayStartTime}`);
    res.json(schedule);
  } catch (error) {
    console.error(`💥 Error in GET /planner:`, error);
    res.status(500).json({ message: error.message });
  }
});

// Update schedule
router.put('/', async (req, res) => {
  try {
    const { userId, date } = req.body;
    const schedule = await DailySchedule.findOneAndUpdate(
      { userId, date: new Date(date) },
      req.body,
      { new: true, upsert: true, runValidators: true }
    );
    res.json(schedule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Toggle task completion
router.patch('/toggle', async (req, res) => {
  try {
    const { userId, date, time } = req.body;
    const schedule = await DailySchedule.findOne({
      userId,
      date: new Date(date)
    });
    
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    
    const timeBlock = schedule.schedule.find(block => block.time === time);
    if (timeBlock) {
      timeBlock.isCompleted = !timeBlock.isCompleted;
      await schedule.save();
    }
    
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete task from planner (when inbox task is deleted)
router.post('/delete-task', async (req, res) => {
  try {
    const { userId, date, taskId } = req.body;
    const schedule = await DailySchedule.findOne({
      userId,
      date: new Date(date)
    });
    
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    
    // Find and clear the task that has this linkedEventId
    const timeBlock = schedule.schedule.find(block => block.linkedEventId === taskId);
    if (timeBlock) {
      timeBlock.task = '';
      timeBlock.linkedEventId = null;
      timeBlock.isCompleted = false;
      await schedule.save();
    }
    
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update day start time for a specific schedule
router.patch('/start-time', async (req, res) => {
  try {
    const { userId, date, startTime } = req.body;
    
    console.log(`📥 Received request to update start time:`, { userId, date, startTime });
    
    const schedule = await DailySchedule.findOne({
      userId,
      date: new Date(date)
    });
    
    if (!schedule) {
      console.log(`❌ Schedule not found for date: ${date}`);
      return res.status(404).json({ message: 'Schedule not found' });
    }
    
    console.log(`📋 Current schedule start time: ${schedule.dayStartTime}`);
    
    // Save current tasks
    const taskMap = {};
    schedule.schedule.forEach(block => {
      if (block.task) {
        taskMap[block.time] = {
          task: block.task,
          isCompleted: block.isCompleted,
          linkedEventId: block.linkedEventId,
          linkedChallengeId: block.linkedChallengeId
        };
      }
    });
    
    console.log(`💾 Preserved ${Object.keys(taskMap).length} tasks`);
    
    // Regenerate schedule with new start time
    const newSchedule = generateDefaultSchedule(startTime);
    
    // Try to preserve tasks in their time slots
    newSchedule.forEach(block => {
      if (taskMap[block.time]) {
        block.task = taskMap[block.time].task;
        block.isCompleted = taskMap[block.time].isCompleted;
        block.linkedEventId = taskMap[block.time].linkedEventId;
        block.linkedChallengeId = taskMap[block.time].linkedChallengeId;
      }
    });
    
    schedule.dayStartTime = startTime;
    schedule.schedule = newSchedule;
    await schedule.save();
    
    console.log(`✅ Schedule updated with start time: ${startTime}`);
    
    // Update user's default start time for future schedules
    // First check if user exists and current value
    const userBefore = await User.findById(userId);
    console.log(`👤 User BEFORE update:`, JSON.stringify({
      _id: userBefore?._id,
      username: userBefore?.username,
      dayStartTime: userBefore?.dayStartTime,
      type: typeof userBefore?.dayStartTime
    }));
    
    // Force update with $set and ensure it's a number
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { $set: { dayStartTime: parseInt(startTime) } },
      { new: true, runValidators: false }
    );
    
    console.log(`✅ User AFTER update (from findByIdAndUpdate):`, JSON.stringify({
      _id: updatedUser?._id,
      username: updatedUser?.username,
      dayStartTime: updatedUser?.dayStartTime,
      type: typeof updatedUser?.dayStartTime
    }));
    
    // Verify it was saved by doing a fresh query
    const userAfter = await User.findById(userId).lean();
    console.log(`🔍 User verified from DB (fresh query):`, JSON.stringify({
      _id: userAfter?._id,
      username: userAfter?.username,
      dayStartTime: userAfter?.dayStartTime,
      type: typeof userAfter?.dayStartTime
    }));
    
    res.json(schedule);
  } catch (error) {
    console.error(`💥 Error updating start time:`, error);
    res.status(500).json({ message: error.message });
  }
});

// Helper function to generate default 24-hour schedule
function generateDefaultSchedule(startHour = 7) {
  const schedule = [];
  for (let i = 0; i < 24; i++) {
    const hour = (startHour + i) % 24;
    const time = `${hour.toString().padStart(2, '0')}:00`;
    schedule.push({
      time,
      task: '',
      isCompleted: false
    });
  }
  return schedule;
}

// Initialize user's dayStartTime if not set (for existing users)
router.post('/init-user', async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // If dayStartTime is not set, initialize it to 7
    if (user.dayStartTime === undefined || user.dayStartTime === null) {
      user.dayStartTime = 7;
      await user.save();
      console.log(`🔧 Initialized user ${userId} dayStartTime to 7`);
    }
    
    res.json({ dayStartTime: user.dayStartTime });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
