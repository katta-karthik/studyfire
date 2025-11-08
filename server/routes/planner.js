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

// Add task to planner (when inbox task is created or updated)
router.post('/add-task', async (req, res) => {
  try {
    const { userId, date, time, task, linkedEventId } = req.body;
    
    let schedule = await DailySchedule.findOne({
      userId,
      date: new Date(date)
    });
    
    // If schedule doesn't exist, create it
    if (!schedule) {
      const user = await User.findById(userId);
      const startHour = user?.dayStartTime !== undefined ? user.dayStartTime : 7;
      schedule = new DailySchedule({
        userId,
        date: new Date(date),
        dayStartTime: parseInt(startHour),
        schedule: generateDefaultSchedule(startHour)
      });
    }
    
    // Find the time block and add the task
    const timeBlock = schedule.schedule.find(block => block.time === time);
    if (timeBlock) {
      timeBlock.task = task;
      timeBlock.linkedEventId = linkedEventId;
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
    
    // Helper function to update a single schedule
    const updateScheduleStartTime = (scheduleDoc) => {
      // Save current tasks
      const taskMap = {};
      scheduleDoc.schedule.forEach(block => {
        if (block.task) {
          taskMap[block.time] = {
            task: block.task,
            isCompleted: block.isCompleted,
            linkedEventId: block.linkedEventId,
            linkedChallengeId: block.linkedChallengeId
          };
        }
      });
      
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
      
      scheduleDoc.dayStartTime = startTime;
      scheduleDoc.schedule = newSchedule;
      return scheduleDoc;
    };
    
    // Update the current day
    updateScheduleStartTime(schedule);
    schedule.$ignore('__v'); // Ignore version key to avoid conflicts
    await schedule.save();
    console.log(`✅ Updated schedule for ${date} with start time: ${startTime}`);
    
    // Find and update ALL future schedules (dates after this one)
    const currentDate = new Date(date);
    const futureSchedules = await DailySchedule.find({
      userId,
      date: { $gt: currentDate }
    });
    
    console.log(`📅 Found ${futureSchedules.length} future schedules to update`);
    
    // Update each future schedule with proper error handling
    const updatePromises = futureSchedules.map(async (futureSchedule) => {
      try {
        updateScheduleStartTime(futureSchedule);
        futureSchedule.$ignore('__v'); // Ignore version key to avoid conflicts
        await futureSchedule.save();
        console.log(`  ✅ Updated ${futureSchedule.date.toISOString().split('T')[0]} to start at ${startTime}:00`);
      } catch (err) {
        console.error(`  ⚠️ Error updating ${futureSchedule.date.toISOString().split('T')[0]}:`, err.message);
        // Continue with other updates even if one fails
      }
    });
    
    // Wait for all updates to complete
    await Promise.all(updatePromises);
    console.log(`🎉 Completed updating all future schedules`);
    
    // Update user's default start time for any new schedules created later
    const userBefore = await User.findById(userId);
    console.log(`👤 User BEFORE update:`, JSON.stringify({
      _id: userBefore?._id,
      username: userBefore?.username,
      dayStartTime: userBefore?.dayStartTime,
      type: typeof userBefore?.dayStartTime
    }));
    
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { $set: { dayStartTime: parseInt(startTime) } },
      { new: true, runValidators: false }
    );
    
    console.log(`✅ User AFTER update:`, JSON.stringify({
      _id: updatedUser?._id,
      username: updatedUser?.username,
      dayStartTime: updatedUser?.dayStartTime,
      type: typeof updatedUser?.dayStartTime
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
