 import { useState, useEffect } from 'react';
import api from '../services/api';

// Simple cache to avoid redundant API calls
const cache = {
  data: null,
  timestamp: 0,
  duration: 20000 // 20 seconds
};

export const useChallenges = (isLoggedIn) => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load challenges from backend
  useEffect(() => {
    if (isLoggedIn) {
      loadChallenges();
    } else {
      setChallenges([]);
      setLoading(false);
    }
  }, [isLoggedIn]);

  const loadChallenges = async (forceRefresh = false) => {
    try {
      // Check cache first (unless forced refresh)
      const now = Date.now();
      if (!forceRefresh && cache.data && (now - cache.timestamp) < cache.duration) {
        setChallenges(cache.data);
        setLoading(false);
        return;
      }

      setLoading(true);
      
      const data = await api.getChallenges();
      
      // Update cache
      cache.data = data;
      cache.timestamp = now;
      
      setChallenges(data);
      setError(null);
    } catch (err) {
      setError('Failed to load challenges from server.');
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  };

  const addChallenge = async (challenge) => {
    try {
      const newChallenge = {
        ...challenge,
        currentStreak: 0,
        longestStreak: 0,
        completedDays: [],
        totalMinutes: 0,
        lastCompletedDate: null,
        isActive: true,
        isBetLocked: false,
        isCompleted: false,
        isBetReturned: false,
      };

      const savedChallenge = await api.createChallenge(newChallenge);
      
      // Invalidate cache FIRST
      cache.timestamp = 0;
      cache.data = null;
      
      // Update state with new challenge
      setChallenges(prev => [savedChallenge, ...prev]);
      
      return savedChallenge;
    } catch (err) {
      throw err;
    }
  };

  const updateChallenge = async (challengeId, updates) => {
    try {
      const updatedChallenge = await api.updateChallenge(challengeId, updates);
      
      // Invalidate cache
      cache.timestamp = 0;
      cache.data = null;
      
      setChallenges(prev =>
        prev.map(challenge =>
          challenge._id === challengeId || challenge.id === challengeId
            ? updatedChallenge
            : challenge
        )
      );
    } catch (err) {
      throw err;
    }
  };

  const deleteChallenge = async (challengeId) => {
    try {
      await api.deleteChallenge(challengeId);
      
      // Invalidate cache
      cache.timestamp = 0;
      cache.data = null;
      
      setChallenges(prev => prev.filter(c => c._id !== challengeId && c.id !== challengeId));
      
      return { success: true };
    } catch (err) {
      console.error('❌ Error deleting challenge:', err);
      
      if (err.response?.status === 403) {
        const errorData = err.response?.data;
        return {
          success: false,
          blocked: true,
          message: errorData?.message || 'Cannot delete this challenge',
          reason: errorData?.reason || 'Challenge has work logged and cannot be deleted',
          details: errorData?.details
        };
      }
      
      return { success: false, message: 'Failed to delete challenge' };
    }
  };

  const checkStreakValidity = (challenge) => {
    if (!challenge.lastCompletedDate) return challenge;

    const lastDate = new Date(challenge.lastCompletedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

    // If more than 1 day has passed, streak is broken
    if (daysDiff > 1) {
      return {
        ...challenge,
        currentStreak: 0,
        isBetLocked: true,
        isActive: false,
      };
    }

    return challenge;
  };

  const recordProgress = async (challengeId, minutesCompleted) => {
    const challenge = challenges.find(c => c._id === challengeId || c.id === challengeId);
    if (!challenge) return;

    const today = new Date().toISOString().split('T')[0];
    const isCompletedToday = challenge.completedDays.some(
      day => day.date === today
    );

    let updates;
    if (isCompletedToday) {
      // Update today's progress
      updates = {
        completedDays: challenge.completedDays.map(day =>
          day.date === today
            ? { ...day, minutes: day.minutes + minutesCompleted }
            : day
        ),
        totalMinutes: challenge.totalMinutes + minutesCompleted,
      };
    } else {
      // Add new day
      const newStreak = challenge.currentStreak + 1;
      updates = {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, challenge.longestStreak),
        completedDays: [
          ...challenge.completedDays,
          { date: today, minutes: minutesCompleted }
        ],
        totalMinutes: challenge.totalMinutes + minutesCompleted,
        lastCompletedDate: new Date().toISOString(),
      };
    }

    await updateChallenge(challengeId, updates);
    
    // Force cache invalidation after progress update
    cache.timestamp = 0;
    cache.data = null;
  };

  return {
    challenges,
    loading,
    error,
    addChallenge,
    updateChallenge,
    deleteChallenge,
    checkStreakValidity,
    recordProgress,
    reloadChallenges: loadChallenges,
  };
};
