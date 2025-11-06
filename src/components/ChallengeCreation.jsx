import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Flame, Upload, AlertTriangle, Check, Gift, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateMilestonePreview } from '../utils/betMilestones';

const ChallengeCreation = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 30,
    dailyTargetMinutes: 60,
    startTimeRequired: false,
    scheduledStartTime: '',
    safeDaysTotal: 0, // NEW: Safe days (lifelines)
    betMode: 'single', // 'single' or 'multi'
    totalBets: 1, // 1 for single, 2-5 for multi
    betItem: null, // Legacy single bet
    betItems: [], // Multi-bet array
  });

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Convert file to base64 for database storage
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          betItem: {
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString(),
            fileData: reader.result // Base64 string
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // 🎮 Multi-bet file upload handler
  const handleMultiBetUpload = (e, milestoneIndex) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const milestones = generateMilestonePreview(formData.duration, formData.totalBets);
        const milestone = milestones[milestoneIndex];
        
        setFormData(prev => {
          const newBetItems = [...prev.betItems];
          newBetItems[milestoneIndex] = {
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString(),
            fileData: reader.result,
            milestone: milestone.milestone,
            unlockDay: milestone.unlockDay,
            isUnlocked: false,
            unlockedAt: null
          };
          return { ...prev, betItems: newBetItems };
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    // Fire confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f97316', '#ea580c', '#fb923c']
    });

    setTimeout(() => {
      onComplete(formData);
    }, 500);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.title.trim().length > 0;
      case 2:
        return formData.duration > 0 && formData.dailyTargetMinutes > 0;
      case 3:
        if (formData.betMode === 'single') {
          return formData.betItem !== null;
        } else {
          // Multi-bet: all bets must be uploaded
          return formData.betItems.length === formData.totalBets && 
                 formData.betItems.every(bet => bet && bet.fileData);
        }
      case 4:
        return true;
      default:
        return false;
    }
  };

  const stepVariants = {
    initial: { x: 50, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-strong rounded-3xl p-8 md:p-12 max-w-2xl w-full border border-white/10"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onCancel}
            className="glass rounded-full p-3 hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-fire-500" />
            <span className="text-sm text-gray-400">Step {step} of 4</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-800 rounded-full h-2 mb-8">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(step / 4) * 100}%` }}
            transition={{ duration: 0.3 }}
            className="h-full bg-fire-gradient rounded-full"
          />
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl font-bold mb-2">What's your challenge?</h2>
                <p className="text-gray-400">Give it a powerful name that scares you a little.</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Challenge Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Master Calculus, Meditate Daily, Code 5 Hours"
                  className="w-full glass rounded-xl px-4 py-3 bg-gray-800/50 border border-white/10 focus:border-fire-500 focus:outline-none transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description (optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Why is this important to you?"
                  rows={3}
                  className="w-full glass rounded-xl px-4 py-3 bg-gray-800/50 border border-white/10 focus:border-fire-500 focus:outline-none transition-all resize-none"
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl font-bold mb-2">Set your commitment</h2>
                <p className="text-gray-400">Once set, these cannot be changed. Ever.</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Challenge Duration (days) *
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                  min="1"
                  max="365"
                  className="w-full glass rounded-xl px-4 py-3 bg-gray-800/50 border border-white/10 focus:border-fire-500 focus:outline-none transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: 21 days (habit formation), 30 days, or 90 days (transformation)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Daily Target (minutes) *
                </label>
                <input
                  type="number"
                  value={formData.dailyTargetMinutes}
                  onChange={(e) => setFormData(prev => ({ ...prev, dailyTargetMinutes: parseInt(e.target.value) || 0 }))}
                  min="1"
                  max="1440"
                  className="w-full glass rounded-xl px-4 py-3 bg-gray-800/50 border border-white/10 focus:border-fire-500 focus:outline-none transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This is your daily minimum. No excuses.
                </p>
              </div>

              {/* NEW: Safe Days */}
              <div className="glass-strong rounded-xl p-4 border border-yellow-500/30 bg-yellow-900/10">
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  ⚡ Safe Days (Lifelines)
                  <span className="text-xs text-yellow-400 font-normal">(0-5)</span>
                </label>
                <input
                  type="number"
                  value={formData.safeDaysTotal}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setFormData(prev => ({ ...prev, safeDaysTotal: Math.max(0, Math.min(5, value)) }));
                  }}
                  min="0"
                  max="5"
                  className="w-full glass rounded-xl px-4 py-3 bg-gray-800/50 border border-yellow-500/30 focus:border-yellow-500 focus:outline-none transition-all"
                />
                <p className="text-xs text-yellow-400 mt-2">
                  💡 If you miss a day, use a Safe Day instead of losing your streak!
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Safe Day emoji: ⚡ (survived) | Normal day emoji: 🔥 (crushed it)
                </p>
                <p className="text-xs text-fire-400 mt-1">
                  ⚠️ When Safe Days = 0, next miss = BET BURNS!
                </p>
              </div>

              <div className="glass-strong rounded-xl p-4 border border-fire-500/30">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium">
                    🔒 STRICT Start Time (optional but ENFORCED)
                  </label>
                  <input
                    type="checkbox"
                    checked={formData.startTimeRequired}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      startTimeRequired: e.target.checked,
                      scheduledStartTime: e.target.checked ? prev.scheduledStartTime : ''
                    }))}
                    className="w-5 h-5 rounded accent-fire-500"
                  />
                </div>
                
                {formData.startTimeRequired && (
                  <div>
                    <input
                      type="time"
                      value={formData.scheduledStartTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduledStartTime: e.target.value }))}
                      className="w-full glass rounded-xl px-4 py-3 bg-gray-800/50 border border-fire-500/50 focus:border-fire-500 focus:outline-none transition-all"
                      required={formData.startTimeRequired}
                    />
                    <p className="text-xs text-fire-400 mt-2">
                      ⚠️ You MUST start within this time + 10 min buffer. Late = FAILED STRIKE.
                    </p>
                  </div>
                )}
                
                {!formData.startTimeRequired && (
                  <p className="text-xs text-gray-500">
                    Without strict time: Start anytime but MUST complete {formData.dailyTargetMinutes} minutes.
                  </p>
                )}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="glass-strong rounded-xl p-4 border border-red-500/30"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-400 font-bold text-sm mb-1">⚠️ IMMUTABLE WARNING</p>
                    <p className="text-gray-400 text-sm">
                      These settings cannot be edited after creation. Choose wisely or face the consequences.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl font-bold mb-2">🎮 The Bet</h2>
                <p className="text-gray-400">Risk something you care about. No bet, no accountability.</p>
              </div>

              {/* Bet Mode Toggle */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFormData(prev => ({ ...prev, betMode: 'single', totalBets: 1, betItems: [] }))}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    formData.betMode === 'single'
                      ? 'bg-fire-500/20 border-fire-500 shadow-lg shadow-fire-500/20'
                      : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-5 h-5 text-fire-400" />
                    <span className="font-bold text-white">Single Bet</span>
                  </div>
                  <p className="text-xs text-gray-400">One bet for entire challenge</p>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFormData(prev => ({ ...prev, betMode: 'multi', totalBets: 2, betItem: null }))}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    formData.betMode === 'multi'
                      ? 'bg-purple-500/20 border-purple-500 shadow-lg shadow-purple-500/20'
                      : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-5 h-5 text-purple-400" />
                    <span className="font-bold text-white">Multi-Bet 🎁</span>
                  </div>
                  <p className="text-xs text-gray-400">Unlock rewards at milestones!</p>
                </motion.button>
              </div>

              {/* SINGLE BET MODE */}
              {formData.betMode === 'single' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="glass rounded-xl p-6 border-2 border-dashed border-fire-500/50">
                    <input
                      type="file"
                      id="betFile"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="betFile"
                      className="cursor-pointer flex flex-col items-center justify-center py-8"
                    >
                      {formData.betItem ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-center"
                        >
                          <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
                          <p className="text-lg font-bold text-white mb-1">{formData.betItem.name}</p>
                          <p className="text-sm text-gray-400">
                            {(formData.betItem.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <p className="text-xs text-green-400 mt-2">✓ Bet secured</p>
                        </motion.div>
                      ) : (
                        <>
                          <Upload className="w-12 h-12 text-fire-500 mb-4" />
                          <p className="text-lg font-bold text-fire-500 mb-2">Upload Your Bet</p>
                          <p className="text-sm text-gray-400">
                            Photo, video, document - anything precious
                          </p>
                        </>
                      )}
                    </label>
                  </div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="glass-strong rounded-xl p-4 border border-red-500/30"
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-red-400 font-bold text-sm mb-1">🔒 BET LOCKDOWN</p>
                        <p className="text-gray-400 text-sm">
                          This file is LOCKED in database. You CANNOT download it until you COMPLETE the entire challenge. 
                          Fail even ONCE = File DELETED FOREVER. No mercy.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* MULTI-BET MODE */}
              {formData.betMode === 'multi' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Bet Count Selector */}
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">
                      How many milestone rewards? 🎁
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[2, 3, 4, 5].map(count => (
                        <motion.button
                          key={count}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setFormData(prev => ({ ...prev, totalBets: count, betItems: [] }))}
                          className={`p-3 rounded-lg font-bold transition-all ${
                            formData.totalBets === count
                              ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                          }`}
                        >
                          {count} Bets
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Milestone Preview */}
                  {formData.totalBets > 1 && (
                    <div className="glass-strong rounded-xl p-4 border border-purple-500/30">
                      <p className="text-sm font-bold text-purple-400 mb-3">📊 Unlock Schedule:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {generateMilestonePreview(formData.duration, formData.totalBets).map((milestone, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs">
                            <Gift className="w-4 h-4 text-purple-400" />
                            <span className="text-gray-300">
                              Bet {milestone.milestone}: <span className="text-purple-400 font-bold">{milestone.displayText}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Multi-Bet Upload Slots */}
                  <div className="space-y-3">
                    {generateMilestonePreview(formData.duration, formData.totalBets).map((milestone, idx) => {
                      const bet = formData.betItems[idx];
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="glass rounded-xl p-4 border border-purple-500/30"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Gift className="w-5 h-5 text-purple-400" />
                              <span className="font-bold text-white">Bet {milestone.milestone}</span>
                              <span className="text-xs text-purple-400">
                                (Unlocks on {milestone.displayText})
                              </span>
                            </div>
                          </div>

                          <input
                            type="file"
                            id={`multiBetFile-${idx}`}
                            onChange={(e) => handleMultiBetUpload(e, idx)}
                            className="hidden"
                          />
                          <label
                            htmlFor={`multiBetFile-${idx}`}
                            className="cursor-pointer flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition"
                          >
                            {bet ? (
                              <>
                                <Check className="w-6 h-6 text-green-500 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-white truncate">{bet.name}</p>
                                  <p className="text-xs text-gray-400">
                                    {(bet.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                                <span className="text-xs text-green-400 font-bold">✓ Ready</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-6 h-6 text-purple-400 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-sm font-bold text-purple-400">Upload Bet {milestone.milestone}</p>
                                  <p className="text-xs text-gray-500">Click to choose file</p>
                                </div>
                              </>
                            )}
                          </label>
                        </motion.div>
                      );
                    })}
                  </div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass-strong rounded-xl p-4 border border-purple-500/30"
                  >
                    <div className="flex items-start gap-3">
                      <Gift className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-purple-400 font-bold text-sm mb-1">🎮 GAMIFIED REWARDS</p>
                        <p className="text-gray-400 text-sm">
                          Reach each milestone to unlock your bets! Fail before a milestone = ALL BETS LOCKED FOREVER. 
                          Complete challenge = Unlock ALL remaining bets! 🎁
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-6"
            >
              <div className="text-center">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity
                  }}
                  className="inline-block mb-4"
                >
                  <Flame className="w-20 h-20 text-fire-500 fill-fire-500" />
                </motion.div>
                <h2 className="text-3xl font-bold mb-2">The Oath</h2>
                <p className="text-gray-400">Read this. Mean it. Live it.</p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-strong rounded-2xl p-8 border border-fire-500/30 space-y-4"
              >
                <p className="text-lg leading-relaxed">
                  <span className="text-fire-500 font-bold">I solemnly swear</span> to complete{' '}
                  <span className="text-fire-400 font-bold">{formData.title}</span> for{' '}
                  <span className="text-fire-400 font-bold">{formData.duration} consecutive days</span>,
                  investing at least{' '}
                  <span className="text-fire-400 font-bold">{formData.dailyTargetMinutes} minutes</span>{' '}
                  each day
                  {formData.startTimeRequired && (
                    <>
                      {' '}starting at{' '}
                      <span className="text-fire-400 font-bold">{formData.scheduledStartTime}</span>
                      {' '}(+10 min buffer)
                    </>
                  )}.
                </p>

                <p className="text-lg leading-relaxed">
                  I understand that my {formData.betMode === 'multi' ? (
                    <>
                      <span className="text-purple-400 font-bold">{formData.totalBets} milestone bets</span> are
                    </>
                  ) : (
                    <>
                      bet <span className="text-red-400 font-bold">{formData.betItem?.name}</span> is
                    </>
                  )}{' '}
                  <span className="text-red-500 font-bold">LOCKED in the database</span> and I{' '}
                  <span className="text-red-500 font-bold">CANNOT access {formData.betMode === 'multi' ? 'them' : 'it'}</span>{' '}
                  {formData.betMode === 'multi' ? 'until I reach each milestone' : 'until I complete ALL ' + formData.duration + ' days'}.
                </p>

                {formData.betMode === 'multi' && (
                  <p className="text-lg leading-relaxed text-purple-300">
                    Each bet unlocks at its milestone. Reach the milestone = Unlock the bet! 🎁 
                    Complete the entire challenge = Unlock ALL remaining bets!
                  </p>
                )}

                <p className="text-lg leading-relaxed">
                  If I fail {formData.startTimeRequired ? '(miss time window or daily target)' : '(miss daily target)'},{' '}
                  {formData.betMode === 'multi' ? (
                    <>ALL unlocked AND locked bets will be </>
                  ) : (
                    <>the file will be </>
                  )}
                  <span className="text-red-500 font-bold">PERMANENTLY DELETED</span>.{' '}
                  No downloads. No second chances.
                </p>

                <p className="text-lg leading-relaxed">
                  I accept that <span className="text-yellow-500 font-bold">there are no edits</span>,{' '}
                  <span className="text-yellow-500 font-bold">no excuses</span>, and{' '}
                  <span className="text-yellow-500 font-bold">no second chances</span>.
                </p>

                <p className="text-xl font-bold text-center mt-6 text-fire-500">
                  🔥 Discipline through fire. Consistency through fear. 🔥
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center text-sm text-gray-500"
              >
                By proceeding, you accept these terms. There's no turning back.
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
            className="glass rounded-xl px-6 py-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
          >
            Back
          </motion.button>

          {step < 4 ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              className="bg-fire-gradient rounded-xl px-8 py-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-fire-500/50 transition-all flex items-center gap-2"
            >
              Next
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              className="bg-fire-gradient rounded-xl px-8 py-3 font-bold hover:shadow-lg hover:shadow-fire-500/50 transition-all flex items-center gap-2"
            >
              <Flame className="w-5 h-5" />
              Ignite Challenge
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ChallengeCreation;
