const express = require('express');
const router = express.Router();
const InboxTask = require('../models/InboxTask');
const DailySchedule = require('../models/DailySchedule');
const CalendarEvent = require('../models/CalendarEvent');

// Helper function to sync task to Planner
async function syncToPlanner(taskData) {
  try {
    const { userId, reminderDate, reminderTime, task } = taskData;
    if (!userId || !reminderDate || !reminderTime) return;
    
    // Find or create schedule for that day
    const dateOnly = new Date(reminderDate);
    dateOnly.setHours(0, 0, 0, 0);
    
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
    }
    
    // Find the time block and update it
    const timeBlock = schedule.schedule.find(block => block.time === reminderTime);
    if (timeBlock) {
      timeBlock.task = task;
      timeBlock.linkedEventId = taskData._id;
      await schedule.save();
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
  
  // Check if it's TODAY
  if (taskDate.getTime() === today.getTime()) {
    return 'today';
  }
  
  // Check if it's THIS WEEK (Sunday to Saturday of current week)
  const currentDayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - currentDayOfWeek); // Go back to Sunday
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
  
  if (taskDate >= startOfWeek && taskDate <= endOfWeek && taskDate > today) {
    return 'week';
  }
  
  // Check if it's THIS MONTH
  if (taskDate.getMonth() === today.getMonth() && taskDate.getFullYear() === today.getFullYear()) {
    return 'month';
  }
  
  // Check if it's in the PAST (overdue = today)
  if (taskDate < today) {
    return 'today';
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
