const express = require('express');
const router = express.Router();
const InboxTask = require('../models/InboxTask');

// Get all inbox tasks
router.get('/', async (req, res) => {
  try {
    const { userId, category } = req.query;
    const query = { userId };
    
    if (category) {
      query.category = category;
    }
    
    const tasks = await InboxTask.find(query)
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create inbox task
router.post('/', async (req, res) => {
  try {
    const task = new InboxTask(req.body);
    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update task
router.put('/:id', async (req, res) => {
  try {
    const task = await InboxTask.findByIdAndUpdate(
      req.params.id,
      req.body,
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

// Process task (categorize)
router.patch('/:id/process', async (req, res) => {
  try {
    const { category } = req.body;
    const task = await InboxTask.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    task.category = category;
    task.isProcessed = true;
    task.processedAt = new Date();
    await task.save();
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
