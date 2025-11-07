const express = require('express');
const router = express.Router();
const InboxTask = require('../models/InboxTask');
const DailySchedule = require('../models/DailySchedule');
const CalendarEvent = require('../models/CalendarEvent');

// Helper function to round time to nearest hour (railway/24h format)
function roundTimeToNearestHour(timeStr) {
  if (!timeStr) return timeStr;
  
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  // If minutes >= 30, round up to next hour
  // If minutes < 30, round down to current hour
  let roundedHour = minutes >= 30 ? hours + 1 : hours;
  
  // Handle 24-hour wrap (23:45 → 00:00)
  if (roundedHour >= 24) roundedHour = 0;
  
  // Format as HH:00 (railway time, 24-hour format)
  return `${roundedHour.toString().padStart(2, '0')}:00`;
}

// Helper function to sync task to Planner
async function syncToPlanner(taskData) {
  try {
    const { userId, reminderDate, reminderTime, task } = taskData;
    if (!userId || !reminderDate || !reminderTime) return;
    
    // Round the time to nearest hour
    const roundedTime = roundTimeToNearestHour(reminderTime);
    
    // Format date as YYYY-MM-DD
    const dateOnly = new Date(reminderDate);
    const dateStr = dateOnly.toISOString().split('T')[0];
    
    // Find or create schedule for that day
    let schedule = await DailySchedule.findOne({
      userId,
      date: dateOnly
    });
    
    if (!schedule) {
      // Create default schedule
      schedule = new DailySchedule({
        userId,
        date: dateOnly,
        schedule: generateDefaultSchedule()
      });
      await schedule.save();
    }
    
    // Find the time block and update it
    const timeBlock = schedule.schedule.find(block => block.time === roundedTime);
    if (timeBlock) {
      timeBlock.task = task;
      timeBlock.linkedEventId = taskData._id;
      await schedule.save();
      console.log(`✅ Synced to Planner: ${task} at ${roundedTime} on ${dateStr}`);
    } else {
      console.log(`⚠️ Time block not found: ${roundedTime}`);
    }
  } catch (error) {
    console.error('Error syncing to planner:', error);
  }
}

// Helper function to sync task to Calendar
async function syncToCalendar(taskData) {
  try {
    const { userId, reminderDate, reminderTime, task, _id } = taskData;
    if (!userId || !reminderDate) return;
    
    // Check if calendar event already exists
    const existingEvent = await CalendarEvent.findOne({
      userId,
      linkedPageId: _id
    });
    
    if (existingEvent) {
      // Update existing event
      existingEvent.title = task;
      existingEvent.date = reminderDate;
      existingEvent.startTime = reminderTime || '';
      await existingEvent.save();
    } else {
      // Create new calendar event
      const calendarEvent = new CalendarEvent({
        userId,
        title: task,
        date: reminderDate,
        startTime: reminderTime || '',
        type: 'reminder',
        color: '#FF6B35',
        linkedPageId: _id
      });
      await calendarEvent.save();
    }
  } catch (error) {
    console.error('Error syncing to calendar:', error);
  }
}

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

// Helper function to calculate category based on CALENDAR date
function calculateCategory(reminderDate) {
  if (!reminderDate) return 'unprocessed';
  
  const now = new Date();
  const reminder = new Date(reminderDate);
  
  // Normalize dates to compare only year/month/day (ignore time)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const taskDate = new Date(reminder.getFullYear(), reminder.getMonth(), reminder.getDate());
  
  // Check if it's TODAY (most important check - do this FIRST)
  if (taskDate.getTime() === today.getTime()) {
    return 'today';
  }
  
  // Check if it's in the PAST (overdue = today category)
  if (taskDate < today) {
    return 'today';
  }
  
  // Check if it's THIS WEEK (Sunday to Saturday of current week, EXCLUDING today)
  const currentDayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - currentDayOfWeek); // Go back to Sunday
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
  
  // Task is in THIS WEEK if: between Sunday and Saturday AND after today
  if (taskDate > today && taskDate >= startOfWeek && taskDate <= endOfWeek) {
    return 'week';
  }
  
  // Check if it's THIS MONTH (EXCLUDING today and this week)
  if (taskDate.getMonth() === today.getMonth() && taskDate.getFullYear() === today.getFullYear()) {
    return 'month';
  }
  
  // Everything else is SOMEDAY (future months)
  return 'someday';
}

