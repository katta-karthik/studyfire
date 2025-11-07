const express = require('express');
const router = express.Router();
const DailySchedule = require('../models/DailySchedule');

// Get schedule for specific date
router.get('/', async (req, res) => {
  try {
    const { userId, date } = req.query;
    const schedule = await DailySchedule.findOne({
      userId,
      date: new Date(date)
    });
    
    // If no schedule exists, create default hourly schedule
    if (!schedule) {
      const defaultSchedule = generateDefaultSchedule();
      const newSchedule = new DailySchedule({
        userId,
        date: new Date(date),
        schedule: defaultSchedule
      });
      const savedSchedule = await newSchedule.save();
      return res.json(savedSchedule);
    }
    
    res.json(schedule);
  } catch (error) {
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

// Helper function to generate default 24-hour schedule
function generateDefaultSchedule() {
  const schedule = [];
  for (let hour = 7; hour < 31; hour++) {
    const displayHour = hour >= 24 ? hour - 24 : hour;
    const time = `${displayHour.toString().padStart(2, '0')}:00`;
    schedule.push({
      time,
      task: '',
      isCompleted: false
    });
  }
  return schedule;
}

module.exports = router;
