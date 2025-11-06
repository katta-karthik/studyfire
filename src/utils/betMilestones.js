// 🎮 Bet Milestone Calculator for Gamified Multi-Bet System

/**
 * Calculate unlock days for multi-bet system
 * Distributes bets evenly across challenge duration
 * 
 * @param {number} totalDays - Total challenge duration
 * @param {number} betCount - Number of bets (2-5)
 * @returns {Array<number>} - Array of unlock days
 * 
 * Examples:
 * - 30 days, 2 bets → [15, 30]
 * - 60 days, 3 bets → [20, 40, 60]
 * - 100 days, 4 bets → [25, 50, 75, 100]
 */
export const calculateBetMilestones = (totalDays, betCount) => {
  if (betCount < 2 || betCount > 5) {
    throw new Error('Bet count must be between 2 and 5');
  }
  
  if (totalDays < betCount) {
    throw new Error('Challenge duration must be at least equal to bet count');
  }
  
  const milestones = [];
  const interval = totalDays / betCount;
  
  for (let i = 1; i <= betCount; i++) {
    milestones.push(Math.round(interval * i));
  }
  
  // Ensure last milestone is exactly totalDays
  milestones[milestones.length - 1] = totalDays;
  
  return milestones;
};

/**
 * Get progress towards next bet unlock
 * @param {number} currentDay - Current streak day
 * @param {Array<Object>} betItems - Array of bet items with unlockDay
 * @returns {Object} - Progress info
 */
export const getNextBetProgress = (currentDay, betItems) => {
  const nextLockedBet = betItems.find(bet => !bet.isUnlocked && bet.unlockDay > currentDay);
  
  if (!nextLockedBet) {
    return {
      hasNext: false,
      nextUnlockDay: null,
      daysRemaining: 0,
      progress: 100
    };
  }
  
  const previousUnlockDay = betItems
    .filter(bet => bet.unlockDay < nextLockedBet.unlockDay)
    .reduce((max, bet) => Math.max(max, bet.unlockDay), 0);
  
  const rangeStart = previousUnlockDay;
  const rangeEnd = nextLockedBet.unlockDay;
  const rangeSize = rangeEnd - rangeStart;
  const currentInRange = currentDay - rangeStart;
  const progress = Math.min(100, Math.max(0, (currentInRange / rangeSize) * 100));
  
  return {
    hasNext: true,
    nextBet: nextLockedBet,
    nextUnlockDay: nextLockedBet.unlockDay,
    daysRemaining: nextLockedBet.unlockDay - currentDay,
    progress: progress
  };
};

/**
 * Format milestone display text
 * @param {number} unlockDay - Day when bet unlocks
 * @param {number} totalDays - Total challenge days
 * @returns {string} - Formatted text
 */
export const formatMilestoneText = (unlockDay, totalDays) => {
  const percentage = Math.round((unlockDay / totalDays) * 100);
  return `Day ${unlockDay} (${percentage}%)`;
};

/**
 * Get bet status emoji
 * @param {boolean} isUnlocked - Whether bet is unlocked
 * @returns {string} - Emoji
 */
export const getBetStatusEmoji = (isUnlocked) => {
  return isUnlocked ? '🎁' : '🔒';
};

/**
 * Generate bet milestone preview for creation UI
 * @param {number} duration - Challenge duration
 * @param {number} betCount - Number of bets
 * @returns {Array<Object>} - Preview data
 */
export const generateMilestonePreview = (duration, betCount) => {
  if (!duration || !betCount || betCount < 2) return [];
  
  const unlockDays = calculateBetMilestones(duration, betCount);
  
  return unlockDays.map((day, index) => ({
    milestone: index + 1,
    unlockDay: day,
    percentage: Math.round((day / duration) * 100),
    displayText: formatMilestoneText(day, duration)
  }));
};
