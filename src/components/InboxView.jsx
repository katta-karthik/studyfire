import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, CheckCircle, Clock, Tag } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://studyfire-backend.onrender.com/api';

export default function InboxView({ user }) {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [estimatedTime, setEstimatedTime] = useState(30);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const fetchTasks = async () => {
    try {
      const query = filter === 'all' ? '' : `?category=${filter}`;
      const response = await fetch(`${API_URL}/inbox?userId=${user._id}${query}`);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const addTask = async () => {
    if (!newTask.trim()) return;

    try {
      const response = await fetch(`${API_URL}/inbox`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          task: newTask,
          estimatedTime,
          category: 'unprocessed',
        }),
      });
      const savedTask = await response.json();
      setTasks([savedTask, ...tasks]);
      setNewTask('');
      setEstimatedTime(30);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const categorizeTask = async (taskId, category) => {
    try {
      const response = await fetch(`${API_URL}/inbox/${taskId}/process`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category }),
      });
      const updatedTask = await response.json();
      setTasks(tasks.map(t => t._id === taskId ? updatedTask : t));
    } catch (error) {
      console.error('Error categorizing task:', error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await fetch(`${API_URL}/inbox/${taskId}`, { method: 'DELETE' });
      setTasks(tasks.filter(t => t._id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const categories = [
    { id: 'all', label: 'All', color: 'gray' },
    { id: 'unprocessed', label: 'Unprocessed', color: 'yellow' },
    { id: 'today', label: 'Today', color: 'red' },
    { id: 'week', label: 'This Week', color: 'orange' },
    { id: 'month', label: 'This Month', color: 'blue' },
    { id: 'someday', label: 'Someday', color: 'purple' },
  ];

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
        <div className="flex gap-4">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
            placeholder="What's on your mind?"
            className="flex-1 bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <div className="flex items-center gap-2 bg-gray-700/50 border border-gray-600 rounded-xl px-4">
            <Clock className="w-4 h-4 text-gray-400" />
            <input
              type="number"
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(parseInt(e.target.value))}
              min="5"
              max="480"
              className="w-16 bg-transparent text-white focus:outline-none"
            />
            <span className="text-gray-400 text-sm">min</span>
          </div>
          <button
            onClick={addTask}
            className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-orange-500/30 transition-all"
          >
            Add
          </button>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
              filter === cat.id
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-700/30"
          >
            <p className="text-gray-400 text-lg">No tasks yet. Start adding some!</p>
          </motion.div>
        ) : (
          tasks.map((task, index) => (
            <motion.div
              key={task._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-orange-500/50 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <p className="text-white font-medium mb-2">{task.task}</p>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {task.estimatedTime} min
                    </span>
                    {task.isProcessed && (
                      <span className="flex items-center gap-1 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        Processed
                      </span>
                    )}
                  </div>
                </div>

                {/* Categorize Buttons */}
                {!task.isProcessed && (
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {['today', 'week', 'month', 'someday'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => categorizeTask(task._id, cat)}
                        className="px-3 py-1 bg-gray-700 hover:bg-orange-500 rounded-lg text-xs font-medium transition-colors"
                        title={`Move to ${cat}`}
                      >
                        {cat === 'today' && '🔥'}
                        {cat === 'week' && '📅'}
                        {cat === 'month' && '📆'}
                        {cat === 'someday' && '💭'}
                      </button>
                    ))}
                  </div>
                )}

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
    </div>
  );
}
