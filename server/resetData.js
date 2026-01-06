/**
 * RESET SCRIPT - Clears all data for a fresh start
 * Run with: node resetData.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function resetAllData() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected!\n');

    const User = require('./models/User');
    const Challenge = require('./models/Challenge');
    const TimeEntry = require('./models/TimeEntry');
    const CalendarEvent = require('./models/CalendarEvent');
    const InboxTask = require('./models/InboxTask');
    const Notification = require('./models/Notification');
    const Page = require('./models/Page');
    const Project = require('./models/Project');
    const DailySchedule = require('./models/DailySchedule');

    // Find your user
    const user = await User.findOne({ username: 'karthik' });
    if (!user) {
      console.log('❌ User "karthik" not found!');
      process.exit(1);
    }

    console.log(`🎯 Resetting data for user: ${user.username} (${user._id})\n`);

    // Delete all challenges
    const challengeResult = await Challenge.deleteMany({ userId: user._id });
    console.log(`🗑️  Deleted ${challengeResult.deletedCount} challenges`);

    // Delete all time entries
    const timeResult = await TimeEntry.deleteMany({ userId: user._id });
    console.log(`🗑️  Deleted ${timeResult.deletedCount} time entries`);

    // Delete all calendar events
    const calendarResult = await CalendarEvent.deleteMany({ userId: user._id });
    console.log(`🗑️  Deleted ${calendarResult.deletedCount} calendar events`);

    // Delete all inbox tasks
    const inboxResult = await InboxTask.deleteMany({ userId: user._id });
    console.log(`🗑️  Deleted ${inboxResult.deletedCount} inbox tasks`);

    // Delete all notifications
    const notifResult = await Notification.deleteMany({ userId: user._id });
    console.log(`🗑️  Deleted ${notifResult.deletedCount} notifications`);

    // Delete all pages
    const pageResult = await Page.deleteMany({ userId: user._id });
    console.log(`🗑️  Deleted ${pageResult.deletedCount} pages`);

    // Delete all projects
    const projectResult = await Project.deleteMany({ userId: user._id });
    console.log(`🗑️  Deleted ${projectResult.deletedCount} projects`);

    // Delete all daily schedules
    const scheduleResult = await DailySchedule.deleteMany({ userId: user._id });
    console.log(`🗑️  Deleted ${scheduleResult.deletedCount} daily schedules`);

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
    console.log(`\n✨ Reset user stats to zero`);

    console.log('\n🔥🔥🔥 ALL DATA RESET! FRESH START! 🔥🔥🔥\n');
    console.log('You can now create new challenges and begin your journey!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetAllData();
