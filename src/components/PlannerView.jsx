import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, Copy, Calendar, Clock } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://studyfire-backend.onrender.com/api';

export default function PlannerView({ user }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [schedule, setSchedule] = useState(null);
  const [editingTime, setEditingTime] = useState(null);
  const [editingTask, setEditingTask] = useState('');
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyFromDate, setCopyFromDate] = useState('');
  const [showStartTimeModal, setShowStartTimeModal] = useState(false);
  const [newStartTime, setNewStartTime] = useState(7);
  const [isUpdatingStartTime, setIsUpdatingStartTime] = useState(false);

  useEffect(() => {
    initializeUser();
    fetchSchedule();
  }, [selectedDate]);

  const initializeUser = async () => {
    try {
      await fetch(`${API_URL}/planner/init-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id }),
      });
    } catch (error) {
      console.error('Error initializing user:', error);
    }
  };

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
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      // Get the current time block to find linked task
      const timeBlock = schedule?.schedule?.find(block => block.time === time);
      
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
      
      // Sync task name to Inbox if linked
      if (timeBlock?.linkedEventId && task) {
        try {
          await fetch(`${API_URL}/inbox/${timeBlock.linkedEventId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task: task }),
          });
        } catch (err) {
          console.log('Task not in inbox or error syncing');
        }
      }
      
      // Sync task name to Calendar if linked
      if (timeBlock?.linkedEventId && task) {
        try {
          const eventsResponse = await fetch(`${API_URL}/calendar?userId=${user._id}&startDate=${dateStr}&endDate=${dateStr}`);
          const events = await eventsResponse.json();
          const calendarEvent = events.find(e => e.linkedPageId === timeBlock.linkedEventId);
          
          if (calendarEvent) {
            await fetch(`${API_URL}/calendar/${calendarEvent._id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title: task }),
            });
          }
        } catch (err) {
          console.log('Task not in calendar or error syncing');
        }
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const toggleComplete = async (time) => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      // Get the current time block to find linked task
      const timeBlock = schedule?.schedule?.find(block => block.time === time);
      
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
      
      // Sync completion to Inbox if task is linked
      if (timeBlock?.linkedEventId) {
        try {
          await fetch(`${API_URL}/inbox/${timeBlock.linkedEventId}/complete`, {
            method: 'PATCH',
          });
        } catch (err) {
          console.log('Task not in inbox or error syncing');
        }
      }
      
      // Sync completion to Calendar if task is linked
      if (timeBlock?.linkedEventId) {
        try {
          // Find calendar event by linkedPageId
          const eventsResponse = await fetch(`${API_URL}/calendar?userId=${user._id}&startDate=${dateStr}&endDate=${dateStr}`);
          const events = await eventsResponse.json();
          const calendarEvent = events.find(e => e.linkedPageId === timeBlock.linkedEventId);
          
          if (calendarEvent) {
            await fetch(`${API_URL}/calendar/${calendarEvent._id}/complete`, {
              method: 'PATCH',
            });
          }
        } catch (err) {
          console.log('Task not in calendar or error syncing');
        }
      }
    } catch (error) {
      console.error('Error toggling completion:', error);
    }
  };

  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const copyDayPlan = async () => {
    if (!copyFromDate) return;
    
    try {
      // Fetch the schedule from the source date
      const sourceResponse = await fetch(`${API_URL}/planner?userId=${user._id}&date=${copyFromDate}`);
      const sourceSchedule = await sourceResponse.json();
      
      // Copy to current selected date
      const targetDateStr = selectedDate.toISOString().split('T')[0];
      const copiedSchedule = {
        userId: user._id,
        date: targetDateStr,
        schedule: sourceSchedule.schedule.map(block => ({
          ...block,
          isCompleted: false, // Reset completion status
          _id: undefined // Remove old IDs
        })),
        notes: sourceSchedule.notes
      };
      
      const response = await fetch(`${API_URL}/planner`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(copiedSchedule),
      });
      
      const data = await response.json();
      setSchedule(data);
      setShowCopyModal(false);
      setCopyFromDate('');
    } catch (error) {
      console.error('Error copying day plan:', error);
    }
  };

  const updateStartTime = async () => {
    try {
      setIsUpdatingStartTime(true);
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await fetch(`${API_URL}/planner/start-time`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          date: dateStr,
          startTime: newStartTime,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update start time');
      }
      
      const data = await response.json();
      setSchedule(data);
      setShowStartTimeModal(false);
      setIsUpdatingStartTime(false);
    } catch (error) {
      console.error('Error updating start time:', error);
      setIsUpdatingStartTime(false);
      alert('Failed to update start time. Please try again.');
    }
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
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setSelectedDate(new Date())}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Today
              </button>
              <span className="text-gray-600">•</span>
              <button
                onClick={() => setShowCopyModal(true)}
                className="text-sm text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                Copy from another day
              </button>
              <span className="text-gray-600">•</span>
              <button
                onClick={() => {
                  setNewStartTime(schedule?.dayStartTime || 7);
                  setShowStartTimeModal(true);
                }}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
              >
                <Clock className="w-3 h-3" />
                Start time: {schedule?.dayStartTime || 7}:00
              </button>
            </div>
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

      {/* Copy Day Modal */}
      {showCopyModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowCopyModal(false)}
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
                <Copy className="w-5 h-5 text-orange-500" />
                Copy Day Plan
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Select date to copy from:</label>
                <input
                  type="date"
                  value={copyFromDate}
                  onChange={(e) => setCopyFromDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="bg-gray-700/50 rounded-xl p-4 text-sm text-gray-300">
                <p className="mb-2">📋 This will copy all tasks from the selected day to:</p>
                <p className="font-bold text-orange-400">{formatDate(selectedDate)}</p>
                <p className="mt-2 text-xs text-gray-500">Note: Completion status will be reset</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={copyDayPlan}
                  disabled={!copyFromDate}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Copy Schedule
                </button>
                <button
                  onClick={() => {
                    setShowCopyModal(false);
                    setCopyFromDate('');
                  }}
                  className="px-6 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Start Time Modal */}
      {showStartTimeModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowStartTimeModal(false)}
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
                <Clock className="w-5 h-5 text-blue-500" />
                Change Day Start Time
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">What time does your day start?</label>
                <select
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(Number(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {i.toString().padStart(2, '0')}:00 {i < 12 ? 'AM' : 'PM'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 text-sm text-gray-300">
                <p className="mb-2">⏰ For {formatDate(selectedDate)} and all future days:</p>
                <p className="text-blue-400">• Schedule will reorganize from {newStartTime}:00</p>
                <p className="text-blue-400">• Existing tasks will be preserved</p>
                <p className="mt-2 text-xs text-orange-400 font-semibold">✨ This will automatically update all days from today onwards!</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={updateStartTime}
                  disabled={isUpdatingStartTime}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isUpdatingStartTime ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Updating All Days...
                    </>
                  ) : (
                    'Update Start Time'
                  )}
                </button>
                <button
                  onClick={() => setShowStartTimeModal(false)}
                  disabled={isUpdatingStartTime}
                  className="px-6 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
