 import { useState, useEffect } from 'react';
import api from '../services/api';

export const useChallenges = (isLoggedIn) => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load challenges from backend
  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading challenges from backend...');
      
      const data = await api.getChallenges();
      console.log('✅ Challenges loaded:', data.length, 'challenges');
      console.log('📦 Challenge data:', data);
      setChallenges(data);
      setError(null);
    } catch (err) {
      console.error('❌ Error loading challenges:', err);
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

      console.log('📝 Creating challenge in backend...');
      const savedChallenge = await api.createChallenge(newChallenge);
      console.log('✅ Challenge created:', savedChallenge);
      setChallenges(prev => [savedChallenge, ...prev]);
      
      return savedChallenge;
    } catch (err) {
      console.error('❌ Error adding challenge:', err);
      throw err;
    }
  };

  const updateChallenge = async (challengeId, updates) => {
    try {
      console.log(`🔄 useChallenges: Updating challenge ${challengeId}`);
      console.log('📦 Updates:', updates);
      
      const updatedChallenge = await api.updateChallenge(challengeId, updates);
      
      console.log('✅ Challenge updated successfully:', updatedChallenge);
      
      setChallenges(prev =>
        prev.map(challenge =>
          challenge._id === challengeId || challenge.id === challengeId
            ? updatedChallenge
            : challenge
        )
      );
    } catch (err) {
      console.error('❌ Error updating challenge:', err);
      throw err;
    }
  };

  const deleteChallenge = async (challengeId) => {
    try {
      console.log(`🗑️ Deleting challenge ${challengeId}`);
      await api.deleteChallenge(challengeId);
      
      console.log('✅ Challenge deleted successfully');
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
