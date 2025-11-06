import { motion } from 'framer-motion';
import { Flame, Plus, Trophy, Target, Clock, LogOut, User, Calendar, Award, TrendingUp, Zap } from 'lucide-react';
import { getMotivationalMessage } from '../utils/motivationalMessages';

const Dashboard = ({ challenges, onCreateNew, onStartTimer, currentUser, onLogout }) => {
  const activeChallenges = challenges.filter(c => c.isActive && !c.isCompleted);
  const completedChallenges = challenges.filter(c => c.isCompleted);
  const totalStreak = activeChallenges.reduce((sum, c) => sum + c.currentStreak, 0);
  const totalMinutes = challenges.reduce((sum, c) => sum + c.totalMinutes, 0);
  const longestStreak = Math.max(...challenges.map(c => c.longestStreak), 0);
  const totalHours = Math.floor(totalMinutes / 60);

  const motivationMessage = getMotivationalMessage(totalStreak, activeChallenges.length);

  // Get last 7 days for calendar
  const getLast7Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(date);
    }
    return days;
  };

  const last7Days = getLast7Days();

  // Check if a date has completed activity
  const isDateCompleted = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return challenges.some(challenge => 
      challenge.completedDays.some(day => day.date === dateStr && day.minutes > 0)
    );
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Bar - User Info & Logout */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between mb-2"
        >
          <div className="flex items-center gap-3">
            <Flame className="w-10 h-10 text-fire-500" />
            <div>
              <h1 className="text-3xl font-black text-white">StudyFire</h1>
              <p className="text-sm text-gray-400">Welcome back, {currentUser?.name || currentUser?.username}!</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-red-500/20 rounded-lg transition group"
          >
            <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
            <span className="text-sm text-gray-400 group-hover:text-red-400">Logout</span>
          </button>
        </motion.div>

        {/* Stats Grid - Compact */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="glass-card p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalStreak}</p>
                <p className="text-xs text-gray-400">Day Streak</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalHours}h</p>
                <p className="text-xs text-gray-400">Total Hours</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Award className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{longestStreak}</p>
                <p className="text-xs text-gray-400">Best Streak</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Target className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{activeChallenges.length}</p>
                <p className="text-xs text-gray-400">Active</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content - 2 Column Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Left Column - Calendar & Motivation */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Weekly Calendar */}
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-fire-400" />
                This Week
              </h3>

              <div className="space-y-3">
                {last7Days.map((date, index) => {
                  const isCompleted = isDateCompleted(date);
                  const isToday = date.toDateString() === new Date().toDateString();
                  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                  const dayNum = date.getDate();
                  const monthName = date.toLocaleDateString('en-US', { month: 'short' });

                  return (
                    <motion.div
                      key={index}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                      className={`
                        flex items-center justify-between p-3 rounded-xl transition-all
                        ${isToday ? 'bg-fire-500/20 border border-fire-500/50' : 'bg-gray-800/30'}
                        hover:bg-gray-800/50
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-12 h-12 rounded-lg flex items-center justify-center font-bold
                          ${isCompleted 
                            ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white' 
                            : 'bg-gray-800 text-gray-500'
                          }
                        `}>
                          {isCompleted ? (
                            <Flame className="w-6 h-6" />
                          ) : (
                            <span>{dayNum}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">{dayName}</p>
                          <p className="text-xs text-gray-400">{monthName} {dayNum}</p>
                        </div>
                      </div>
                      
                      {isToday && (
                        <span className="px-2 py-1 bg-fire-500 text-white text-xs rounded-full font-bold">
                          Today
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Motivation Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="glass-card p-6 rounded-2xl bg-gradient-to-br from-fire-500/10 to-orange-500/10 border border-fire-500/20"
            >
              <Zap className="w-8 h-8 text-fire-400 mb-3" />
              <p className="text-white font-medium mb-2">Keep Going!</p>
              <p className="text-sm text-gray-300">{motivationMessage}</p>
            </motion.div>
          </motion.div>

          {/* Right Column - Challenges */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Create New Challenge Button */}
            <button
              onClick={onCreateNew}
              className="w-full glass-card p-6 rounded-2xl border-2 border-dashed border-fire-500/30 hover:border-fire-500 hover:bg-fire-500/5 transition-all group"
            >
              <div className="flex items-center justify-center gap-3">
                <Plus className="w-6 h-6 text-fire-400 group-hover:rotate-90 transition-transform" />
                <span className="text-lg font-bold text-white">Create New Challenge</span>
              </div>
            </button>

            {/* Active Challenges */}
            {activeChallenges.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-fire-400" />
                  Active Challenges
                  <span className="px-2 py-1 bg-fire-500/20 text-fire-400 rounded-full text-xs">
                    {activeChallenges.length}
                  </span>
                </h3>

                <div className="space-y-4">
                  {activeChallenges.map((challenge) => (
                    <motion.div
                      key={challenge._id || challenge.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => onStartTimer(challenge)}
                      className="glass-card p-5 rounded-xl cursor-pointer hover:shadow-lg hover:shadow-fire-500/10 transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-bold text-white">{challenge.title}</h4>
                        <button className="px-4 py-2 bg-fire-500 hover:bg-fire-600 text-white rounded-lg text-sm font-bold transition">
                          Start
                        </button>
                      </div>
                      
                      <p className="text-sm text-gray-400 mb-4">{challenge.description}</p>
                      
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <Flame className="w-4 h-4 text-fire-400" />
                          <span className="text-white font-medium">{challenge.currentStreak} days</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-blue-400" />
                          <span className="text-gray-400">{challenge.currentStreak}/{challenge.duration} days</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-purple-400" />
                          <span className="text-gray-400">{challenge.dailyTargetMinutes} min/day</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Challenges */}
            {completedChallenges.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Completed
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                    {completedChallenges.length}
                  </span>
                </h3>

                <div className="grid gap-4">
                  {completedChallenges.map((challenge) => (
                    <div
                      key={challenge._id || challenge.id}
                      className="glass-card p-4 rounded-xl bg-gradient-to-r from-yellow-500/5 to-orange-500/5 border border-yellow-500/20"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-bold">{challenge.title}</h4>
                          <p className="text-sm text-gray-400">Completed in {challenge.duration} days! 🎉</p>
                        </div>
                        <Trophy className="w-8 h-8 text-yellow-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {activeChallenges.length === 0 && completedChallenges.length === 0 && (
              <div className="glass-card p-12 rounded-2xl text-center">
                <Flame className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Challenges Yet</h3>
                <p className="text-gray-400 mb-6">Create your first challenge to start building your streak!</p>
                <button
                  onClick={onCreateNew}
                  className="px-6 py-3 bg-fire-500 hover:bg-fire-600 text-white rounded-lg font-bold transition"
                >
                  Create Challenge
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