// Get all inbox tasks
router.get('/', async (req, res) => {
  try {
    const { userId, category } = req.query;
    const query = { userId };
    
    // Filter by completion status
    if (category === 'completed') {
      query.isCompleted = true;
    } else {
      query.isCompleted = false;
      
      // Then filter by category for non-completed tasks
      if (category === 'unprocessed') {
        query.reminderDate = { $exists: false };
      } else if (category && category !== 'completed') {
        query.category = category;
      }
    }
    
    const tasks = await InboxTask.find(query)
      .sort({ reminderDate: 1, createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create inbox task
router.post('/', async (req, res) => {
  try {
    const taskData = req.body;
    
    // Auto-calculate category based on reminderDate
    if (taskData.reminderDate) {
      taskData.category = calculateCategory(taskData.reminderDate);
    } else {
      taskData.category = 'unprocessed';
    }
    
    const task = new InboxTask(taskData);
    const savedTask = await task.save();
    
    // Sync with Planner if time is provided
    if (savedTask.reminderDate && savedTask.reminderTime) {
      await syncToPlanner(savedTask.toObject());
    }
    
    // Sync with Calendar if date is provided
    if (savedTask.reminderDate) {
      await syncToCalendar(savedTask.toObject());
    }
    
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update task
router.put('/:id', async (req, res) => {
  try {
    const taskData = req.body;
    
    // Auto-calculate category if reminderDate is provided
    if (taskData.reminderDate) {
      taskData.category = calculateCategory(taskData.reminderDate);
    }
    
    const task = await InboxTask.findByIdAndUpdate(
      req.params.id,
      taskData,
      { new: true, runValidators: true }
    );
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Sync with Planner if time is provided
    if (task.reminderDate && task.reminderTime) {
      await syncToPlanner(task.toObject());
    }
    
    // Sync with Calendar if date is provided
    if (task.reminderDate) {
      await syncToCalendar(task.toObject());
    }
    
    res.json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const task = await InboxTask.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark task as completed
router.patch('/:id/complete', async (req, res) => {
  try {
    const task = await InboxTask.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    task.isCompleted = !task.isCompleted;
    task.completedAt = task.isCompleted ? new Date() : null;
    task.category = task.isCompleted ? 'completed' : calculateCategory(task.reminderDate);
    await task.save();
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get tasks due for notification
router.get('/due-notifications', async (req, res) => {
  try {
    const { userId } = req.query;
    const now = new Date();
    
    const tasks = await InboxTask.find({
      userId,
      isCompleted: false,
      notificationShown: false,
      reminderDate: { $lte: now }
    });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark notification as shown
router.patch('/:id/notification-shown', async (req, res) => {
  try {
    const task = await InboxTask.findByIdAndUpdate(
      req.params.id,
      { notificationShown: true },
      { new: true }
    );
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Recalculate categories for all tasks (called on dashboard load)
router.post('/recalculate-categories', async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Get all non-completed tasks with reminder dates
    const tasks = await InboxTask.find({
      userId,
      isCompleted: false,
      reminderDate: { $exists: true, $ne: null }
    });
    
    // Update each task's category
    const updates = tasks.map(async (task) => {
      const newCategory = calculateCategory(task.reminderDate);
      if (task.category !== newCategory) {
        task.category = newCategory;
        await task.save();
      }
      return task;
    });
    
    await Promise.all(updates);
    
    res.json({ message: 'Categories updated', count: tasks.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
