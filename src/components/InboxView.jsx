import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, CheckCircle, Clock, Calendar, Bell, Edit2, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://studyfire-backend.onrender.com/api';

export default function InboxView({ user }) {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [filter, setFilter] = useState('unprocessed');
  const [editingTask, setEditingTask] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [taskCounts, setTaskCounts] = useState({});

  useEffect(() => {
    recalculateCategories();
    fetchTasks();
    fetchTaskCounts();
  }, [filter]);

  const fetchTaskCounts = async () => {
    try {
      const categories = ['unprocessed', 'today', 'week', 'month', 'someday'];
      const counts = {};
      
      for (const cat of categories) {
        const response = await fetch(`${API_URL}/inbox?userId=${user._id}&category=${cat}`);
        const data = await response.json();
        counts[cat] = Array.isArray(data) ? data.length : 0;
      }
      
      setTaskCounts(counts);
    } catch (error) {
      console.error('Error fetching task counts:', error);
    }
  };

  const recalculateCategories = async () => {
    try {
      await fetch(`${API_URL}/inbox/recalculate-categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id }),
      });
    } catch (error) {
      console.error('Error recalculating categories:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const query = `?userId=${user._id}&category=${filter}`;
      const response = await fetch(`${API_URL}/inbox${query}`);
      const data = await response.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    }
  };

  const addTask = async () => {
    if (!newTask.trim()) return;

    try {
      const taskData = {
        userId: user._id,
        task: newTask,
      };

      // Add reminder date/time if provided
      if (reminderDate) {
        taskData.reminderDate = reminderDate;
        if (reminderTime) {
          taskData.reminderTime = reminderTime;
        }
      }

      const response = await fetch(`${API_URL}/inbox`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      const savedTask = await response.json();
      
      // Only add to current view if it matches the filter
      if (filter === 'unprocessed' && !reminderDate) {
        setTasks([savedTask, ...tasks]);
      } else if (filter === savedTask.category) {
        setTasks([savedTask, ...tasks]);
      }
      
      setNewTask('');
      setReminderDate('');
      setReminderTime('');
      fetchTasks(); // Refresh to show in correct category
      fetchTaskCounts(); // Update counts
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const toggleComplete = async (taskId) => {
    try {
      // Get the task details first
      const task = tasks.find(t => t._id === taskId);
      
      const response = await fetch(`${API_URL}/inbox/${taskId}/complete`, {
        method: 'PATCH',
      });
      const updatedTask = await response.json();
      
      // Sync completion status to Planner if task has date+time
      if (task?.reminderDate && task?.reminderTime) {
        try {
          const dateStr = new Date(task.reminderDate).toISOString().split('T')[0];
          // Round time to nearest hour
          const [hours, minutes] = task.reminderTime.split(':').map(Number);
          const roundedHour = minutes >= 30 ? hours + 1 : hours;
          const roundedTime = `${roundedHour.toString().padStart(2, '0')}:00`;
          
          await fetch(`${API_URL}/planner/toggle`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user._id,
              date: dateStr,
              time: roundedTime,
            }),
          });
        } catch (err) {
          console.log('Task not in planner or error syncing');
        }
      }
      
      // Sync completion status to Calendar
      if (task?.reminderDate) {
        try {
          // Find calendar event by linkedPageId (which is the inbox task ID)
          const eventsResponse = await fetch(`${API_URL}/calendar?userId=${user._id}&startDate=${task.reminderDate}&endDate=${task.reminderDate}`);
          const events = await eventsResponse.json();
          const calendarEvent = events.find(e => e.linkedPageId === taskId);
          
          if (calendarEvent) {
            await fetch(`${API_URL}/calendar/${calendarEvent._id}/complete`, {
              method: 'PATCH',
            });
          }
        } catch (err) {
          console.log('Task not in calendar or error syncing');
        }
      }
      
      // If we're in the completed filter, just update the task
      if (filter === 'completed') {
        setTasks(tasks.map(t => t._id === taskId ? updatedTask : t));
      } else {
        // If completed, remove from current view (will show in Completed tab)
        if (updatedTask.isCompleted) {
          setTasks(tasks.filter(t => t._id !== taskId));
        } else {
          setTasks(tasks.map(t => t._id === taskId ? updatedTask : t));
        }
      }
    } catch (error) {
      console.error('Error toggling completion:', error);
    }
  };

  const updateTaskDateTime = async (taskId, date, time) => {
    try {
      // Get old task data before update
      const oldTask = tasks.find(t => t._id === taskId);
      
      const response = await fetch(`${API_URL}/inbox/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reminderDate: date || null,
          reminderTime: time || null,
        }),
      });
      const updatedTask = await response.json();
      
      // Remove from old planner slot if it existed
      if (oldTask?.reminderDate && oldTask?.reminderTime) {
        try {
          const oldDateStr = new Date(oldTask.reminderDate).toISOString().split('T')[0];
          await fetch(`${API_URL}/planner/delete-task`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user._id,
              date: oldDateStr,
              taskId: taskId,
            }),
          });
        } catch (err) {
          console.log('Old planner entry not found');
        }
      }
      
      // Delete old calendar event if it existed
      if (oldTask?.reminderDate) {
        try {
          await fetch(`${API_URL}/calendar/by-page/${taskId}`, { method: 'DELETE' });
        } catch (err) {
          console.log('Old calendar entry not found');
        }
      }
      
      // Add to new planner slot if date and time are set
      if (date && time) {
        try {
          const newDateStr = new Date(date).toISOString().split('T')[0];
          // Round time to nearest hour
          const [hours, minutes] = time.split(':').map(Number);
          const roundedHour = minutes >= 30 ? (hours + 1) % 24 : hours;
          const roundedTime = `${roundedHour.toString().padStart(2, '0')}:00`;
          
          await fetch(`${API_URL}/planner/add-task`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user._id,
              date: newDateStr,
              time: roundedTime,
              task: updatedTask.task,
              linkedEventId: taskId,
            }),
          });
        } catch (err) {
          console.log('Error adding to planner');
        }
      }
      
      // Add new calendar event if date is set
      if (date) {
        try {
          await fetch(`${API_URL}/calendar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user._id,
              date: date,
              time: time || '00:00',
              title: updatedTask.task,
              linkedPageId: taskId,
              isCompleted: updatedTask.isCompleted,
            }),
          });
        } catch (err) {
          console.log('Error adding to calendar');
        }
      }
      
      setEditingTask(null);
      setEditDate('');
      setEditTime('');
      fetchTasks(); // Refresh to show in correct category
      fetchTaskCounts(); // Update counts
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      // First get the task details to know which planner/calendar entries to delete
      const taskToDelete = tasks.find(t => t._id === taskId);
      
      // Delete from inbox
      await fetch(`${API_URL}/inbox/${taskId}`, { method: 'DELETE' });
      
      // If task had a linked planner entry, delete it
      if (taskToDelete?.reminderDate && taskToDelete?.reminderTime) {
        try {
          const dateStr = new Date(taskToDelete.reminderDate).toISOString().split('T')[0];
          await fetch(`${API_URL}/planner/delete-task`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user._id,
              date: dateStr,
              taskId: taskId
            }),
          });
        } catch (err) {
          console.log('Task not in planner or already deleted');
        }
      }
      
      // Delete from calendar if it exists
      try {
        await fetch(`${API_URL}/calendar/by-page/${taskId}`, { method: 'DELETE' });
      } catch (err) {
        console.log('Task not in calendar or already deleted');
      }
      
      setTasks(tasks.filter(t => t._id !== taskId));
      fetchTaskCounts(); // Update counts
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const categories = [
    { id: 'unprocessed', label: 'Unprocessed', color: 'yellow', icon: '📝' },
    { id: 'today', label: 'Today', color: 'red', icon: '🔥' },
    { id: 'week', label: 'This Week', color: 'orange', icon: '📅' },
    { id: 'month', label: 'This Month', color: 'blue', icon: '📆' },
    { id: 'someday', label: 'Someday', color: 'purple', icon: '💭' },
    { id: 'completed', label: 'Completed', color: 'green', icon: '✅' },
  ];

  const formatDateTime = (date, time) => {
    if (!date) return 'No reminder set';
    const dateObj = new Date(date);
    const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return time ? `${dateStr} at ${time}` : dateStr;
  };

  const getWeekInfo = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  const getMonthInfo = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Add Task Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
      >
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Plus className="w-6 h-6 text-orange-500" />
          Brain Dump
        </h2>
        <div className="space-y-4">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
            placeholder="What's on your mind?"
            className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          
          <div className="flex gap-4">
            <div className="flex-1 flex items-center gap-2 bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                className="flex-1 bg-transparent text-white text-sm focus:outline-none"
                placeholder="Date (optional)"
              />
            </div>
            
            <div className="flex items-center gap-2 bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="bg-transparent text-white text-sm focus:outline-none"
                placeholder="Time (optional)"
              />
            </div>
            
            <button
              onClick={addTask}
              className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-2 rounded-xl font-medium hover:shadow-lg hover:shadow-orange-500/30 transition-all whitespace-nowrap"
            >
              Add Task
            </button>
          </div>
          
          {(reminderDate || reminderTime) && (
            <p className="text-xs text-gray-400 flex items-center gap-2">
              <Bell className="w-3 h-3" />
              {reminderDate ? 'Reminder set for ' + formatDateTime(reminderDate, reminderTime) : 'Please select a date'}
            </p>
          )}
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <div className="space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                filter === cat.id
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:text-white'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
              {/* Show count badge for all except completed */}
              {cat.id !== 'completed' && taskCounts[cat.id] !== undefined && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  filter === cat.id 
                    ? 'bg-white/20 text-white' 
                    : 'bg-gray-700 text-gray-300'
                }`}>
                  {taskCounts[cat.id]}
                </span>
              )}
            </button>
          ))}
        </div>
        
        {/* Show current week/month info */}
        {(filter === 'week' || filter === 'month') && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/30 backdrop-blur-sm rounded-xl px-4 py-2 text-sm text-gray-400 border border-gray-700/30"
          >
            {filter === 'week' && `📅 Week of ${getWeekInfo()}`}
            {filter === 'month' && `📆 ${getMonthInfo()}`}
          </motion.div>
        )}
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-700/30"
          >
            <p className="text-gray-400 text-lg">
              {filter === 'unprocessed' && 'No unprocessed tasks. Add one above!'}
              {filter === 'today' && 'No tasks for today. Looking good! 🔥'}
              {filter === 'week' && 'No tasks this week. You\'re ahead! 📅'}
              {filter === 'month' && 'No tasks this month. Plan ahead! 📆'}
              {filter === 'completed' && 'No completed tasks yet. Get to work! 💪'}
            </p>
          </motion.div>
        ) : (
          tasks.map((task, index) => (
            <motion.div
              key={task._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border transition-all group ${
                task.isCompleted
                  ? 'border-green-500/30 bg-green-900/10'
                  : 'border-gray-700/50 hover:border-orange-500/50'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                {filter !== 'completed' && (
                  <button
                    onClick={() => toggleComplete(task._id)}
                    className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all mt-1 ${
                      task.isCompleted
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-500 hover:border-orange-500'
                    }`}
                  >
                    {task.isCompleted && <CheckCircle className="w-4 h-4 text-white" />}
                  </button>
                )}

                <div className="flex-1">
                  <p className={`font-medium mb-2 ${task.isCompleted ? 'line-through text-gray-400' : 'text-white'}`}>
                    {task.task}
                  </p>
                  
                  {/* Reminder Info */}
                  {task.reminderDate && (
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                      <Bell className="w-4 h-4" />
                      <span>{formatDateTime(task.reminderDate, task.reminderTime)}</span>
                    </div>
                  )}

                  {/* Edit DateTime Button - Available for all tasks */}
                  {!task.isCompleted && (
                    <button
                      onClick={() => {
                        setEditingTask(task._id);
                        setEditDate(task.reminderDate ? new Date(task.reminderDate).toISOString().split('T')[0] : '');
                        setEditTime(task.reminderTime || '');
                      }}
                      className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit2 className="w-3 h-3" />
                      {task.reminderDate ? 'Edit reminder' : 'Set reminder'}
                    </button>
                  )}
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => deleteTask(task._id)}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Edit DateTime Modal */}
      <AnimatePresence>
        {editingTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setEditingTask(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Bell className="w-5 h-5 text-orange-500" />
                  Set Reminder
                </h3>
                <button
                  onClick={() => setEditingTask(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Date</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Time (optional)</label>
                  <input
                    type="time"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => updateTaskDateTime(editingTask, editDate, editTime)}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-orange-500/30 transition-all"
                  >
                    Save Reminder
                  </button>
                  <button
                    onClick={() => {
                      updateTaskDateTime(editingTask, null, null);
                    }}
                    className="px-4 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-medium transition-all"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
