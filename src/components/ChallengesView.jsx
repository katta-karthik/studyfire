import { motion } from 'framer-motion';
import { Plus, Play, Trophy } from 'lucide-react';
import ChallengeCard from './ChallengeCard';
import { useState, useEffect } from 'react';
import { getChallengesPageMotivation } from '../services/geminiService';

const ChallengesView = ({ challenges, onCreateNew, onDelete }) => {
  const activeChallenges = challenges.filter(c => c.isActive && !c.isCompleted);
  const completedChallenges = challenges.filter(c => c.isCompleted);
  const [aiMessage, setAiMessage] = useState("Keep the fire burning! 🔥");

  // Load AI motivation for challenges page
  useEffect(() => {
    const loadMessage = async () => {
      try {
        const msg = await getChallengesPageMotivation(activeChallenges.length, completedChallenges.length);
        setAiMessage(msg);
      } catch (error) {
        // Silent fail - use default message
      }
    };
    
    loadMessage();
  }, [challenges.length]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">Your Challenges</h1>
          <p className="text-gray-400">Manage and track your active challenges</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCreateNew}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-fire-600 to-fire-500 text-white rounded-xl font-bold shadow-lg shadow-fire-500/30 hover:shadow-fire-500/50 transition"
        >
          <Plus className="w-5 h-5" />
          New Challenge
        </motion.button>
      </div>

      {/* AI Motivation Box */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-gradient-to-r from-purple-900/30 to-fire-900/30 border border-purple-500/20 rounded-2xl backdrop-blur-sm"
      >
        <p className="text-gray-300 text-center italic leading-relaxed">
          {aiMessage}
        </p>
      </motion.div>

      {/* Active Challenges */}
      {activeChallenges.length > 0 ? (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Play className="w-6 h-6 text-fire-400" />
            <h2 className="text-2xl font-bold text-white">Active</h2>
            <span className="px-3 py-1 bg-fire-500/20 text-fire-400 rounded-full text-sm font-bold">
              {activeChallenges.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeChallenges.map((challenge) => (
              <motion.div
                key={challenge._id || challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <ChallengeCard
                  challenge={challenge}
                  onDelete={onDelete}
                />
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-12 rounded-2xl border-2 border-dashed border-gray-700 text-center"
        >
          <Play className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">No Active Challenges</h3>
          <p className="text-gray-400 mb-6">Start your journey by creating your first challenge!</p>
          <button
            onClick={onCreateNew}
            className="px-6 py-3 bg-gradient-to-r from-fire-600 to-fire-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-fire-500/50 transition"
          >
            Create Your First Challenge
          </button>
        </motion.div>
      )}

      {/* Completed Challenges */}
      {completedChallenges.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">Completed</h2>
            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-bold">
              {completedChallenges.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {completedChallenges.map((challenge) => (
              <motion.div
                key={challenge._id || challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChallengeCard
                  challenge={challenge}
                  onDelete={onDelete}
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengesView;
