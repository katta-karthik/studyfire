import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, Copy } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://studyfire-backend.onrender.com/api';

export default function PlannerView({ user }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [schedule, setSchedule] = useState(null);
  const [editingTime, setEditingTime] = useState(null);

  useEffect(() => {
    fetchSchedule();
  }, [selectedDate]);

  const fetchSchedule = async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await fetch(`${API_URL}/planner?userId=${user._id}&date=${dateStr}`);
      const data = await response.json();
      setSchedule(data);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };

  const updateTask = async (time, task) => {
    try {
      const updatedSchedule = {
        ...schedule,
        schedule: schedule.schedule.map(block =>
          block.time === time ? { ...block, task } : block
        ),
      };

      const response = await fetch(`${API_URL}/planner`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSchedule),
      });

      const data = await response.json();
      setSchedule(data);
      setEditingTime(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const toggleComplete = async (time) => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await fetch(`${API_URL}/planner/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          date: dateStr,
          time,
        }),
      });

      const data = await response.json();
      setSchedule(data);
    } catch (error) {
      console.error('Error toggling completion:', error);
    }
  };

  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!schedule) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => changeDate(-1)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-orange-500">{formatDate(selectedDate)}</h2>
            <button
              onClick={() => setSelectedDate(new Date())}
              className="text-sm text-gray-400 hover:text-white transition-colors mt-1"
            >
              Today
            </button>
          </div>

          <button
            onClick={() => changeDate(1)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </motion.div>

      {/* Hourly Schedule */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
      >
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          ⏰ Daily Schedule
          <span className="text-sm text-gray-400 font-normal">
            (07:00 - 07:00)
          </span>
        </h3>

        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {schedule.schedule.map((block, index) => (
            <motion.div
              key={block.time}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02 }}
              className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${
                block.isCompleted
                  ? 'bg-green-900/20 border-green-500/30'
                  : 'bg-gray-700/30 border-gray-600/30 hover:border-orange-500/30'
              }`}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleComplete(block.time)}
                className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                  block.isCompleted
                    ? 'bg-green-500 border-green-500'
                    : 'border-gray-500 hover:border-orange-500'
                }`}
              >
                {block.isCompleted && <Check className="w-4 h-4 text-white" />}
              </button>

              {/* Time */}
              <div className="w-20 text-gray-400 font-mono text-sm flex-shrink-0">
                {block.time}
              </div>

              {/* Task Input */}
              {editingTime === block.time ? (
                <input
                  type="text"
                  defaultValue={block.task}
                  autoFocus
                  onBlur={(e) => updateTask(block.time, e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      updateTask(block.time, e.target.value);
                    }
                  }}
                  className="flex-1 bg-gray-600 border border-orange-500 rounded-lg px-3 py-2 text-white focus:outline-none"
                  placeholder="What are you working on?"
                />
              ) : (
                <div
                  onClick={() => setEditingTime(block.time)}
                  className="flex-1 cursor-pointer"
                >
                  {block.task ? (
                    <span className={block.isCompleted ? 'line-through text-gray-400' : 'text-white'}>
                      {block.task}
                    </span>
                  ) : (
                    <span className="text-gray-500 italic">Click to add task...</span>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-3 gap-4"
      >
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
          <div className="text-3xl font-bold text-orange-500">
            {schedule.schedule.filter(b => b.task).length}
          </div>
          <div className="text-sm text-gray-400">Planned</div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
          <div className="text-3xl font-bold text-green-500">
            {schedule.schedule.filter(b => b.isCompleted).length}
          </div>
          <div className="text-sm text-gray-400">Completed</div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
          <div className="text-3xl font-bold text-blue-500">
            {schedule.schedule.filter(b => b.task && !b.isCompleted).length}
          </div>
          <div className="text-sm text-gray-400">Remaining</div>
        </div>
      </motion.div>
    </div>
  );
}
