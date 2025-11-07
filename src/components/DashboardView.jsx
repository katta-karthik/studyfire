import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, TrendingUp, Calendar, Clock as ClockIcon, ChevronLeft, ChevronRight, Flame, Play, CheckCircle, Circle, Shield } from 'lucide-react';
import { useTimer } from '../contexts/TimerContext';
import { getWelcomeMessage, getStreakMotivation, getDailyMotivation } from '../services/geminiService';
import api from '../services/api';
import confetti from 'canvas-confetti';

// Use environment variable for API URL
const API_URL = import.meta.env.VITE_API_URL || 'https://studyfire-backend.onrender.com/api';

// Better Animated Fire Component
const AnimatedFire = ({ size = 'w-5 h-5' }) => {
  const uniqueId = Math.random().toString(36).substr(2, 9);
  const glowId = `fireGlow-${uniqueId}`;
  const outerId = `fireOuter-${uniqueId}`;
  const middleId = `fireMiddle-${uniqueId}`;
  const innerId = `fireInner-${uniqueId}`;
  const coreId = `fireCore-${uniqueId}`;

  return (
    <div className={`${size} relative inline-flex items-center justify-center`}>
      <style>{`
        @keyframes flame-main {
          0%, 100% { 
            transform: translateY(0) scaleY(1) scaleX(1);
          }
          25% { 
            transform: translateY(-3px) scaleY(1.08) scaleX(0.95);
          }
          50% { 
            transform: translateY(-1px) scaleY(0.98) scaleX(1.02);
          }
          75% { 
            transform: translateY(-4px) scaleY(1.05) scaleX(0.97);
          }
        }
        @keyframes flame-flicker {
          0%, 100% { opacity: 1; transform: scaleY(1); }
          50% { opacity: 0.85; transform: scaleY(1.1); }
        }
        @keyframes flame-glow {
          0%, 100% { 
            opacity: 0.6; 
            filter: blur(8px);
          }
          50% { 
            opacity: 0.9; 
            filter: blur(12px);
          }
        }
        .flame-body {
          animation: flame-main 1.2s ease-in-out infinite;
          transform-origin: bottom center;
        }
        .flame-tip {
          animation: flame-flicker 0.8s ease-in-out infinite;
          transform-origin: bottom center;
        }
        .flame-glow {
          animation: flame-glow 1.5s ease-in-out infinite;
        }
      `}</style>
      
      <svg
        viewBox="0 0 120 150"
        className="w-full h-full relative z-10"
      >
        {/* Background glow */}
        <ellipse
          cx="60"
          cy="120"
          rx="45"
          ry="50"
          fill={`url(#${glowId})`}
          className="flame-glow"
        />
        
        {/* Outer flame layer - deep orange */}
        <path
          d="M 60 130 
             C 45 115, 40 100, 40 80 
             C 40 60, 50 40, 60 10 
             C 70 40, 80 60, 80 80 
             C 80 100, 75 115, 60 130 Z"
          fill={`url(#${outerId})`}
          className="flame-body"
        />
        
        {/* Middle flame layer - orange */}
        <path
          d="M 60 120 
             C 48 108, 45 95, 45 78 
             C 45 60, 52 45, 60 20 
             C 68 45, 75 60, 75 78 
             C 75 95, 72 108, 60 120 Z"
          fill={`url(#${middleId})`}
          className="flame-body"
          style={{ animationDelay: '0.15s' }}
        />
        
        {/* Inner flame - yellow */}
        <path
          d="M 60 110 
             C 51 100, 50 88, 50 75 
             C 50 60, 55 48, 60 30 
             C 65 48, 70 60, 70 75 
             C 70 88, 69 100, 60 110 Z"
          fill={`url(#${innerId})`}
          className="flame-tip"
        />
        
        {/* Hot core - bright yellow/white */}
        <ellipse
          cx="60"
          cy="75"
          rx="12"
          ry="20"
          fill={`url(#${coreId})`}
          className="flame-tip"
          style={{ animationDelay: '0.3s' }}
        />
        
        <defs>
          {/* Gradients for realistic fire colors */}
          <linearGradient id={glowId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ff2200" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ff6600" stopOpacity="0.1" />
          </linearGradient>
          
          <linearGradient id={outerId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ff3300" />
            <stop offset="50%" stopColor="#ff5500" />
            <stop offset="100%" stopColor="#ff8800" stopOpacity="0.8" />
          </linearGradient>
          
          <linearGradient id={middleId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ff6600" />
            <stop offset="50%" stopColor="#ff9900" />
            <stop offset="100%" stopColor="#ffbb00" stopOpacity="0.9" />
          </linearGradient>
          
          <linearGradient id={innerId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffbb00" />
            <stop offset="50%" stopColor="#ffdd00" />
            <stop offset="100%" stopColor="#ffee00" />
          </linearGradient>
          
          <radialGradient id={coreId}>
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#ffffcc" />
            <stop offset="100%" stopColor="#ffee00" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};

const Dashboard = ({ challenges, onReload }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [quote] = useState(getRandomQuote());
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const { todayProgress, refreshTodayProgress, activeTimer, startTimer, stopTimer, formattedTime } = useTimer();
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Streak Shields
  const [streakShields, setStreakShields] = useState(0);
  
  // AI-generated messages
  const [welcomeMsg, setWelcomeMsg] = useState("Loading...");
  const [streakMsg, setStreakMsg] = useState("...");
  const [dailyQuote, setDailyQuote] = useState("🔥");

  // Force refresh when component mounts
  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  // Fetch user's Streak Shields
  useEffect(() => {
    const fetchUserShields = async () => {
      try {
        const userData = await api.getUserDetails();
        setStreakShields(userData.streakShields || 0);
        console.log(`🛡️ User has ${userData.streakShields} Streak Shields`);
      } catch (error) {
        console.error('Error fetching user shields:', error);
      }
    };
    
    fetchUserShields();
    
    // Refresh shields every 10 seconds
    const interval = setInterval(fetchUserShields, 10000);
    return () => clearInterval(interval);
  }, []);

  // Refresh today's progress on mount and when challenges change
  useEffect(() => {
    console.log('🔄 Dashboard: Challenges updated, count:', challenges.length);
    challenges.forEach(c => {
      console.log(`  - "${c.title}": ${c.completedDays?.length || 0} completed days, totalMinutes: ${c.totalMinutes}`);
    });
    refreshTodayProgress();
  }, [challenges, refreshKey]);

  // Auto-refresh challenges every 5 seconds while on dashboard
  useEffect(() => {
    if (onReload) {
      const interval = setInterval(() => {
        console.log('⏰ Auto-refreshing challenges from backend...');
        onReload(); // Reload challenges from backend
      }, 5000); // Every 5 seconds

      return () => clearInterval(interval);
    }
  }, [onReload]);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 🎉 CELEBRATE STREAK COMPLETION - ONLY ONCE WHEN STREAK INCREASES!
  useEffect(() => {
    const activeChallenges = challenges.filter(c => c.isActive && !c.isCompleted && !c.hasFailed);
    
    if (activeChallenges.length > 0) {
      // Get total current streak
      const currentTotalStreak = activeChallenges.reduce((sum, c) => sum + c.currentStreak, 0);
      
      // Check last celebrated streak from localStorage
      const lastCelebratedStreak = parseInt(localStorage.getItem('lastCelebratedStreak') || '0');
      
      // If streak increased (meaning we earned a new streak day!)
      if (currentTotalStreak > lastCelebratedStreak && currentTotalStreak > 0) {
        console.log(`🎉🎉🎉 STREAK INCREASED! ${lastCelebratedStreak} → ${currentTotalStreak} days!`);
        
        // Fire epic confetti celebration!
        const duration = 3000; // 3 seconds
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min, max) {
          return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function() {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);
          
          // Fire from two sides
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            colors: ['#f97316', '#ea580c', '#fb923c', '#fbbf24', '#f59e0b']
          });
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            colors: ['#f97316', '#ea580c', '#fb923c', '#fbbf24', '#f59e0b']
          });
        }, 250);

        // Save this streak level as celebrated
        localStorage.setItem('lastCelebratedStreak', currentTotalStreak.toString());
      }
    }
  }, [challenges]);

  // Load AI-generated messages
  useEffect(() => {
    const loadAIMessages = async () => {
      try {
        // Get streak stats
        const activeChallenges = challenges.filter(c => c.isActive && !c.isCompleted);
        const totalStreak = activeChallenges.reduce((sum, c) => sum + c.currentStreak, 0);
        const longestStreak = Math.max(...challenges.map(c => c.longestStreak), 0);
        
        console.log('🤖 Loading AI messages with:', { totalStreak, longestStreak });
        
        // Load messages
        const [welcome, streak, quote] = await Promise.all([
          getWelcomeMessage('Champion', totalStreak),
          getStreakMotivation(totalStreak, longestStreak),
          getDailyMotivation()
        ]);
        
        console.log('🤖 AI Responses:', { welcome, streak, quote });
        
        setWelcomeMsg(welcome);
        setStreakMsg(streak);
        setDailyQuote(quote);
      } catch (error) {
        console.error('Failed to load AI messages:', error);
        // Keep default fallback messages
      }
    };
    
    if (challenges.length > 0) {
      loadAIMessages();
    }
  }, [challenges.length]); // Only reload when challenge count changes

  // Calculate stats
  const today = new Date().toISOString().split('T')[0];
  
  // Active challenges: either truly active OR completed today (so streak shows on completion day)
  const activeChallenges = challenges.filter(c => {
    if (!c.isActive && !c.isCompleted) return false; // Failed challenges
    if (c.isActive && !c.isCompleted) return true; // Truly active
    
    // If completed, include it if completed TODAY
    if (c.isCompleted && c.completedAt) {
      const completedDate = new Date(c.completedAt).toISOString().split('T')[0];
      return completedDate === today;
    }
    
    return false;
  });
  
  const completedChallenges = challenges.filter(c => c.isCompleted);
  const failedChallenges = challenges.filter(c => c.hasFailed); // NEW: Failed challenges
  const totalStreak = activeChallenges.reduce((sum, c) => sum + c.currentStreak, 0);
  const longestStreak = Math.max(...challenges.map(c => c.longestStreak), 0);
  const totalMinutes = challenges.reduce((sum, c) => sum + c.totalMinutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);

  // Calculate TOTAL DAYS WORKED (not streak - actual count of unique days)
  const getAllCompletedDates = () => {
    const dates = new Set();
    challenges.forEach(challenge => {
      challenge.completedDays?.forEach(day => {
        if (day.minutes > 0) {
          dates.add(day.date);
        }
      });
    });
    return dates;
  };

  const totalDaysWorked = getAllCompletedDates().size;

  // Get today's stats
  const getTodayStats = () => {
    const today = new Date().toISOString().split('T')[0];
    let todayMinutes = 0;
    
    console.log('📅 Calculating today stats for date:', today);
    
    challenges.forEach(challenge => {
      const todayEntry = challenge.completedDays?.find(day => day.date === today);
      if (todayEntry) {
        console.log(`  - "${challenge.title}": ${todayEntry.minutes} min (from completedDays)`);
        todayMinutes += todayEntry.minutes;
      } else {
        console.log(`  - "${challenge.title}": NO entry for today in completedDays`);
      }
    });
    
    console.log(`📅 Total today: ${todayMinutes} minutes`);
    
    return {
      minutes: todayMinutes,
      hours: Math.floor(todayMinutes / 60),
      remainingMinutes: todayMinutes % 60
    };
  };

  const todayStats = getTodayStats();

  // Get per-task stats
  const getTaskStats = () => {
    return challenges.map(challenge => {
      // Only count days where goal was reached
      const uniqueDays = new Set(
        challenge.completedDays?.filter(day => day.isGoalReached === true).map(day => day.date) || []
      ).size;
      
      return {
        id: challenge._id || challenge.id,
        title: challenge.title,
        daysWorked: uniqueDays,
        totalMinutes: challenge.totalMinutes || 0,
        totalHours: Math.floor((challenge.totalMinutes || 0) / 60),
        isActive: challenge.isActive && !challenge.isCompleted,
        isCompleted: challenge.isCompleted
      };
    });
  };

  const taskStats = getTaskStats();

  // Get last 7 days
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

  // Get days for current calendar month
  const getMonthDays = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty slots for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const monthDays = getMonthDays();

  // Navigate calendar
  const previousMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1));
  };

  const goToCurrentMonth = () => {
    setCalendarMonth(new Date());
  };

  // Check if a date has ALL challenges completed (for fire emoji and streak)
  // Fire emoji: Show on days where ANY challenge reached their daily goal
  const isDateCompleted = (date) => {
    // Convert date to local date string (YYYY-MM-DD) to match server's local date
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    // Check if ANY challenge has this date in completedDays with goal reached
    return challenges.some(challenge =>
      challenge.completedDays?.some(d => d.date === dateStr && d.isGoalReached === true)
    );
  };

  // NEW: Check if date was a Safe Day (survived with lifeline)
  const isSafeDay = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    // Check if ANY challenge used a Safe Day on this date
    return challenges.some(challenge =>
      challenge.safeDaysUsed?.some(d => d.date === dateStr)
    );
  };

  // Format time
  const hours = currentTime.getHours().toString().padStart(2, '0');
  const minutes = currentTime.getMinutes().toString().padStart(2, '0');
  const seconds = currentTime.getSeconds().toString().padStart(2, '0');
  const date = currentTime.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="space-y-6">
      {/* Hero Section with Clock */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        {/* Compact Clock */}
        <div className="glass-card p-6 rounded-2xl border border-orange-500/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <ClockIcon className="w-5 h-5 text-fire-400" />
              <h2 className="text-sm font-medium text-gray-400">{date}</h2>
            </div>
            
            <div className="flex items-center justify-center gap-2 font-mono text-5xl font-black">
              <span className="bg-gradient-to-br from-fire-400 to-fire-600 bg-clip-text text-transparent">
                {hours}
              </span>
              <span className="text-fire-500 animate-pulse">:</span>
              <span className="bg-gradient-to-br from-fire-400 to-fire-600 bg-clip-text text-transparent">
                {minutes}
              </span>
              <span className="text-fire-500 animate-pulse">:</span>
              <span className="bg-gradient-to-br from-fire-400 to-fire-600 bg-clip-text text-transparent">
                {seconds}
              </span>
            </div>
          </div>
        </div>

        {/* AI-Generated Daily Motivation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4 rounded-xl border border-fire-500/20 bg-gradient-to-r from-fire-500/5 to-orange-500/5"
        >
          <p className="text-sm text-gray-200 italic">{dailyQuote}</p>
          <p className="text-xs text-fire-400 mt-1">— StudyFire AI 🔥</p>
        </motion.div>
      </motion.div>

      {/* Today's Progress Widget */}
      {activeChallenges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card p-6 rounded-2xl border border-white/10"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-fire-400" />
              <h2 className="text-lg font-bold text-white">Today's Challenges</h2>
            </div>
            {activeTimer && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-fire-500/20 rounded-lg border border-fire-500/30">
                <div className="w-2 h-2 bg-fire-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-mono font-bold text-fire-400">{formattedTime}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {activeChallenges.map((challenge) => {
              const challengeId = challenge._id || challenge.id;
              const progress = todayProgress[challengeId] || {
                minutesLogged: 0,
                isCompleted: false,
                targetMinutes: challenge.dailyTargetMinutes
              };
              
              console.log(`📊 Challenge "${challenge.title}": ${progress.minutesLogged}/${progress.targetMinutes} min, completed: ${progress.isCompleted}`);
              
              // Calculate progress percentage
              const progressPercentage = Math.min((progress.minutesLogged / progress.targetMinutes) * 100, 100);
              const isThisChallengeActive = activeTimer?.challengeId === challengeId;
              
              const handleQuickTimer = async () => {
                if (isThisChallengeActive) {
                  // Stop timer
                  const sessionData = await stopTimer();
                  if (sessionData) {
                    try {
                      await fetch(`${API_URL}/challenges/${challengeId}/stop-session`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(sessionData)
                      });
                      await refreshTodayProgress();
                    } catch (error) {
                      console.error('Error saving session:', error);
                    }
                  }
                } else if (!activeTimer) {
                  // Start timer
                  startTimer(challenge);
                }
              };

              return (
                <div
                  key={challengeId}
                  className={`
                    p-4 rounded-xl border-2 transition-all
                    ${progress.isCompleted
                      ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/5 border-green-500/30'
                      : isThisChallengeActive
                      ? 'bg-gradient-to-r from-fire-500/10 to-orange-500/5 border-fire-500/30'
                      : 'bg-gray-800/30 border-gray-700/30'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {progress.isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : isThisChallengeActive ? (
                        <div className="w-5 h-5 flex items-center justify-center">
                          <div className="w-3 h-3 bg-fire-500 rounded-full animate-pulse"></div>
                        </div>
                      ) : (
                        <Circle className="w-5 h-5 text-gray-500" />
                      )}
                      <h3 className="font-bold text-white">{challenge.title}</h3>
                    </div>
                    
                    <button
                      onClick={handleQuickTimer}
                      disabled={progress.isCompleted || (activeTimer && !isThisChallengeActive)}
                      className={`
                        px-3 py-1 rounded-lg text-xs font-bold transition-all
                        ${progress.isCompleted
                          ? 'bg-green-500/20 text-green-400 cursor-default'
                          : isThisChallengeActive
                          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          : (activeTimer && !isThisChallengeActive)
                          ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                          : 'bg-fire-500/20 text-fire-400 hover:bg-fire-500/30'
                        }
                      `}
                    >
                      {progress.isCompleted ? '✓ Done' : isThisChallengeActive ? 'Stop' : 'Start'}
                    </button>
                  </div>

                  <div className="space-y-2">
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 0.5 }}
                        className={`
                          h-full rounded-full
                          ${progress.isCompleted
                            ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                            : 'bg-gradient-to-r from-fire-500 to-orange-400'
                          }
                        `}
                      />
                    </div>

                    {/* Time Display */}
                    <div className="flex items-center justify-between text-sm">
                      <span className={progress.isCompleted ? 'text-green-400' : 'text-gray-400'}>
                        {progress.minutesLogged} / {progress.targetMinutes} min
                      </span>
                      {!progress.isCompleted && (
                        <span className="text-gray-500">
                          {progress.targetMinutes - progress.minutesLogged} min left
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Overall Today's Status */}
          <div className="mt-4 pt-4 border-t border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Today's Strike:</span>
                {Object.values(todayProgress).every(p => p.isCompleted) && activeChallenges.length > 0 ? (
                  <div className="flex items-center gap-1">
                    <Flame className="w-5 h-5 text-fire-500 fill-fire-500" />
                    <span className="text-fire-500 font-bold">Earned! 🔥</span>
                  </div>
                ) : (
                  <span className="text-gray-500">
                    {Object.values(todayProgress).filter(p => p.isCompleted).length} / {activeChallenges.length} complete
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Compact Streak & Calendar Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6 rounded-2xl border border-white/10"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-fire-400" />
            <h2 className="text-lg font-bold text-white">Activity Calendar</h2>
          </div>
          <button
            onClick={() => setShowFullCalendar(!showFullCalendar)}
            className="px-3 py-1.5 text-xs bg-fire-500/20 text-fire-400 rounded-lg font-medium hover:bg-fire-500/30 transition"
          >
            {showFullCalendar ? 'Week' : 'Month'}
          </button>
        </div>

        {/* Compact Streak Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 bg-gradient-to-br from-fire-500/10 to-orange-500/10 rounded-xl border border-fire-500/20">
            <p className="text-xs text-gray-400 mb-1">Current Streak</p>
            <p className="text-2xl font-black text-fire-400">{totalStreak}</p>
            <p className="text-xs text-gray-500">days</p>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-xl border border-purple-500/20 group hover:border-purple-400/40 transition cursor-help" title="Earn 1 shield every 15 days. Shields save your streak when a challenge fails!">
            <p className="text-xs text-gray-400 mb-1">Streak Shields</p>
            <div className="flex items-center justify-center gap-2">
              <Shield className="w-5 h-5 text-purple-400 group-hover:scale-110 transition" />
              <p className="text-2xl font-black text-purple-400">{streakShields}</p>
            </div>
            <p className="text-xs text-gray-500">protection</p>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20">
            <p className="text-xs text-gray-400 mb-1">Total Days</p>
            <p className="text-2xl font-black text-blue-400">{totalDaysWorked}</p>
            <p className="text-xs text-gray-500">worked</p>
          </div>
        </div>

        {/* AI Streak Motivation */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 mb-6 bg-gradient-to-r from-fire-500/10 to-orange-500/10 rounded-xl border border-fire-500/20"
        >
          <p className="text-sm text-center text-gray-200 italic">{streakMsg}</p>
        </motion.div>

        {showFullCalendar ? (
          /* Full Month Calendar */
          <div>
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={previousMonth}
                className="p-2 hover:bg-gray-700 rounded-lg transition"
              >
                <ChevronLeft className="w-5 h-5 text-gray-400" />
              </button>
              <div className="text-center">
                <h3 className="text-xl font-bold text-white">
                  {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                {calendarMonth.getMonth() !== new Date().getMonth() && (
                  <button
                    onClick={goToCurrentMonth}
                    className="text-xs text-fire-400 hover:underline mt-1"
                  >
                    Go to current month
                  </button>
                )}
              </div>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-700 rounded-lg transition"
              >
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="space-y-1">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-2 pb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                  <div key={i} className="text-center text-xs text-gray-400 font-semibold py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-2">
                {monthDays.map((date, index) => {
                  if (!date) {
                    return <div key={index} className="aspect-square" />;
                  }

                  const isCompleted = isDateCompleted(date);
                  const isSafe = isSafeDay(date);
                  const isToday = date.toDateString() === new Date().toDateString();
                  const isFuture = date > new Date();

                  return (
                    <div
                      key={index}
                      className={`
                        aspect-square rounded-lg flex items-center justify-center font-bold
                        transition-all duration-200 cursor-pointer
                        ${isFuture ? 'opacity-30 cursor-default' : ''}
                        ${isCompleted
                          ? 'bg-fire-500 text-white shadow-lg shadow-fire-500/30 hover:shadow-fire-500/50 hover:scale-105'
                          : isSafe
                          ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-600/30 hover:shadow-yellow-600/50 hover:scale-105'
                          : 'bg-gray-800/80 text-gray-500 hover:bg-gray-700/80'
                        }
                        ${isToday ? 'ring-2 ring-fire-400' : ''}
                      `}
                    >
                      {isCompleted ? (
                        <div className="w-6 h-6">
                          <AnimatedFire size="w-6 h-6" />
                        </div>
                      ) : isSafe ? (
                        <span className="text-2xl">⚡</span>
                      ) : (
                        <span className="text-sm">{date.getDate()}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Updated Legend */}
            <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-700/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-fire-500 flex items-center justify-center shadow-lg shadow-fire-500/30">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm text-gray-400">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-600/30">
                  <span className="text-xl">⚡</span>
                </div>
                <span className="text-sm text-gray-400">Safe Day</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
                  <span className="text-gray-600 font-bold">—</span>
                </div>
                <span className="text-sm text-gray-400">Missed</span>
              </div>
            </div>
          </div>
        ) : (
          /* This Week View */
          <div>
            <div className="grid grid-cols-7 gap-2">
              {getLast7Days().map((date, index) => {
                const isCompleted = isDateCompleted(date);
                const isToday = date.toDateString() === new Date().toDateString();
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

                return (
                  <div key={index} className="flex flex-col items-center gap-2">
                    <span className="text-xs text-gray-400 font-semibold py-1">{dayName}</span>
                    <div
                      className={`
                        aspect-square w-14 rounded-lg flex items-center justify-center
                        transition-all duration-200 cursor-pointer
                        ${isToday ? 'ring-2 ring-fire-400' : ''}
                        ${isCompleted
                          ? 'bg-fire-500 shadow-lg shadow-fire-500/30 hover:shadow-fire-500/50 hover:scale-105'
                          : 'bg-gray-800/80 hover:bg-gray-700/80'
                        }
                      `}
                    >
                      {isCompleted ? (
                        <span className="text-2xl">🔥</span>
                      ) : (
                        <span className="text-sm text-gray-500 font-semibold">{date.getDate()}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>

      {/* Stats Grid - Clockify Style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="glass-card p-4 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <ClockIcon className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-xs text-gray-400 font-medium">Today</h3>
          </div>
          <p className="text-2xl font-black text-white">
            {todayStats.hours}h {todayStats.remainingMinutes}m
          </p>
          <p className="text-xs text-gray-500 mt-1">{todayStats.minutes} min</p>
        </div>

        <div className="glass-card p-4 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <ClockIcon className="w-4 h-4 text-purple-400" />
            </div>
            <h3 className="text-xs text-gray-400 font-medium">Total</h3>
          </div>
          <p className="text-2xl font-black text-white">{totalHours}h {totalMinutes % 60}m</p>
          <p className="text-xs text-gray-500 mt-1">{totalMinutes} min</p>
        </div>

        <div className="glass-card p-4 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-fire-500/20 rounded-lg">
              <Flame className="w-4 h-4 text-fire-400" />
            </div>
            <h3 className="text-xs text-gray-400 font-medium">Days</h3>
          </div>
          <p className="text-2xl font-black text-white">{totalDaysWorked}</p>
          <p className="text-xs text-gray-500 mt-1">worked</p>
        </div>

        <div className="glass-card p-4 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Target className="w-4 h-4 text-green-400" />
            </div>
            <h3 className="text-xs text-gray-400 font-medium">Active</h3>
          </div>
          <p className="text-2xl font-black text-white">{activeChallenges.length}</p>
          <p className="text-xs text-gray-500 mt-1">tasks</p>
        </div>
      </motion.div>

      {/* Per-Task Breakdown - Compact */}
      {taskStats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-5 rounded-2xl border border-white/10"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-fire-500/20 rounded-lg">
              <Target className="w-5 h-5 text-fire-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Task Breakdown</h2>
          </div>

          <div className="space-y-3">
            {taskStats.map((task) => (
              <div
                key={task.id}
                className={`
                  p-4 rounded-xl border-2 transition-all hover:scale-[1.02] cursor-default
                  ${task.isCompleted
                    ? 'bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/30 shadow-lg shadow-yellow-500/10'
                    : task.isActive
                    ? 'bg-gradient-to-br from-fire-500/10 to-orange-500/5 border-fire-500/30 shadow-lg shadow-fire-500/10'
                    : 'bg-gradient-to-br from-gray-800/50 to-gray-900/30 border-gray-700/30'
                  }
                `}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`
                      p-2 rounded-lg
                      ${task.isCompleted
                        ? 'bg-yellow-500/20'
                        : task.isActive
                        ? 'bg-fire-500/20'
                        : 'bg-gray-700/50'
                      }
                    `}>
                      {task.isCompleted ? (
                        <Trophy className="w-5 h-5 text-yellow-400" />
                      ) : task.isActive ? (
                        <Flame className="w-5 h-5 text-fire-400" />
                      ) : (
                        <Target className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <h3 className="font-bold text-white text-base">{task.title}</h3>
                  </div>
                  {task.isCompleted && (
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-bold border border-yellow-500/30">
                      COMPLETED
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className={`
                    p-3 rounded-lg border
                    ${task.isCompleted
                      ? 'bg-yellow-500/5 border-yellow-500/20'
                      : task.isActive
                      ? 'bg-fire-500/5 border-fire-500/20'
                      : 'bg-black/30 border-gray-700/30'
                    }
                  `}>
                    <p className="text-xs text-gray-400 mb-1 font-medium">Days Worked</p>
                    <p className={`
                      text-2xl font-black
                      ${task.isCompleted
                        ? 'text-yellow-400'
                        : task.isActive
                        ? 'text-fire-400'
                        : 'text-gray-300'
                      }
                    `}>
                      {task.daysWorked}
                    </p>
                  </div>
                  <div className={`
                    p-3 rounded-lg border
                    ${task.isCompleted
                      ? 'bg-yellow-500/5 border-yellow-500/20'
                      : task.isActive
                      ? 'bg-fire-500/5 border-fire-500/20'
                      : 'bg-black/30 border-gray-700/30'
                    }
                  `}>
                    <p className="text-xs text-gray-400 mb-1 font-medium">Total Time</p>
                    <p className={`
                      text-2xl font-black
                      ${task.isCompleted
                        ? 'text-yellow-400'
                        : task.isActive
                        ? 'text-fire-400'
                        : 'text-gray-300'
                      }
                    `}>
                      {task.totalHours}h {task.totalMinutes % 60}m
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* NEW: Failed Challenges Section */}
      {failedChallenges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-5 rounded-2xl border-2 border-red-500/30 bg-red-900/10"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <span className="text-2xl">💀</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-red-300">Failed Challenges</h2>
              <p className="text-xs text-red-400/70">These challenges ran out of safe days and failed</p>
            </div>
          </div>

          <div className="space-y-3">
            {failedChallenges.map((challenge) => (
              <div
                key={challenge._id || challenge.id}
                className="p-4 rounded-xl bg-red-900/20 border-2 border-red-500/20"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💀</span>
                    <div>
                      <h3 className="font-bold text-red-200">{challenge.title}</h3>
                      <p className="text-xs text-red-400/70">
                        Bet: {challenge.betItem?.name || 'No bet'} 🔒 LOCKED FOREVER
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="glass-strong p-2 rounded-lg">
                    <p className="text-xs text-gray-400">Longest Streak</p>
                    <p className="text-lg font-bold text-red-300">{challenge.longestStreak} days</p>
                  </div>
                  <div className="glass-strong p-2 rounded-lg">
                    <p className="text-xs text-gray-400">Total Time</p>
                    <p className="text-lg font-bold text-red-300">
                      {Math.floor(challenge.totalMinutes / 60)}h {challenge.totalMinutes % 60}m
                    </p>
                  </div>
                </div>

                {challenge.failedDates && challenge.failedDates.length > 0 && (
                  <div className="mt-3 p-2 bg-red-900/30 border border-red-500/20 rounded-lg">
                    <p className="text-xs text-red-300">
                      <span className="font-bold">Failed on:</span> {challenge.failedDates[challenge.failedDates.length - 1].date}
                    </p>
                    <p className="text-xs text-red-400/70 mt-1">
                      {challenge.failedDates[challenge.failedDates.length - 1].reason}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-red-900/20 border border-red-500/20 rounded-lg">
            <p className="text-xs text-red-300 text-center">
              ⚠️ When a challenge fails, ALL active challenges' streaks reset to 0
            </p>
          </div>
        </motion.div>
      )}

      {/* Progress Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-6 rounded-2xl border border-white/10 text-center"
      >
        <TrendingUp className="w-12 h-12 text-fire-400 mx-auto mb-3" />
        <h3 className="text-2xl font-bold text-white mb-2">
          {totalStreak > 0 ? "Keep it going!" : "Start your journey!"}
        </h3>
        <p className="text-gray-400">
          {totalStreak > 0
            ? `You're ${totalStreak} days into your consistency journey. Don't break the chain! 🔥`
            : "Create your first challenge and build an unstoppable streak! 🚀"}
        </p>
      </motion.div>
    </div>
  );
};

// Motivational Quotes
function getRandomQuote() {
  const quotes = [
    { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
    { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
    { text: "Consistency is the key to success.", author: "Unknown" },
    { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}

export default Dashboard;
