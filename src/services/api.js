// Use environment variable for API URL (supports both dev and production)
const API_URL = import.meta.env.VITE_API_URL || 'https://studyfire-backend.onrender.com/api';

// Helper to get userId from localStorage
const getUserId = () => localStorage.getItem('userId');

// API service for StudyFire backend
const api = {
  // Get all challenges
  getChallenges: async () => {
    try {
      const userId = getUserId();
      if (!userId) throw new Error('User not logged in');
      
      const response = await fetch(`${API_URL}/challenges?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch challenges');
      return await response.json();
    } catch (error) {
      console.error('Error fetching challenges:', error);
      throw error;
    }
  },

  // Get single challenge
  getChallenge: async (id) => {
    try {
      const response = await fetch(`${API_URL}/challenges/${id}`);
      if (!response.ok) throw new Error('Failed to fetch challenge');
      return await response.json();
    } catch (error) {
      console.error('Error fetching challenge:', error);
      throw error;
    }
  },

  // Create new challenge
  createChallenge: async (challengeData) => {
    try {
      const userId = getUserId();
      if (!userId) throw new Error('User not logged in');
      
      const response = await fetch(`${API_URL}/challenges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...challengeData, userId }),
      });
      if (!response.ok) throw new Error('Failed to create challenge');
      return await response.json();
    } catch (error) {
      console.error('Error creating challenge:', error);
      throw error;
    }
  },

  // Update challenge
  updateChallenge: async (id, updates) => {
    try {
      console.log(`🌐 API: Updating challenge ${id}`);
      console.log('📤 Update payload:', updates);
      
      const response = await fetch(`${API_URL}/challenges/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      console.log('📡 API Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error response:', errorText);
        throw new Error('Failed to update challenge');
      }
      
      const result = await response.json();
      console.log('✅ API Response data:', result);
      return result;
    } catch (error) {
      console.error('❌ Error updating challenge:', error);
      throw error;
    }
  },

  // Delete challenge
  deleteChallenge: async (id) => {
    try {
      const response = await fetch(`${API_URL}/challenges/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete challenge');
      return await response.json();
    } catch (error) {
      console.error('Error deleting challenge:', error);
      throw error;
    }
  },

  // Get statistics
  getStats: async () => {
    try {
      const userId = getUserId();
      if (!userId) throw new Error('User not logged in');
      
      const response = await fetch(`${API_URL}/challenges/stats/summary?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      return await response.json();
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await fetch(`${API_URL}/health`);
      if (!response.ok) throw new Error('API health check failed');
      return await response.json();
    } catch (error) {
      console.error('Error checking API health:', error);
      throw error;
    }
  },

  // Get user details (including Streak Shields)
  getUserDetails: async () => {
    try {
      const userId = getUserId();
      if (!userId) throw new Error('User not logged in');
      
      const response = await fetch(`${API_URL}/auth/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user details');
      return await response.json();
    } catch (error) {
      console.error('Error fetching user details:', error);
      throw error;
    }
  }
};

export default api;
