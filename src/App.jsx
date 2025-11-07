import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, ListChecks, LogOut, User, Clock, Target } from 'lucide-react';
import Login from './components/Login';
import DashboardView from './components/DashboardView';
import ChallengesView from './components/ChallengesView';
import ChallengeCreation from './components/ChallengeCreation';
import TimerView from './components/TimerView';
import TimeTracker from './components/TimeTracker';
import CommandCenter from './components/CommandCenter';
import { useChallenges } from './hooks/useChallenges';
import { useTimer } from './contexts/TimerContext';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const { challenges, addChallenge, updateChallenge, deleteChallenge, reloadChallenges } = useChallenges(isLoggedIn);
  const { activeTimer, formattedTime } = useTimer();

  // Reload challenges when switching to dashboard
  useEffect(() => {
    if (currentView === 'dashboard' && isLoggedIn) {
      console.log('🔄 Reloading challenges for Dashboard...');
      reloadChallenges();
    }
  }, [currentView, isLoggedIn]);

  // Check if user is already logged in
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    const name = localStorage.getItem('name');
    
    if (userId && username) {
      console.log('✅ User already logged in:', username);
      setIsLoggedIn(true);
      setCurrentUser({ userId, username, name });
    }
  }, []);

  const handleLogin = (userData) => {
    console.log('🔐 Login successful!', userData);
    setIsLoggedIn(true);
    setCurrentUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('name');
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentView('dashboard');
  };

  const handleCreateChallenge = (challenge) => {
    addChallenge(challenge);
    setCurrentView('challenges'); // Go to challenges page after creating
  };

  const pageVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  };

  const pageTransition = {
    type: "spring",
    stiffness: 300,
    damping: 30
  };

  return (
    <>
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-10 w-72 h-72 bg-fire-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-focus-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow animation-delay-2000"></div>
            <div className="absolute -bottom-32 left-1/2 w-72 h-72 bg-fire-600 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow animation-delay-4000"></div>
          </div>

          <div className="relative z-10">
            {/* Top Navigation */}
            {currentView !== 'create' && currentView !== 'timer' && (
              <div className="sticky top-0 backdrop-blur-xl bg-gray-900/80 border-b border-white/10 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                  {/* Logo */}
                  <div className="text-2xl font-black bg-gradient-to-r from-fire-400 to-fire-600 bg-clip-text text-transparent">
                    StudyFire 🔥
                  </div>

                  {/* Navigation Tabs */}
                  <div className="flex items-center gap-2 bg-gray-800/50 p-1 rounded-xl">
                    <button
                      onClick={() => setCurrentView('tracker')}
                      className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition ${
                        currentView === 'tracker'
                          ? 'bg-fire-500 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Clock className="w-5 h-5" />
                      Time Tracker
                    </button>
                    <button
                      onClick={() => setCurrentView('dashboard')}
                      className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition ${
                        currentView === 'dashboard'
                          ? 'bg-fire-500 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => setCurrentView('challenges')}
                      className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition ${
                        currentView === 'challenges'
                          ? 'bg-fire-500 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <ListChecks className="w-5 h-5" />
                      Challenges
                    </button>
                    <button
                      onClick={() => setCurrentView('command')}
                      className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition ${
                        currentView === 'command'
                          ? 'bg-fire-500 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Target className="w-5 h-5" />
                      Command Center
                    </button>
                  </div>

                  {/* User Menu */}
                  <div className="flex items-center gap-3">
                    {/* Active Timer Indicator */}
                    {activeTimer && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-fire-500/20 rounded-full border border-fire-500/30">
                        <div className="w-2 h-2 bg-fire-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-fire-400 font-medium">{activeTimer.challengeTitle}</span>
                        <span className="text-sm font-mono font-bold text-fire-400">{formattedTime}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-full">
                      <User className="w-4 h-4 text-fire-400" />
                      <span className="text-white text-sm font-medium">
                        {currentUser?.name || currentUser?.username}
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-2 hover:bg-red-500/20 rounded-full transition group"
                      title="Logout"
                    >
                      <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="max-w-7xl mx-auto p-6 md:p-10">
              <AnimatePresence mode="wait">
                {currentView === 'tracker' && (
                  <motion.div
                    key="tracker"
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={pageTransition}
                  >
                    <TimeTracker />
                  </motion.div>
                )}

                {currentView === 'dashboard' && (
                  <motion.div
                    key="dashboard"
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={pageTransition}
                  >
                    <DashboardView challenges={challenges} onReload={reloadChallenges} />
                  </motion.div>
                )}

                {currentView === 'challenges' && (
                  <motion.div
                    key="challenges"
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={pageTransition}
                  >
                    <ChallengesView
                      challenges={challenges}
                      onCreateNew={() => setCurrentView('create')}
                      onDelete={deleteChallenge}
                    />
                  </motion.div>
                )}

                {currentView === 'create' && (
                  <motion.div
                    key="create"
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={pageTransition}
                  >
                    <ChallengeCreation
                      onComplete={handleCreateChallenge}
                      onCancel={() => setCurrentView('challenges')}
                    />
                  </motion.div>
                )}

                {currentView === 'command' && (
                  <motion.div
                    key="command"
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={pageTransition}
                  >
                    <CommandCenter user={{ _id: currentUser.userId, name: currentUser.name }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
