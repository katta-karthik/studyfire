import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, X, Flame, Trophy, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getSessionMessage } from '../utils/motivationalMessages';
import { getTimerStartMessage, getTimerStopMessage } from '../services/geminiService';

const TimerView = ({ challenge, onUpdate, onBack }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [aiMotivation, setAiMotivation] = useState("Ready to crush your goals! 🔥");
  const intervalRef = useRef(null);

  // Load today's existing time (like Clockify - continue from where you left off)
  const getTodaySeconds = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = challenge.completedDays?.find(day => day.date === today);
    // Load both minutes AND seconds if available
    const minutes = todayEntry?.minutes || 0;
    const seconds = todayEntry?.seconds || 0;
    const totalSeconds = minutes * 60 + seconds;
    console.log(`🔍 Loading timer for ${today}:`, todayEntry ? `${minutes}m ${seconds}s (${totalSeconds}s total)` : 'Starting fresh (0s)');
    console.log('📊 All completed days:', challenge.completedDays);
    return totalSeconds;
  };

  const [elapsedSeconds, setElapsedSeconds] = useState(getTodaySeconds());
  const [sessionStartTime, setSessionStartTime] = useState(null);

  // Check if time window was missed (strict enforcement - NO second chances)
  useEffect(() => {
    if (!challenge.startTimeRequired || !challenge.scheduledStartTime || challenge.hasFailed) {
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const hasStartedToday = challenge.completedDays?.some(day => day.date === today && day.minutes > 0);
    
    // If they haven't started today and the time window has passed, FAIL immediately
    if (!hasStartedToday) {
      const now = new Date();
      const [hours, minutes] = challenge.scheduledStartTime.split(':').map(Number);
      
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);
      
      const bufferEnd = new Date(scheduledTime);
      bufferEnd.setMinutes(bufferEnd.getMinutes() + 10);
      
      if (now > bufferEnd) {
        // TIME'S UP! Mark as failed immediately
        const updatedChallenge = {
          ...challenge,
          hasFailed: true,
          isActive: false,
          isBetLocked: true,
          failedDates: [
            ...(challenge.failedDates || []),
            {
              date: today,
              reason: `Late start - missed time window (${challenge.scheduledStartTime} + 10 min buffer)`
            }
          ]
        };
        
        onUpdate(challenge._id || challenge.id, updatedChallenge);
        
        alert(`🔥 CHALLENGE FAILED! 🔥\n\nYou missed your start time window (${challenge.scheduledStartTime} + 10 min).\n\nYour bet "${challenge.betItem?.name}" has been LOCKED FOREVER.\n\nSerious learners don't miss deadlines.`);
        
        setTimeout(() => onBack(), 2000);
      }
    }
  }, [challenge, onUpdate, onBack]);

  const targetSeconds = challenge.dailyTargetMinutes * 60;
  // Allow progress to go over 100% for extra time tracking (like Clockify)
  const progressPercentage = (elapsedSeconds / targetSeconds) * 100;
  const isGoalReached = elapsedSeconds >= targetSeconds;

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
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

  // Update browser tab title with timer (Clockify style)
  useEffect(() => {
    const formattedTime = formatTime(elapsedSeconds);
    
    if (isRunning) {
      document.title = `▶ ${formattedTime} - ${challenge.title}`;
    } else if (elapsedSeconds > 0) {
      document.title = `⏸ ${formattedTime} - ${challenge.title}`;
    } else {
      document.title = `StudyFire - ${challenge.title}`;
    }

    // Restore original title when component unmounts
    return () => {
      document.title = 'StudyFire 🔥';
    };
  }, [isRunning, elapsedSeconds, challenge.title]);

  // Auto-save every 10 seconds (like Clockify) - saves progress without completing
  useEffect(() => {
    if (!isRunning) return;

    const autoSaveInterval = setInterval(() => {
      const today = new Date().toISOString().split('T')[0];
      const currentMinutes = Math.floor(elapsedSeconds / 60);
      const currentSeconds = elapsedSeconds % 60;
      
      console.log(`🔄 Auto-save check: ${currentMinutes}m ${currentSeconds}s (${elapsedSeconds}s total), isRunning: ${isRunning}`);
      
      if (elapsedSeconds === 0) {
        console.log('⏭️ Skipping save - no time to save yet');
        return; // Don't save if no time tracked
      }
      
      const todayEntry = challenge.completedDays?.find(day => day.date === today);
      
      const updatedChallenge = {
        ...challenge,
        completedDays: todayEntry
          ? challenge.completedDays.map(day =>
              day.date === today
                ? { 
                    ...day, 
                    minutes: currentMinutes, 
                    seconds: currentSeconds,
                    isGoalReached: elapsedSeconds >= targetSeconds // Update goal status
                  }
                : day
            )
          : [...(challenge.completedDays || []), { 
              date: today, 
              minutes: currentMinutes, 
              seconds: currentSeconds,
              isGoalReached: elapsedSeconds >= targetSeconds // Mark if goal reached
            }],
        totalMinutes: challenge.totalMinutes - (todayEntry?.minutes || 0) + currentMinutes,
        // DON'T update currentStreak here - only when midnight verification happens
      };

      console.log(`💾 AUTO-SAVING: ${currentMinutes}m ${currentSeconds}s at ${new Date().toLocaleTimeString()}`);
      console.log('📤 Sending to API:', updatedChallenge);
      
      onUpdate(challenge._id || challenge.id, updatedChallenge);
      setLastSaved(new Date());
    }, 10000); // Every 10 seconds

    return () => clearInterval(autoSaveInterval);
  }, [isRunning, elapsedSeconds, challenge, onUpdate, targetSeconds]);

  const handleStart = async () => {
    // Load AI motivation when starting
    try {
      const msg = await getTimerStartMessage(challenge.title);
      setAiMotivation(msg);
    } catch (error) {
      console.error('Failed to load start message:', error);
    }
    
    // ONLY check time window when starting (not when opening the challenge)
    if (challenge.startTimeRequired && challenge.scheduledStartTime) {
      const now = new Date();
      const [hours, minutes] = challenge.scheduledStartTime.split(':').map(Number);
      
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);
      
      const bufferEnd = new Date(scheduledTime);
      bufferEnd.setMinutes(bufferEnd.getMinutes() + 10); // 10 min buffer
      
      const isWithinWindow = now >= scheduledTime && now <= bufferEnd;
      const hasPassedWindow = now > bufferEnd;
      
      // If past the buffer time, mark as failed
      if (hasPassedWindow) {
        const today = new Date().toISOString().split('T')[0];
        const updatedChallenge = {
          ...challenge,
          hasFailed: true,
          isActive: false,
          isBetLocked: true,
          failedDates: [
            ...(challenge.failedDates || []),
            {
              date: today,
              reason: `Late start - missed time window (${challenge.scheduledStartTime} + 10 min buffer)`
            }
          ]
        };
        
        onUpdate(challenge._id || challenge.id, updatedChallenge);
        
        alert(`🔥 CHALLENGE FAILED! 🔥\n\nYou missed your start time window (${challenge.scheduledStartTime} + 10 min).\n\nYour bet "${challenge.betItem?.name}" has been LOCKED FOREVER.\n\nSerious learners don't miss deadlines.`);
        
        setTimeout(() => onBack(), 1000);
        return;
      }
      
      // If not within window yet, block start
      if (!isWithinWindow) {
        const minutesUntil = Math.floor((scheduledTime - now) / 1000 / 60);
        alert(`⏰ You can only start between ${challenge.scheduledStartTime} and 10 minutes after!\n\nCome back in ${minutesUntil} minutes.`);
        return;
      }
    }
    
    setIsRunning(true);
    if (!sessionStartTime) {
      setSessionStartTime(new Date().toISOString());
    }
  };

  const handlePause = async () => {
    setIsRunning(false);
    
    // Save immediately when pausing (Clockify style)
    const today = new Date().toISOString().split('T')[0];
    const currentMinutes = Math.floor(elapsedSeconds / 60);
    const currentSeconds = elapsedSeconds % 60;
    
    console.log(`⏸️ PAUSE clicked - elapsed: ${currentMinutes}m ${currentSeconds}s (${elapsedSeconds}s total)`);
    
    // Load AI feedback when stopping
    try {
      const wasProductive = currentMinutes >= challenge.dailyTargetMinutes;
      const msg = await getTimerStopMessage(currentMinutes, wasProductive);
      setAiMotivation(msg);
    } catch (error) {
      console.error('Failed to load stop message:', error);
    }
    
    if (elapsedSeconds > 0) {
      const todayEntry = challenge.completedDays?.find(day => day.date === today);
      
      const updatedChallenge = {
        ...challenge,
        completedDays: todayEntry
          ? challenge.completedDays.map(day =>
              day.date === today
                ? { 
                    ...day, 
                    minutes: currentMinutes, 
                    seconds: currentSeconds,
                    isGoalReached: elapsedSeconds >= targetSeconds
                  }
                : day
            )
          : [...(challenge.completedDays || []), { 
              date: today, 
              minutes: currentMinutes, 
              seconds: currentSeconds,
              isGoalReached: elapsedSeconds >= targetSeconds
            }],
        totalMinutes: challenge.totalMinutes - (todayEntry?.minutes || 0) + currentMinutes,
        // DON'T mark as completed - user can come back and continue!
      };

      console.log(`💾 SAVING ON PAUSE: ${currentMinutes}m ${currentSeconds}s`);
      console.log('📤 Sending to API:', updatedChallenge);
      onUpdate(challenge._id || challenge.id, updatedChallenge);
    } else {
      console.log('⏭️ Not saving - no time tracked yet');
    }
  };

  // Celebrate when goal is reached (auto-confetti, no manual complete needed)
  const [hasReachedGoalToday, setHasReachedGoalToday] = useState(false);
  
  useEffect(() => {
    if (isGoalReached && !hasReachedGoalToday) {
      // Fire confetti when goal reached!
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#10b981', '#059669', '#34d399']
      });
      setHasReachedGoalToday(true);
    }
  }, [isGoalReached, hasReachedGoalToday]);

  // CRITICAL: Save before browser close/refresh (Clockify-style reliability)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (elapsedSeconds > 0) {
        const today = new Date().toISOString().split('T')[0];
        const currentMinutes = Math.floor(elapsedSeconds / 60);
        const currentSeconds = elapsedSeconds % 60;
        const todayEntry = challenge.completedDays?.find(day => day.date === today);
        
        const updatedChallenge = {
          ...challenge,
          completedDays: todayEntry
            ? challenge.completedDays.map(day =>
                day.date === today
                  ? { 
                      ...day, 
                      minutes: currentMinutes, 
                      seconds: currentSeconds,
                      isGoalReached: elapsedSeconds >= targetSeconds
                    }
                  : day
              )
            : [...(challenge.completedDays || []), { 
                date: today, 
                minutes: currentMinutes, 
                seconds: currentSeconds,
                isGoalReached: elapsedSeconds >= targetSeconds
              }],
          totalMinutes: challenge.totalMinutes - (todayEntry?.minutes || 0) + currentMinutes,
        };
        
        // Use sendBeacon for reliable save during unload
        const userId = localStorage.getItem('userId');
        const apiUrl = `http://localhost:5000/api/challenges/${challenge._id || challenge.id}`;
        
        // Try sendBeacon first (most reliable)
        const data = JSON.stringify(updatedChallenge);
        const blob = new Blob([data], { type: 'application/json' });
        
        if (navigator.sendBeacon) {
          navigator.sendBeacon(apiUrl, blob);
        } else {
          // Fallback to synchronous fetch
          fetch(apiUrl, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: data,
            keepalive: true
          });
        }
        
        console.log(`💾 SAVING BEFORE CLOSE: ${currentMinutes}m ${currentSeconds}s`);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [elapsedSeconds, challenge, targetSeconds]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const motivationMessage = getSessionMessage(progressPercentage, isGoalReached);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-strong rounded-2xl p-6 max-w-2xl w-full border border-white/10"
      >
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="glass rounded-full p-2 hover:bg-white/10 transition-all"
          >
            <X className="w-4 h-4" />
          </motion.button>

          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-fire-500 animate-flame" />
            <span className="text-xs text-gray-400">
              Day {challenge.currentStreak + 1} of {challenge.duration}
            </span>
          </div>
        </div>

        {/* Compact Challenge Title */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold mb-1">{challenge.title}</h1>
          {challenge.description && (
            <p className="text-gray-400 text-xs">{challenge.description}</p>
          )}
          {/* Auto-save indicator - Clockify style */}
          {lastSaved && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-green-400 mt-1"
            >
              ✓ Auto-saved {Math.floor((new Date() - lastSaved) / 1000)}s ago
            </motion.p>
          )}
        </div>

        {/* AI Motivation Box */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-gradient-to-r from-purple-900/30 to-fire-900/30 border border-purple-500/20 rounded-xl backdrop-blur-sm"
        >
          <p className="text-gray-300 text-center text-sm italic">
            {aiMotivation}
          </p>
        </motion.div>

        {/* Compact Timer Display */}
        <motion.div
          animate={{
            scale: isRunning ? [1, 1.01, 1] : 1
          }}
          transition={{
            duration: 1,
            repeat: isRunning ? Infinity : 0
          }}
          className="relative mb-4"
        >
          {/* Circular Progress - Smaller */}
          <div className="relative w-48 h-48 mx-auto">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="8"
                fill="none"
              />
              {/* Progress circle */}
              <motion.circle
                cx="96"
                cy="96"
                r="88"
                stroke="url(#fireGradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 88}
                initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
                animate={{
                  // Cap at 100% visually, but allow progress tracking beyond
                  strokeDashoffset: 2 * Math.PI * 88 * (1 - Math.min(progressPercentage, 100) / 100)
                }}
                transition={{ duration: 0.5 }}
                className="drop-shadow-lg"
                style={{
                  filter: isGoalReached ? 'drop-shadow(0 0 10px #10b981)' : 'none'
                }}
              />
              <defs>
                <linearGradient id="fireGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={isGoalReached ? "#10b981" : "#f97316"} />
                  <stop offset="50%" stopColor={isGoalReached ? "#059669" : "#ea580c"} />
                  <stop offset="100%" stopColor={isGoalReached ? "#34d399" : "#fb923c"} />
                </linearGradient>
              </defs>
            </svg>

            {/* Timer Text - Smaller */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.p
                className="text-3xl font-bold"
                animate={{
                  color: isGoalReached ? ['#10b981', '#f97316'] : '#ffffff'
                }}
                transition={{
                  duration: 0.5,
                  repeat: isGoalReached ? Infinity : 0,
                  repeatType: 'reverse'
                }}
              >
                {formatTime(elapsedSeconds)}
              </motion.p>
              <p className="text-gray-400 text-xs mt-1">
                {Math.floor(elapsedSeconds / 60)} / {challenge.dailyTargetMinutes} min
              </p>
            </div>
          </div>
        </motion.div>

        {/* Compact Motivational Message */}
        <motion.div
          key={motivationMessage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-lg p-3 mb-4 text-center"
        >
          <p className="text-sm font-medium">{motivationMessage}</p>
        </motion.div>

        {/* Compact Progress Info */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="glass rounded-lg p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">Progress</p>
            <p className={`text-xl font-bold ${
              progressPercentage >= 100 ? 'text-green-400' : 'text-fire-500'
            }`}>
              {progressPercentage.toFixed(0)}%
            </p>
          </div>
          <div className="glass rounded-lg p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">
              {elapsedSeconds >= targetSeconds ? 'Extra Time' : 'Remaining'}
            </p>
            <p className={`text-xl font-bold ${
              elapsedSeconds >= targetSeconds ? 'text-green-400' : 'text-focus-500'
            }`}>
              {elapsedSeconds >= targetSeconds 
                ? `+${Math.floor(elapsedSeconds / 60) - challenge.dailyTargetMinutes} min`
                : `${Math.max(0, challenge.dailyTargetMinutes - Math.floor(elapsedSeconds / 60))} min`
              }
            </p>
          </div>
        </div>

        {/* Compact Bet Warning */}
        {challenge.betItem && challenge.isBetLocked && (
          <motion.div
            animate={{
              scale: [1, 1.01, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity
            }}
            className="glass-strong rounded-lg p-3 mb-4 border border-red-500/30"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-400 font-bold text-xs">🔒 LOCKED BET</p>
                <p className="text-gray-400 text-xs">{challenge.betItem.name}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Simple Control Buttons - Only Start/Pause (Clockify style) */}
        <div className="flex gap-3">
          {!isRunning ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStart}
              className="w-full bg-fire-gradient rounded-xl py-3 font-bold text-base flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-fire-500/50 transition-all"
            >
              <Play className="w-5 h-5" />
              {sessionStartTime ? 'Resume' : 'Start'}
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePause}
              className="w-full bg-focus-gradient rounded-xl py-3 font-bold text-base flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-focus-500/50 transition-all"
            >
              <Pause className="w-5 h-5" />
              Pause
            </motion.button>
          )}
        </div>

        {/* Compact Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-xs text-gray-500 mt-4"
        >
          {isGoalReached ? (
            <span className="text-green-400 font-medium">
              ✓ Daily goal reached! Keep tracking if you want to go beyond 🔥
            </span>
          ) : (
            <span>
              ⏱️ Auto-saves every 10s • Track unlimited time • Goal: {challenge.dailyTargetMinutes} min
            </span>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default TimerView;
