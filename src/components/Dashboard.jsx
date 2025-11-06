import { motion } from 'framer-motion';
import { Flame, Plus, Trophy, Target, Clock, LogOut, User } from 'lucide-react';
import ChallengeCard from './ChallengeCard';
import { getMotivationalMessage } from '../utils/motivationalMessages';

const Dashboard = ({ challenges, onCreateNew, onStartTimer, currentUser, onLogout }) => {
  const activeChallenges = challenges.filter(c => c.isActive && !c.isCompleted);
  const completedChallenges = challenges.filter(c => c.isCompleted);
  const totalStreak = activeChallenges.reduce((sum, c) => sum + c.currentStreak, 0);
  const totalMinutes = challenges.reduce((sum, c) => sum + c.totalMinutes, 0);
  const longestStreak = Math.max(...challenges.map(c => c.longestStreak), 0);

  const motivationMessage = getMotivationalMessage(totalStreak, activeChallenges.length);

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header with User Info */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 relative"
        >
          {/* User Info & Logout */}
          <div className="absolute top-0 right-0 flex items-center gap-3 glass-card px-4 py-2 rounded-full">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-fire-400" />
              <span className="text-white font-medium">{currentUser?.name || currentUser?.username}</span>
            </div>
            <button
              onClick={onLogout}
              className="p-2 hover:bg-red-500/20 rounded-full transition group"
              title="Logout"
            >
              <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <Flame className="w-16 h-16 text-fire-500 fill-fire-500" />
            </motion.div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-fire-400 via-fire-500 to-fire-600 bg-clip-text text-transparent">
              StudyFire
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Discipline through fire. Consistency through fear.
          </p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
        >
          <div className="glass-strong rounded-2xl p-6 border border-fire-500/30">
            <div className="flex items-center gap-3 mb-2">
              <Flame className="w-6 h-6 text-fire-500" />
              <span className="text-gray-400">Current Streak</span>
            </div>
            <p className="text-4xl font-bold text-fire-500">{totalStreak}</p>
            <p className="text-sm text-gray-500 mt-1">days on fire 🔥</p>
          </div>

          <div className="glass-strong rounded-2xl p-6 border border-focus-500/30">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-6 h-6 text-focus-500" />
              <span className="text-gray-400">Total Time</span>
            </div>
            <p className="text-4xl font-bold text-focus-500">
              {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
            </p>
            <p className="text-sm text-gray-500 mt-1">invested in growth</p>
          </div>

          <div className="glass-strong rounded-2xl p-6 border border-yellow-500/30">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <span className="text-gray-400">Best Streak</span>
            </div>
            <p className="text-4xl font-bold text-yellow-500">{longestStreak}</p>
            <p className="text-sm text-gray-500 mt-1">legendary run</p>
          </div>
        </motion.div>

        {/* Motivational Message */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6 mb-8 border border-white/10"
        >
          <p className="text-xl text-center font-medium">
            {motivationMessage}
          </p>
        </motion.div>

        {/* Create New Challenge Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCreateNew}
          className="w-full glass-strong rounded-2xl p-8 mb-8 border-2 border-dashed border-fire-500/50 hover:border-fire-500 transition-all group"
        >
          <div className="flex items-center justify-center gap-4">
            <motion.div
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.3 }}
              className="bg-fire-gradient rounded-full p-4"
            >
              <Plus className="w-8 h-8" />
            </motion.div>
            <div className="text-left">
              <p className="text-2xl font-bold text-fire-500 group-hover:text-fire-400 transition-colors">
                Create New Challenge
              </p>
              <p className="text-gray-400">
                Ignite a new streak. Risk something valuable.
              </p>
            </div>
          </div>
        </motion.button>

        {/* Active Challenges */}
        {activeChallenges.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-6 h-6 text-fire-500" />
              <h2 className="text-2xl font-bold">Active Challenges</h2>
              <span className="glass px-4 py-1 rounded-full text-sm">
                {activeChallenges.length}
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeChallenges.map((challenge, index) => (
                <motion.div
                  key={challenge._id || challenge.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <ChallengeCard
                    challenge={challenge}
                    onStart={() => onStartTimer(challenge)}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center py-20"
          >
            <Flame className="w-24 h-24 text-gray-700 mx-auto mb-4 opacity-50" />
            <p className="text-2xl text-gray-500 mb-2">No active challenges</p>
            <p className="text-gray-600">Create your first challenge to start your journey!</p>
          </motion.div>
        )}

        {/* Completed Challenges */}
        {completedChallenges.length > 0 && (
          <div className="space-y-6 mt-12">
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-bold">Completed Challenges</h2>
              <span className="glass px-4 py-1 rounded-full text-sm text-yellow-500">
                {completedChallenges.length}
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {completedChallenges.map((challenge, index) => (
                <motion.div
                  key={challenge._id || challenge.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <ChallengeCard
                    challenge={challenge}
                    onStart={() => onStartTimer(challenge)}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
