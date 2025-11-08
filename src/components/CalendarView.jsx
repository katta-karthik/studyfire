import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, X, Calendar as CalendarIcon, Trash2, Edit2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://studyfire-backend.onrender.com/api';

export default function CalendarView({ user }) {
  const [view, setView] = useState('year'); // 'year' or 'month'
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    type: 'event',
    color: '#FF6B35',
  });

  useEffect(() => {
    fetchEvents();
  }, [selectedYear, selectedMonth]);

  const fetchEvents = async () => {
    try {
      const startDate = new Date(selectedYear, 0, 1);
      const endDate = new Date(selectedYear, 11, 31);
      const response = await fetch(
        `${API_URL}/calendar?userId=${user._id}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const createEvent = async () => {
    if (!newEvent.title || !selectedDate) return;

    try {
      const response = await fetch(`${API_URL}/calendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newEvent,
          userId: user._id,
          date: selectedDate,
        }),
      });
      const savedEvent = await response.json();
      setEvents([...events, savedEvent]);
      setShowEventModal(false);
      setNewEvent({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        type: 'event',
        color: '#FF6B35',
      });
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const toggleEventComplete = async (eventId) => {
    try {
      const response = await fetch(`${API_URL}/calendar/${eventId}/complete`, {
        method: 'PATCH',
      });
      const updatedEvent = await response.json();
      setEvents(events.map(e => (e._id === eventId ? updatedEvent : e)));
    } catch (error) {
      console.error('Error toggling event:', error);
    }
  };

  const deleteEvent = async (eventId) => {
    if (!confirm('Delete this event?')) return;
    
    try {
      await fetch(`${API_URL}/calendar/${eventId}`, {
        method: 'DELETE',
      });
      setEvents(events.filter(e => e._id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const updateEvent = async (eventId, updates) => {
    try {
      const response = await fetch(`${API_URL}/calendar/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const updatedEvent = await response.json();
      setEvents(events.map(e => (e._id === eventId ? updatedEvent : e)));
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const renderYearView = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {months.map((month, index) => (
          <motion.div
            key={month}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => {
              setSelectedMonth(index);
              setView('month');
            }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-orange-500/50 cursor-pointer transition-all group"
          >
            <h3 className="text-lg font-bold mb-3 text-center group-hover:text-orange-500 transition-colors">
              {month}
            </h3>
            <div className="grid grid-cols-7 gap-1 text-xs">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={i} className="text-center text-gray-500 font-medium">
                  {day}
                </div>
              ))}
              {renderMiniCalendar(index)}
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  const renderMiniCalendar = (monthIndex) => {
    const firstDay = new Date(selectedYear, monthIndex, 1).getDay();
    const daysInMonth = new Date(selectedYear, monthIndex + 1, 0).getDate();
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedYear, monthIndex, day);
      const dayEvents = getEventsForDate(date);
      const hasEvents = dayEvents.length > 0;

      days.push(
        <div
          key={day}
          className={`aspect-square flex items-center justify-center rounded-md text-xs ${
            hasEvents
              ? 'bg-orange-500/20 text-orange-400 font-bold'
              : 'text-gray-400'
          }`}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  const renderMonthView = () => {
    const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const days = [];

    // Empty cells
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-24" />);
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedYear, selectedMonth, day);
      const dayEvents = getEventsForDate(date);

      days.push(
        <motion.div
          key={day}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-24 bg-gray-800/30 rounded-lg p-2 border border-gray-700/30 hover:border-orange-500/30 transition-all"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-gray-400">{day}</span>
            <button
              onClick={() => {
                setSelectedDate(date);
                setShowEventModal(true);
              }}
              className="text-orange-500 hover:text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            {dayEvents.map((event) => (
              <div
                key={event._id}
                className={`text-xs p-1 rounded transition-all group relative ${
                  event.isCompleted
                    ? 'bg-green-900/30 text-green-400 line-through'
                    : 'bg-orange-900/30 text-orange-300 hover:bg-orange-900/50'
                }`}
                style={{ borderLeft: `3px solid ${event.color}` }}
              >
                <div 
                  onClick={() => toggleEventComplete(event._id)}
                  className="cursor-pointer"
                >
                  {event.title}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteEvent(event._id);
                  }}
                  className="absolute top-0 right-0 p-1 bg-red-500/80 hover:bg-red-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      );
    }

    return days;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedYear(selectedYear - 1)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <h2 className="text-3xl font-bold text-orange-500">
              {view === 'year' ? selectedYear : `${months[selectedMonth]} ${selectedYear}`}
            </h2>

            <button
              onClick={() => setSelectedYear(selectedYear + 1)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setView('year')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                view === 'year'
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Year
            </button>
            <button
              onClick={() => setView('month')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                view === 'month'
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Month
            </button>
          </div>
        </div>
      </motion.div>

      {/* Calendar Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {view === 'year' ? (
          renderYearView()
        ) : (
          <div>
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                <div key={day} className="text-center text-gray-400 font-medium py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2 group">{renderMonthView()}</div>
          </div>
        )}
      </motion.div>

      {/* Event Modal */}
      <AnimatePresence>
        {showEventModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowEventModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-800 rounded-2xl p-6 max-w-lg w-full border border-gray-700"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <CalendarIcon className="w-6 h-6 text-orange-500" />
                  New Event
                </h3>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Event title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />

                <textarea
                  placeholder="Description (optional)"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  rows="3"
                />

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="time"
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    className="bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <input
                    type="time"
                    value={newEvent.endTime}
                    onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                    className="bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="event">Event</option>
                  <option value="challenge">Challenge</option>
                  <option value="deadline">Deadline</option>
                  <option value="reminder">Reminder</option>
                  <option value="goal">Goal</option>
                </select>

                <button
                  onClick={createEvent}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-orange-500/30 transition-all"
                >
                  Create Event
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
