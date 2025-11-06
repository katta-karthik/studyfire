// Dashboard motivational messages based on streak and active challenges
export const getMotivationalMessage = (totalStreak, activeChallenges) => {
  if (activeChallenges === 0) {
    return "🔥 Ready to ignite your first challenge? Your future self is waiting...";
  }

  if (totalStreak === 0) {
    return "🎯 Day 1 is the hardest. But you got this. Start now, regret nothing.";
  }

  if (totalStreak === 1) {
    return "🔥 ONE day down! The fire has been lit. Don't let it die now.";
  }

  if (totalStreak < 7) {
    return `💪 ${totalStreak} days! The habit is forming. Your bet file is watching nervously...`;
  }

  if (totalStreak === 7) {
    return "🎉 WEEK ONE COMPLETE! You're officially in the top 10% who make it this far!";
  }

  if (totalStreak < 14) {
    return `🔥 ${totalStreak} days of pure fire! Consistency is your superpower now.`;
  }

  if (totalStreak === 14) {
    return "🏆 TWO WEEKS! Your brain is literally rewiring itself. Science fears your dedication.";
  }

  if (totalStreak === 21) {
    return "⚡ 21 DAYS! Habit formation complete. You're no longer human, you're a machine.";
  }

  if (totalStreak < 30) {
    return `🚀 ${totalStreak} days! At this point, missing a day would hurt YOU more than losing the bet.`;
  }

  if (totalStreak === 30) {
    return "👑 ONE MONTH STRAIGHT. You're a legend. Your bet file is safe. Your discipline? Immortal.";
  }

  if (totalStreak < 60) {
    return `🔥 ${totalStreak} days and counting. Discipline is no longer a choice, it's your identity.`;
  }

  if (totalStreak === 60) {
    return "💎 60 DAYS! Diamond hands. Diamond mind. Unbreakable.";
  }

  if (totalStreak === 90) {
    return "🌟 90-DAY WARRIOR! Transformation complete. You're the 1% now.";
  }

  if (totalStreak < 100) {
    return `🔥 ${totalStreak} days of relentless consistency. Legends are made like this.`;
  }

  if (totalStreak === 100) {
    return "🏆 CENTURY! 100 DAYS! If dedication was a person, it would bow to YOU.";
  }

  return `🔥 ${totalStreak} days and unstoppable. The fire within you burns eternal.`;
};

// Session motivational messages based on progress
export const getSessionMessage = (progressPercentage, isGoalReached) => {
  if (isGoalReached) {
    return "🏆 GOAL CRUSHED! You can stop now... or keep going like the legend you are! 🔥";
  }

  if (progressPercentage === 0) {
    return "⏱️ The clock is ticking. Your bet file is trembling. Time to move.";
  }

  if (progressPercentage < 10) {
    return "🔥 Every second counts. Your future self is cheering for present you!";
  }

  if (progressPercentage < 25) {
    return "💪 Getting started is half the battle. You're already winning.";
  }

  if (progressPercentage < 50) {
    return "⚡ Momentum building! The streak lives to see another day!";
  }

  if (progressPercentage < 75) {
    return "🚀 Over halfway! Your bet file is sighing with relief...";
  }

  if (progressPercentage < 90) {
    return "🔥 So close! Don't you dare stop now. The finish line is RIGHT THERE!";
  }

  if (progressPercentage < 100) {
    return "💎 Almost there! Seconds away from another victory. PUSH!";
  }

  return "🏆 GOAL REACHED! Another day, another win! 🔥";
};

// Streak milestone messages
export const getStreakMilestoneMessage = (streak) => {
  const milestones = {
    1: "🔥 Day 1 complete! The journey begins!",
    3: "💪 3-day streak! Consistency is building!",
    7: "🎉 WEEK DONE! You're in the top 10%!",
    14: "🏆 TWO WEEKS! Unstoppable!",
    21: "⚡ 21 DAYS! Habit formed! You're a machine now!",
    30: "👑 ONE MONTH! LEGENDARY!",
    50: "💎 50 DAYS! Diamond discipline!",
    60: "🔥 60-day warrior! Unbreakable!",
    90: "🌟 90 DAYS! Transformation complete!",
    100: "🏆 CENTURY! 100 days of pure fire!"
  };

  return milestones[streak] || `🔥 ${streak} days! You're on fire!`;
};

// Warning messages when streak is at risk
export const getWarningMessage = (hoursUntilDeadline) => {
  if (hoursUntilDeadline <= 1) {
    return "🚨 LESS THAN 1 HOUR LEFT! Your bet file is writing its last will! MOVE NOW!";
  }

  if (hoursUntilDeadline <= 3) {
    return "⚠️ Only 3 hours left today! Your streak is sweating bullets! Get to work!";
  }

  if (hoursUntilDeadline <= 6) {
    return "⏰ 6 hours remaining! The clock doesn't care about your excuses!";
  }

  if (hoursUntilDeadline <= 12) {
    return "🔔 Half a day left! Don't let it slip away! Your bet file is watching!";
  }

  return "✅ Plenty of time today! But don't get too comfortable...";
};

// Challenge completion messages
export const getChallengeCompletionMessage = (challengeName, duration) => {
  return `🏆 CHALLENGE COMPLETED! ${duration} days of ${challengeName}! You've proven that discipline conquers all. Your bet file is safe, and your transformation is complete. Time to set an even bigger goal! 🔥`;
};

// Bet locked messages (when streak breaks)
export const getBetLockedMessage = (betFileName) => {
  return `🔒 STREAK BROKEN. ${betFileName} is now locked forever. This is the cost of broken promises. Let this pain fuel your next attempt. Rise again, stronger. 🔥`;
};
