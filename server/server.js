require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware - CORS with explicit configuration
app.use(cors({
  origin: '*', // Allow all origins for development
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Increase body size limit to 50MB for bet files (images stored as base64)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Handle preflight requests for all routes
app.options('*', cors());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// MongoDB Connection with better error handling
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of 30s
  socketTimeoutMS: 45000,
})
  .then(async () => {
    console.log('✅ MongoDB connected successfully');
    
    // Initialize default user (karthik/1234) if not exists
    const User = require('./models/User');
    const existingUser = await User.findOne({ username: 'karthik' });
    
    if (!existingUser) {
      const defaultUser = new User({
        username: 'karthik',
        password: '1234',
        name: 'Karthik'
      });
      await defaultUser.save();
      console.log('🔐 Default user created: karthik / 1234');
    } else {
      console.log('✅ Default user already exists');
    }
    
    console.log('🔥 StudyFire backend is ready!');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('⚠️  Backend running in degraded mode - database unavailable');
    console.error('💡 Check your internet connection and MongoDB Atlas status');
  });

// Handle MongoDB connection errors after initial connection
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected successfully');
});

// Routes
const challengeRoutes = require('./routes/challenges');
const authRoutes = require('./routes/auth');
const timeEntryRoutes = require('./routes/timeEntries');
const pageRoutes = require('./routes/pages');
const calendarRoutes = require('./routes/calendar');
const plannerRoutes = require('./routes/planner');
const inboxRoutes = require('./routes/inbox');
const notificationRoutes = require('./routes/notifications');

app.use('/api/challenges', challengeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/time-entries', timeEntryRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/inbox', inboxRoutes);
app.use('/api/notifications', notificationRoutes);

// 🔥 RESET ENDPOINT - DELETE THIS AFTER USE! 🔥
app.post('/api/reset-all-data', async (req, res) => {
  try {
    const { userId, confirmReset } = req.body;
    
    if (confirmReset !== 'RESET_EVERYTHING') {
      return res.status(400).json({ error: 'Confirmation required. Send confirmReset: "RESET_EVERYTHING"' });
    }
    
    const User = require('./models/User');
    const Challenge = require('./models/Challenge');
    const TimeEntry = require('./models/TimeEntry');
    const CalendarEvent = require('./models/CalendarEvent');
    const InboxTask = require('./models/InboxTask');
    const Notification = require('./models/Notification');
    const Page = require('./models/Page');
    const Project = require('./models/Project');
    const DailySchedule = require('./models/DailySchedule');
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Delete all user data
    const results = {
      challenges: (await Challenge.deleteMany({ userId })).deletedCount,
      timeEntries: (await TimeEntry.deleteMany({ userId })).deletedCount,
      calendarEvents: (await CalendarEvent.deleteMany({ userId })).deletedCount,
      inboxTasks: (await InboxTask.deleteMany({ userId })).deletedCount,
      notifications: (await Notification.deleteMany({ userId })).deletedCount,
      pages: (await Page.deleteMany({ userId })).deletedCount,
      projects: (await Project.deleteMany({ userId })).deletedCount,
      dailySchedules: (await DailySchedule.deleteMany({ userId })).deletedCount,
    };
    
    // Reset user stats
    user.overallStreak = 0;
    user.longestOverallStreak = 0;
    user.lastOverallStreakDate = null;
    user.streakShields = 0;
    user.lastShieldEarnedAt = null;
    user.streakShieldsUsed = [];
    user.totalTimeWorked = 0;
    user.lastActiveDate = null;
    await user.save();
    
    res.json({ 
      success: true, 
      message: '🔥 ALL DATA RESET! Fresh start!',
      deleted: results 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'StudyFire API is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'StudyFire API',
    version: '2.0.0',
    endpoints: {
      health: '/api/health',
      challenges: '/api/challenges',
      auth: '/api/auth',
      timeEntries: '/api/time-entries',
      pages: '/api/pages',
      calendar: '/api/calendar',
      planner: '/api/planner',
      inbox: '/api/inbox',
      notifications: '/api/notifications'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API available at http://localhost:${PORT}`);
  console.log(`💾 Database: MongoDB Atlas`);
});
