const express = require('express');
const router = express.Router();
const InboxTask = require('../models/InboxTask');

// Helper function to calculate category based on date
function calculateCategory(reminderDate) {
  if (!reminderDate) return 'unprocessed';
  
  const now = new Date();
  const reminder = new Date(reminderDate);
  const diffTime = reminder - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'today'; // Overdue = today
  if (diffDays === 0) return 'today';
  if (diffDays <= 7) return 'week';
  if (diffDays <= 30) return 'month';
  return 'month'; // Beyond 30 days still in month category
}

// Get all inbox tasks
router.get('/', async (req, res) => {
  try {
    const { userId, category } = req.query;
    const query = { userId, isCompleted: false };
    
    if (category && category !== 'unprocessed') {
      query.category = category;
    } else if (category === 'unprocessed') {
      query.reminderDate = { $exists: false };
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

module.exports = router;
