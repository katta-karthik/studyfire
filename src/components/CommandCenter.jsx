import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox, Calendar, FileText, Clock } from 'lucide-react';
import InboxView from './InboxView';
import PlannerView from './PlannerView';
import CalendarView from './CalendarView';
import PagesView from './PagesView';

export default function CommandCenter({ user }) {
  const [activeTab, setActiveTab] = useState('inbox');

  const tabs = [
    { id: 'inbox', label: 'Inbox', icon: Inbox },
    { id: 'planner', label: 'Planner', icon: Clock },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'pages', label: 'Pages', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-transparent">
            🎯 Command Center
          </h1>
          <p className="text-gray-400">Your productivity headquarters</p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-6 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-2 border border-gray-700/50"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </motion.div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'inbox' && <InboxView user={user} />}
            {activeTab === 'planner' && <PlannerView user={user} />}
            {activeTab === 'calendar' && <CalendarView user={user} />}
            {activeTab === 'pages' && <PagesView user={user} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
