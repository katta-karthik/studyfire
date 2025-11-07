import { createContext, useState, useContext, useEffect } from 'react';

// Use environment variable for API URL
const API_URL = import.meta.env.VITE_API_URL || 'https://studyfire-backend.onrender.com/api';

const TimerContext = createContext();

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within TimerProvider');
  }
  return context;
};

export const TimerProvider = ({ children }) => {
  const [activeTimer, setActiveTimer] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [todayProgress, setTodayProgress] = useState({});

  // Load active timer from localStorage on mount
  useEffect(() => {
    const savedTimer = localStorage.getItem('activeTimer');
    if (savedTimer) {
      const timer = JSON.parse(savedTimer);
      const startTime = new Date(timer.startTime);
      const now = new Date();
      const elapsed = Math.floor((now - startTime) / 1000);
      
      setActiveTimer(timer);
      setElapsedSeconds(elapsed);
    }
  }, []);

  // Tick every second when timer is active
  useEffect(() => {
    if (!activeTimer) return;

    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer]);

  // Save to localStorage whenever activeTimer changes
  useEffect(() => {
    if (activeTimer) {
      localStorage.setItem('activeTimer', JSON.stringify(activeTimer));
    } else {
      localStorage.removeItem('activeTimer');
    }
  }, [activeTimer]);

  const startTimer = (challenge) => {
    const timer = {
      challengeId: challenge._id || challenge.id,
      challengeTitle: challenge.title,
      dailyTargetMinutes: challenge.dailyTargetMinutes,
      startTime: new Date().toISOString()
    };
    
    setActiveTimer(timer);
    setElapsedSeconds(0);
  };

  const stopTimer = async () => {
    if (!activeTimer) return null;

    const duration = Math.floor(elapsedSeconds / 60); // Convert to minutes
    const sessionData = {
      challengeId: activeTimer.challengeId,
      startTime: activeTimer.startTime,
      endTime: new Date().toISOString(),
      duration,
      elapsedSeconds
    };

    // Stop the timer
    setActiveTimer(null);
    setElapsedSeconds(0);

    // Update today's progress
    await refreshTodayProgress();

    return sessionData;
  };

  const refreshTodayProgress = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`${API_URL}/challenges/today-progress?userId=${userId}`);
      
      if (response.ok) {
        const progress = await response.json();
        console.log('🔄 Today Progress from server:', progress);
        setTodayProgress(progress);
      } else {
        console.error('❌ Failed to fetch today progress:', response.status);
      }
    } catch (error) {
      console.error('Error refreshing today progress:', error);
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const value = {
    activeTimer,
    elapsedSeconds,
    formattedTime: formatTime(elapsedSeconds),
    todayProgress,
    startTimer,
    stopTimer,
    refreshTodayProgress,
    isTimerActive: !!activeTimer
  };

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
};
