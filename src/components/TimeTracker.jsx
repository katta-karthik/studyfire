import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, Trash2, Clock, Flame, ChevronDown, ChevronUp, Gift } from 'lucide-react';
import { getSafeDayUsedMessage } from '../services/geminiService';
import confetti from 'canvas-confetti';

// Use environment variable for API URL
const API_URL = import.meta.env.VITE_API_URL || 'https://studyfire-backend.onrender.com/api';

const TimeTracker = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [description, setDescription] = useState('');
  const [selectedChallenge, setSelectedChallenge] = useState('');
  const [timeEntries, setTimeEntries] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [activeEntry, setActiveEntry] = useState(null);
  const [showChallengeDropdown, setShowChallengeDropdown] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({}); // Track which groups are expanded
  const [safeDayNotification, setSafeDayNotification] = useState(null); // Safe Day notification
  const [challengeFailureNotification, setChallengeFailureNotification] = useState(null); // Challenge failure notification
  const [betUnlockNotification, setBetUnlockNotification] = useState(null); // 🎮 Bet unlock notification
  
  const intervalRef = useRef(null);
  const userId = localStorage.getItem('userId');

  // Format seconds to HH:MM:SS
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format date to HH:MM (24-hour format)
  const formatTimeOnly = (date) => {
    const d = new Date(date);
    const hrs = d.getHours().toString().padStart(2, '0');
    const mins = d.getMinutes().toString().padStart(2, '0');
    return `${hrs}:${mins}`;
  };

  // Format date to readable format
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  // Update tab title
  useEffect(() => {
    if (isRunning) {
      document.title = `▶ ${formatTime(elapsedSeconds)} - ${description || 'Working on challenge'}`;
    } else {
      document.title = 'StudyFire 🔥';
    }
  }, [isRunning, elapsedSeconds, description]);

  // Fetch challenges
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const response = await fetch(`${API_URL}/challenges?userId=${userId}`);
        const data = await response.json();
        setChallenges(data);
      } catch (error) {
        console.error('Error fetching challenges:', error);
      }
    };

    if (userId) {
      fetchChallenges();
    }
  }, [userId]);

  // Fetch time entries
  const fetchTimeEntries = async () => {
    try {
      const response = await fetch(`${API_URL}/time-entries?userId=${userId}`);
      const data = await response.json();
      setTimeEntries(data);
    } catch (error) {
      console.error('Error fetching time entries:', error);
    }
  };

  // Check for active timer on mount
  useEffect(() => {
    const checkActiveTimer = async () => {
      try {
        const response = await fetch(`${API_URL}/time-entries/active?userId=${userId}`);
        const data = await response.json();
        
        if (data && data.isRunning) {
          setActiveEntry(data);
          setDescription(data.description || '');
          setSelectedChallenge(data.challengeId?._id || '');
          setIsRunning(true);
          
          // Calculate elapsed time
          const startTime = new Date(data.startTime);
          const now = new Date();
          const elapsed = Math.floor((now - startTime) / 1000);
          setElapsedSeconds(elapsed);
        }
      } catch (error) {
        console.error('Error checking active timer:', error);
      }
    };

    if (userId) {
      checkActiveTimer();
      fetchTimeEntries();
    }
  }, [userId]);

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  // Start timer
  const handleStart = async () => {
    try {
      const response = await fetch(`${API_URL}/time-entries/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          challengeId: selectedChallenge || null,
          description: description || 'Working on challenge'
        })
      });

      const data = await response.json();
      setActiveEntry(data);
      setIsRunning(true);
      setElapsedSeconds(0);
    } catch (error) {
      console.error('Error starting timer:', error);
    }
  };

  // Stop timer
  const handleStop = async () => {
    if (!activeEntry) return;

    try {
      const response = await fetch(`${API_URL}/time-entries/stop/${activeEntry._id}`, {
        method: 'POST'
      });

      const data = await response.json();
      
      // NEW: Check if a challenge FAILED (ran out of safe days)
      if (data.challengeFailureInfo) {
        const { failedChallengeTitle, failedBetItem, longestStreak } = data.challengeFailureInfo;
        
        setChallengeFailureNotification({
          title: failedChallengeTitle,
          betItem: failedBetItem,
          longestStreak
        });
        
        // Auto-dismiss after 20 seconds
        setTimeout(() => setChallengeFailureNotification(null), 20000);
        
        // Refresh challenges to show failed challenge in Failed section
        fetchChallenges();
      }
      // 🎮 Check if any bets were just unlocked!
      else if (data.betUnlockInfo) {
        const { challengeTitle, currentStreak, unlockedBets } = data.betUnlockInfo;
        
        setBetUnlockNotification({
          challengeTitle,
          currentStreak,
          unlockedBets
        });
        
        // Fire confetti!
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#a855f7', '#ec4899', '#f59e0b', '#10b981']
        });
        
        // Auto-dismiss after 15 seconds
        setTimeout(() => setBetUnlockNotification(null), 15000);
        
        // Refresh challenges to show unlocked bet
        fetchChallenges();
      }
      // ELSE: Check if a Safe Day was used (only if challenge didn't fail)
      else if (data.safeDayInfo) {
        const { challengeTitle, safeDaysRemaining, safeDaysTotal } = data.safeDayInfo;
        
        // Get AI roast message
        try {
          const aiMessage = await getSafeDayUsedMessage(challengeTitle, safeDaysRemaining);
          setSafeDayNotification({
            challengeTitle,
            safeDaysRemaining,
            safeDaysTotal,
            aiMessage
          });
          
          // Auto-dismiss after 15 seconds
          setTimeout(() => setSafeDayNotification(null), 15000);
        } catch (error) {
          console.error('Failed to get Safe Day AI message:', error);
          // Show notification anyway, even without AI message
          setSafeDayNotification({
            challengeTitle,
            safeDaysRemaining,
            safeDaysTotal,
            aiMessage: safeDaysRemaining === 0 
              ? `💀 You used your LAST Safe Day! Next miss = BET BURNS!`
              : `⚡ Safe Day used! You survived... barely.`
          });
          setTimeout(() => setSafeDayNotification(null), 15000);
        }
      }

      setIsRunning(false);
      setElapsedSeconds(0);
      setDescription('');
      setSelectedChallenge('');
      setActiveEntry(null);
      
      // Refresh time entries
      fetchTimeEntries();
    } catch (error) {
      console.error('Error stopping timer:', error);
    }
  };

  // Auto-save description
  useEffect(() => {
    if (isRunning && activeEntry) {
      const saveInterval = setInterval(async () => {
        try {
          await fetch(`${API_URL}/time-entries/${activeEntry._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description })
          });
        } catch (error) {
          console.error('Error auto-saving:', error);
        }
      }, 10000); // Save every 10 seconds

      return () => clearInterval(saveInterval);
    }
  }, [isRunning, activeEntry, description]);

  // Delete time entry
  const handleDelete = async (entryId) => {
    try {
      await fetch(`${API_URL}/time-entries/${entryId}`, {
        method: 'DELETE'
      });
      fetchTimeEntries();
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  // Delete all sessions in a group
  const handleDeleteGroup = async (sessions) => {
    try {
      // Delete all sessions in parallel
      await Promise.all(
        sessions.map(session => 
          fetch(`${API_URL}/time-entries/${session._id}`, {
            method: 'DELETE'
          })
        )
      );
      fetchTimeEntries();
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  // Group entries by date, then by challenge
  const groupedEntries = timeEntries.reduce((acc, entry) => {
    const date = new Date(entry.startTime).toDateString();
    if (!acc[date]) {
      acc[date] = {};
    }
    
    // Group by challenge (or "No Challenge" if none)
    const challengeKey = entry.challengeId?._id || 'no-challenge';
    if (!acc[date][challengeKey]) {
      acc[date][challengeKey] = {
        challenge: entry.challengeId,
        sessions: []
      };
    }
    
    acc[date][challengeKey].sessions.push(entry);
    return acc;
  }, {});

  // NEW: Group dates by weeks (Clockify style)
  const getWeekKey = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday as start of week
    const monday = new Date(date.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString().split('T')[0];
  };

  const getWeekRange = (mondayStr) => {
    const monday = new Date(mondayStr);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    const formatMonthDay = (date) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[date.getMonth()]} ${date.getDate()}`;
    };
    
    return `${formatMonthDay(monday)} - ${formatMonthDay(sunday)}`;
  };

  // Group entries by week
  const weeklyGroupedEntries = Object.entries(groupedEntries).reduce((acc, [date, challengeGroups]) => {
    const weekKey = getWeekKey(date);
    if (!acc[weekKey]) {
      acc[weekKey] = {};
    }
    acc[weekKey][date] = challengeGroups;
    return acc;
  }, {});

  // Calculate week total
  const getWeekTotal = (weekData) => {
    let total = 0;
    Object.values(weekData).forEach(challengeGroups => {
      Object.values(challengeGroups).forEach(group => {
        group.sessions.forEach(session => {
          total += session.duration || 0;
        });
      });
    });
    return formatTime(total);
  };

  // Calculate total for a group of sessions
  const getSessionsTotal = (sessions) => {
    const total = sessions.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    return formatTime(total);
  };

  // Calculate daily total
  const getDayTotal = (challengeGroups) => {
    let total = 0;
    Object.values(challengeGroups).forEach(group => {
      group.sessions.forEach(session => {
        total += session.duration || 0;
      });
    });
    return formatTime(total);
  };

  // Toggle group expansion
  const toggleGroup = (groupKey) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-orange-950/20 to-slate-950 pb-8">
      {/* NEW: Safe Day Notification Banner */}
      <AnimatePresence>
        {safeDayNotification && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] max-w-2xl w-full mx-4"
          >
            <div className={`glass-card p-6 rounded-2xl border-2 ${
              safeDayNotification.safeDaysRemaining === 0 
                ? 'border-red-500/50 bg-red-900/20' 
                : 'border-yellow-500/50 bg-yellow-900/20'
            } shadow-2xl`}>
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">⚡</span>
                  <div>
                    <h3 className="text-xl font-bold text-yellow-300">
                      SAFE DAY USED!
                    </h3>
                    <p className="text-sm text-gray-300">
                      {safeDayNotification.challengeTitle}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSafeDayNotification(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              
              {/* Safe Days Counter */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Safe Days Remaining</span>
                  <span className={`text-2xl font-bold ${
                    safeDayNotification.safeDaysRemaining === 0 ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {safeDayNotification.safeDaysRemaining} / {safeDayNotification.safeDaysTotal}
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      safeDayNotification.safeDaysRemaining === 0 
                        ? 'bg-red-500' 
                        : 'bg-yellow-500'
                    }`}
                    style={{ 
                      width: `${(safeDayNotification.safeDaysRemaining / safeDayNotification.safeDaysTotal) * 100}%` 
                    }}
                  />
                </div>
              </div>
              
              {/* AI Message */}
              <div className="glass-strong p-3 rounded-lg border border-white/10">
                <p className="text-sm text-gray-200 italic">
                  {safeDayNotification.aiMessage}
                </p>
              </div>
              
              {/* Warning if last Safe Day used */}
              {safeDayNotification.safeDaysRemaining === 0 && (
                <div className="mt-3 p-3 bg-red-900/30 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-300 font-bold text-center">
                    💀 LAST SAFE DAY GONE! NEXT MISS = BET BURNS! 💀
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NEW: Challenge Failure Notification */}
      <AnimatePresence>
        {challengeFailureNotification && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] max-w-2xl w-full mx-4"
          >
            <div className="glass-card p-6 rounded-2xl border-2 border-red-500/50 bg-red-900/30 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-5xl animate-pulse">💀</span>
                  <div>
                    <h3 className="text-2xl font-bold text-red-300">
                      CHALLENGE FAILED!
                    </h3>
                    <p className="text-sm text-gray-300">
                      {challengeFailureNotification.title}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setChallengeFailureNotification(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              
              {/* Bet Burned */}
              <div className="mb-4 p-4 bg-red-900/40 border-2 border-red-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🔥</span>
                  <h4 className="font-bold text-red-200">BET BURNED FOREVER</h4>
                </div>
                <p className="text-sm text-red-300">
                  <span className="font-bold">{challengeFailureNotification.betItem}</span> is now LOCKED PERMANENTLY
                </p>
                <p className="text-xs text-red-400 mt-1">
                  You ran out of Safe Days. No second chances.
                </p>
              </div>
              
              {/* Streak Stats */}
              <div className="mb-4 p-3 glass-strong rounded-lg border border-white/10">
                <p className="text-xs text-gray-400 mb-1">Longest Streak Achieved</p>
                <p className="text-3xl font-black text-yellow-400">
                  {challengeFailureNotification.longestStreak} days
                </p>
              </div>
              
              {/* All Streaks Reset Warning */}
              <div className="p-4 bg-orange-900/30 border-2 border-orange-500/30 rounded-lg">
                <h4 className="font-bold text-orange-300 mb-2 flex items-center gap-2">
                  <span className="text-xl">⚠️</span>
                  ALL ACTIVE CHALLENGES' STREAKS RESET TO 0!
                </h4>
                <p className="text-sm text-orange-200">
                  When one challenge fails, ALL your active challenges' streaks are reset to zero.
                  This is your accountability system - all or nothing! 🔥
                </p>
              </div>
              
              {/* Action Message */}
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-300 italic">
                  "Failure is part of the journey. Start again, stronger this time." 💪
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🎮 NEW: Bet Unlock Celebration Notification */}
      <AnimatePresence>
        {betUnlockNotification && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -100 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] max-w-2xl w-full mx-4"
          >
            <div className="glass-card p-6 rounded-2xl border-2 border-purple-500/50 bg-gradient-to-br from-purple-900/30 to-pink-900/30 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <motion.span
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, -10, 10, -10, 0]
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                    className="text-5xl"
                  >
                    🎁
                  </motion.span>
                  <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                      MILESTONE UNLOCKED!
                    </h3>
                    <p className="text-sm text-gray-300">
                      {betUnlockNotification.challengeTitle}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setBetUnlockNotification(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              
              {/* Streak Achievement */}
              <div className="mb-4 text-center p-4 bg-purple-500/10 rounded-xl border border-purple-500/30">
                <p className="text-xs text-purple-300 mb-1">Current Streak</p>
                <p className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {betUnlockNotification.currentStreak} DAYS! 🔥
                </p>
              </div>
              
              {/* Unlocked Bets */}
              <div className="space-y-2 mb-4">
                <p className="text-sm font-bold text-purple-300">Rewards Unlocked:</p>
                {betUnlockNotification.unlockedBets.map((bet, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30"
                  >
                    <Gift className="w-5 h-5 text-purple-400" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">{bet.name}</p>
                      <p className="text-xs text-purple-300">
                        Milestone {bet.milestone} (Day {bet.unlockDay})
                      </p>
                    </div>
                    <span className="text-xl">✨</span>
                  </motion.div>
                ))}
              </div>
              
              {/* Download CTA */}
              <div className="p-4 bg-green-900/30 border-2 border-green-500/30 rounded-lg text-center">
                <p className="text-sm text-green-300 font-bold mb-1">
                  🎉 YOU EARNED THIS! 🎉
                </p>
                <p className="text-xs text-green-200">
                  Go to your challenges and download your unlocked bet{betUnlockNotification.unlockedBets.length > 1 ? 's' : ''}!
                  Keep going to unlock the rest! 💪
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Timer Bar - Clockify Style */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            {/* Description Input - Left */}
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are you working on?"
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/50 transition-all"
            />

            {/* Challenge Selector */}
            <div className="relative">
              <button
                onClick={() => setShowChallengeDropdown(!showChallengeDropdown)}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all flex items-center gap-2 min-w-[200px]"
              >
                <Flame size={16} className="text-orange-500" />
                <span className="flex-1 text-left truncate">
                  {selectedChallenge 
                    ? challenges.find(c => c._id === selectedChallenge)?.title || 'Select Challenge'
                    : 'No Challenge'}
                </span>
                <ChevronDown size={16} />
              </button>

              <AnimatePresence>
                {showChallengeDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full mt-2 w-full bg-slate-900 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50"
                  >
                    <button
                      onClick={() => {
                        setSelectedChallenge('');
                        setShowChallengeDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-gray-400 hover:bg-white/5 transition-colors"
                    >
                      No Challenge
                    </button>
                    {challenges.map((challenge) => (
                      <button
                        key={challenge._id}
                        onClick={() => {
                          setSelectedChallenge(challenge._id);
                          setShowChallengeDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                      >
                        <Flame size={14} className="text-orange-500" />
                        <span className="truncate">{challenge.title}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Timer Display */}
            <div className="text-2xl font-bold text-white font-mono min-w-[100px] text-center">
              {formatTime(elapsedSeconds)}
            </div>

            {/* Start/Stop Button - Right */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isRunning ? handleStop : handleStart}
              className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 ${
                isRunning 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white'
              } transition-all shadow-lg shadow-orange-500/50 min-w-[100px] justify-center`}
            >
              {isRunning ? (
                <>
                  <Square size={18} />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Play size={18} />
                  <span>Start</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Time Entries List */}
      <div className="max-w-6xl mx-auto px-6 mt-8 space-y-6">
        {Object.keys(groupedEntries).length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center"
          >
            <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-orange-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Time Entries Yet</h3>
            <p className="text-gray-400">Start tracking your time to see sessions here!</p>
          </motion.div>
        ) : (
          // NEW: Group by weeks (Clockify style)
          Object.entries(weeklyGroupedEntries)
            .sort((a, b) => new Date(b[0]) - new Date(a[0]))
            .map(([weekKey, weekData]) => (
              <div key={weekKey} className="space-y-4 mb-8">
                {/* Week Header with Total */}
                <div className="sticky top-16 z-40 bg-slate-950/95 backdrop-blur-xl border-b border-orange-500/30 py-3 px-4 -mx-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-orange-400">
                      {getWeekRange(weekKey)}
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Week total:</span>
                      <span className="text-lg font-mono font-black text-orange-400">
                        {getWeekTotal(weekData)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Days within the week */}
                {Object.entries(weekData)
                  .sort((a, b) => new Date(b[0]) - new Date(a[0]))
                  .map(([date, challengeGroups]) => (
                    <div key={date} className="space-y-3">
                      {/* Date Header */}
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-400">{formatDate(date)}</h3>
                        <div className="text-sm text-gray-500">
                          Total: <span className="text-orange-400 font-mono font-bold">{getDayTotal(challengeGroups)}</span>
                        </div>
                      </div>

                      {/* Challenge Groups */}
                      {Object.entries(challengeGroups).map(([challengeKey, group]) => {
                        const groupKey = `${date}-${challengeKey}`;
                        const isExpanded = expandedGroups[groupKey];

                        return (
                          <div key={challengeKey} className="space-y-2">
                      {/* Challenge Header - Collapsed by default */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl hover:border-orange-500/30 transition-all overflow-hidden group/card"
                      >
                        <div className="w-full p-4 flex items-center justify-between">
                          <div 
                            className="flex items-center gap-3 flex-1 cursor-pointer hover:bg-white/5 -m-4 p-4 transition-colors"
                            onClick={() => toggleGroup(groupKey)}
                          >
                            <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
                            <div className="text-left">
                              <p className="text-white font-medium">
                                {group.sessions[0].description}
                              </p>
                              {group.challenge && (
                                <div className="flex items-center gap-2 mt-1">
                                  <Flame size={12} className="text-orange-500" />
                                  <span className="text-xs text-orange-400">{group.challenge.title}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-2xl font-mono font-bold text-white">
                                {getSessionsTotal(group.sessions)}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                {group.sessions.length} session{group.sessions.length > 1 ? 's' : ''}
                              </div>
                            </div>
                            
                            {/* Delete entire group button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Delete all ${group.sessions.length} session${group.sessions.length > 1 ? 's' : ''}?`)) {
                                  handleDeleteGroup(group.sessions);
                                }
                              }}
                              className="opacity-0 group-hover/card:opacity-100 text-gray-600 hover:text-red-400 transition-all p-2 hover:bg-red-500/10 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                              className="cursor-pointer"
                              onClick={() => toggleGroup(groupKey)}
                            >
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            </motion.div>
                          </div>
                        </div>

                        {/* Individual Sessions - Expandable */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 space-y-2 border-t border-white/5">
                                {group.sessions.map((entry) => (
                                  <div
                                    key={entry._id}
                                    className="flex items-center justify-between py-3 group/session hover:bg-white/5 px-3 rounded-lg transition-colors"
                                  >
                                    <div className="flex items-center gap-4">
                                      <div className="text-sm text-gray-400 font-mono">
                                        {formatTimeOnly(entry.startTime)} - {formatTimeOnly(entry.endTime)}
                                      </div>
                                      <div className="text-sm font-mono font-medium text-white">
                                        {formatTime(entry.duration)}
                                      </div>
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(entry._id);
                                      }}
                                      className="opacity-0 group-hover/session:opacity-100 text-gray-600 hover:text-red-400 transition-all p-1.5 hover:bg-red-500/10 rounded-lg"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ))
        )}
      </div>
    </div>
  );
};

export default TimeTracker;

