import { motion } from 'framer-motion';
import { Flame, Clock, Target, Lock, AlertTriangle, Trophy, Download, Trash2, Gift, ChevronRight } from 'lucide-react';
import { useTimer } from '../contexts/TimerContext';
import { getNextBetProgress, getBetStatusEmoji } from '../utils/betMilestones';

const ChallengeCard = ({ challenge, onDelete }) => {
  const { todayProgress } = useTimer();
  
  const progressPercentage = (challenge.currentStreak / challenge.duration) * 100;
  
  // Get today's progress for this challenge
  const challengeId = challenge._id || challenge.id;
  const todayData = todayProgress[challengeId] || {
    minutesLogged: 0,
    isCompleted: false,
    targetMinutes: challenge.dailyTargetMinutes
  };
  
  const todayCompleted = todayData.isCompleted;

  const handleDownloadBet = async (specificBet = null) => {
    try {
      const userId = localStorage.getItem('userId');
      
      // Multi-bet mode: download specific bet
      if (specificBet) {
        // Create download link from base64
        const link = document.createElement('a');
        link.href = specificBet.fileData;
        link.download = specificBet.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        alert(`🎁 Downloaded: ${specificBet.name}\n\nMilestone ${specificBet.milestone} reward claimed! Keep going! 🔥`);
        return;
      }
      
      // Single bet mode: download from backend
      const response = await fetch(`http://localhost:5000/api/challenges/${challenge._id}/download-bet?userId=${userId}`);
      
      if (!response.ok) {
        const error = await response.json();
        alert(error.message || '🔒 Bet is still locked! Complete the challenge first.');
        return;
      }
      
      const { name, type, fileData } = await response.json();
      
      // Create download link
      const link = document.createElement('a');
      link.href = fileData;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert(`🎉 Downloaded: ${name}\n\nYou EARNED this! Congratulations warrior! 🔥`);
    } catch (error) {
      console.error('Error downloading bet:', error);
      alert('Failed to download bet file. Please try again.');
    }
  };

  const getDaysRemaining = () => {
    return challenge.duration - challenge.currentStreak;
  };

  const getTimeUntilTarget = () => {
    if (!challenge.targetTime) return null;
    
    const now = new Date();
    const [hours, minutes] = challenge.targetTime.split(':');
    const target = new Date();
    target.setHours(parseInt(hours), parseInt(minutes), 0);
    
    if (target < now) {
      target.setDate(target.getDate() + 1);
    }
    
    const diff = target - now;
    const hoursRemaining = Math.floor(diff / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hoursRemaining}h ${minutesRemaining}m`;
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="glass-strong rounded-xl p-4 border border-white/10 hover:border-fire-500/50 transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-1 text-white">{challenge.title}</h3>
          <p className="text-gray-400 text-xs">{challenge.description}</p>
        </div>
        {challenge.isBetLocked && (
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            className="bg-red-500/20 rounded-full p-1.5"
          >
            <Lock className="w-4 h-4 text-red-500" />
          </motion.div>
        )}
      </div>

      {/* Streak Display */}
      <div className="flex items-center gap-1.5 mb-3">
        {[...Array(Math.min(challenge.currentStreak, 30))].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="animate-flame"
          >
            <Flame className="w-3.5 h-3.5 text-fire-500 fill-fire-500" />
          </motion.div>
        ))}
        {challenge.currentStreak > 30 && (
          <span className="text-fire-500 font-bold text-sm">+{challenge.currentStreak - 30}</span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-gray-400">Progress</span>
          <span className="text-fire-500 font-bold">
            {challenge.currentStreak} / {challenge.duration} days
          </span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-fire-600 to-fire-400 rounded-full relative"
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </motion.div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="glass rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Target className="w-3.5 h-3.5 text-focus-500" />
            <span className="text-xs text-gray-400">Daily Target</span>
          </div>
          <p className="text-base font-bold text-focus-500">
            {challenge.dailyTargetMinutes} min
          </p>
        </div>

        <div className="glass rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Clock className="w-3.5 h-3.5 text-yellow-500" />
            <span className="text-xs text-gray-400">Today's Progress</span>
          </div>
          <p className="text-base font-bold text-yellow-500">
            {todayData.minutesLogged} / {todayData.targetMinutes} min
          </p>
        </div>
      </div>

      {/* NEW: Safe Days Counter */}
      {challenge.safeDaysTotal > 0 && (
        <div className="glass-strong rounded-lg p-2.5 mb-3 border border-yellow-500/30 bg-yellow-900/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚡</span>
              <span className="text-xs text-gray-400">Safe Days</span>
            </div>
            <p className="text-base font-bold text-yellow-500">
              {challenge.safeDaysRemaining || 0} / {challenge.safeDaysTotal}
            </p>
          </div>
          {challenge.safeDaysRemaining === 0 && (
            <p className="text-xs text-fire-400 mt-1">
              ⚠️ No safe days left! Next miss = BET BURNS!
            </p>
          )}
        </div>
      )}

      {/* Bet Item - Single Mode */}
      {challenge.betMode === 'single' && challenge.betItem && (
        <div className={`glass rounded-lg p-2.5 mb-3 border ${
          challenge.isBetReturned && challenge.isCompleted
            ? 'border-green-500/50 bg-green-500/10' 
            : challenge.isBetLocked 
            ? 'border-red-500/30 bg-red-500/5' 
            : 'border-red-500/30'
        }`}>
          <div className="flex items-center gap-1.5 mb-0.5">
            {challenge.isBetReturned && challenge.isCompleted ? (
              <>
                <Trophy className="w-3.5 h-3.5 text-green-500" />
                <span className="text-xs text-green-400 font-bold">✓ BET UNLOCKED!</span>
              </>
            ) : challenge.hasFailed ? (
              <>
                <Lock className="w-3.5 h-3.5 text-red-500" />
                <span className="text-xs text-red-400 font-bold">💀 BET DELETED</span>
              </>
            ) : challenge.isBetLocked ? (
              <>
                <Lock className="w-3.5 h-3.5 text-red-500" />
                <span className="text-xs text-red-400 font-bold">🔒 BET LOCKED</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                <span className="text-xs text-red-400 font-bold">BET AT STAKE</span>
              </>
            )}
          </div>
          <p className="text-xs text-white truncate">{challenge.betItem.name}</p>
          {challenge.isBetReturned && challenge.isCompleted && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownloadBet}
              className="mt-1.5 w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg py-1.5 px-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Download Your Bet
            </motion.button>
          )}
          {challenge.hasFailed && (
            <p className="text-xs text-red-500 mt-0.5">
              File deleted permanently. You had your chance. 💀
            </p>
          )}
        </div>
      )}

      {/* 🎮 Multi-Bet Progression - GAMIFIED! */}
      {challenge.betMode === 'multi' && challenge.betItems && challenge.betItems.length > 0 && (
        <div className="glass rounded-lg p-3 mb-3 border border-purple-500/30 bg-purple-500/5">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-purple-400 font-bold">
              🎮 MILESTONE REWARDS ({challenge.betItems.filter(b => b.isUnlocked).length}/{challenge.betItems.length} UNLOCKED)
            </span>
          </div>

          {/* Bet Items List */}
          <div className="space-y-1.5 mb-2">
            {challenge.betItems.map((bet, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex items-center gap-2 p-2 rounded-lg transition-all ${
                  bet.isUnlocked
                    ? 'bg-green-500/10 border border-green-500/30'
                    : challenge.currentStreak >= bet.unlockDay * 0.8
                    ? 'bg-purple-500/10 border border-purple-500/30 animate-pulse-subtle'
                    : 'bg-gray-800/30 border border-gray-700/30'
                }`}
              >
                <div className="text-lg">
                  {bet.isUnlocked ? '🎁' : '🔒'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xs font-bold text-white">
                      Bet {bet.milestone}
                    </span>
                    <span className={`text-xs ${
                      bet.isUnlocked ? 'text-green-400' : 'text-purple-400'
                    }`}>
                      Day {bet.unlockDay}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{bet.name}</p>
                </div>
                <div>
                  {bet.isUnlocked ? (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDownloadBet(bet)}
                      className="p-1.5 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition"
                      title="Download unlocked bet!"
                    >
                      <Download className="w-3.5 h-3.5 text-green-400" />
                    </motion.button>
                  ) : (
                    <div className="text-xs text-gray-500">
                      {bet.unlockDay - challenge.currentStreak}d
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Next Bet Progress Bar */}
          {(() => {
            const progress = getNextBetProgress(challenge.currentStreak, challenge.betItems);
            return progress.hasNext ? (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-purple-400 font-bold">
                    Next unlock in {progress.daysRemaining} days
                  </span>
                  <span className="text-xs text-purple-400">
                    {Math.round(progress.progress)}%
                  </span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress.progress}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-1">
                <span className="text-xs text-green-400 font-bold">
                  🎉 ALL BETS UNLOCKED! Download them all!
                </span>
              </div>
            );
          })()}
        </div>
      )}

      {/* Target Time with strict warning */}
      {challenge.startTimeRequired && challenge.scheduledStartTime && (
        <div className="glass rounded-lg p-2.5 mb-3 border border-fire-500/30 bg-fire-500/5">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Clock className="w-3.5 h-3.5 text-fire-500" />
            <span className="text-xs text-fire-400 font-bold">⏰ STRICT TIME ENFORCEMENT</span>
          </div>
          <p className="text-xs text-white">
            Start Window: {challenge.scheduledStartTime} - {
              (() => {
                const [h, m] = challenge.scheduledStartTime.split(':').map(Number);
                const end = new Date();
                end.setHours(h, m + 10, 0, 0);
                return end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
              })()
            }
          </p>
          <p className="text-xs text-red-400 mt-0.5">
            Miss this window = FAILED STRIKE 💀
          </p>
        </div>
      )}

      {/* Status Display (No Timer - Use Time Tracker Instead) */}
      <div className="mb-3">
        {challenge.hasFailed ? (
          <div className="bg-red-500/20 text-red-400 rounded-lg py-2.5 px-4 font-bold flex items-center justify-center gap-2 border border-red-500/30">
            <Lock className="w-4 h-4" />
            Challenge Failed 💀
          </div>
        ) : challenge.isCompleted ? (
          <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-white rounded-lg py-2.5 px-4 font-bold flex items-center justify-center gap-2">
            <Trophy className="w-4 h-4" />
            Challenge Completed! 🎉
          </div>
        ) : todayCompleted ? (
          <div className="bg-green-500/20 text-green-400 rounded-lg py-2.5 px-4 font-bold flex items-center justify-center gap-2 border border-green-500/30">
            <Flame className="w-4 h-4" />
            Today's Goal Completed! 🔥
          </div>
        ) : (
          <div className="bg-gray-700/30 text-gray-400 rounded-lg py-2.5 px-4 font-medium flex items-center justify-center gap-2 border border-gray-600/30">
            <Clock className="w-4 h-4" />
            Use Time Tracker to log time
          </div>
        )}
      </div>

      {challenge.hasFailed && challenge.failedDates && challenge.failedDates.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-center text-xs text-red-400 bg-red-500/10 rounded-lg p-1.5"
        >
          💀 Failed: {challenge.failedDates[challenge.failedDates.length - 1].reason}
        </motion.div>
      )}

      {challenge.isBetLocked && !challenge.isCompleted && !challenge.hasFailed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-center text-xs text-red-400"
        >
          🔒 Bet locked until completion
        </motion.div>
      )}

      {/* Delete Button */}
      {!challenge.hasFailed && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={async (e) => {
            e.stopPropagation();
            if (confirm(`🔥 Delete "${challenge.title}"?\n\nThis action cannot be undone!`)) {
              const result = await onDelete?.(challenge._id || challenge.id);
              
              // Check if delete was blocked
              if (result && result.blocked) {
                const details = result.details || {};
                alert(`❌ Cannot Delete Challenge!\n\n${result.reason}\n\n⏰ Delete Deadline: Challenges can only be deleted within 24 hours of creation.\n\nCreated: ${details.hoursSinceCreation || 'N/A'} hours ago\n\n💡 After 24 hours, you must complete the challenge or let it fail. No escape! 🔥`);
              }
            }
          }}
          className="w-full mt-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg py-2 px-3 text-xs font-medium flex items-center justify-center gap-1.5 transition-all border border-red-500/30"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </motion.button>
      )}
    </motion.div>
  );
};

export default ChallengeCard;
