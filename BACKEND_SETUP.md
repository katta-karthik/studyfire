# 🔥 StudyFire Backend Setup Guide

## 📋 Overview

We're building a full-stack application with:
- **Frontend**: React (already done)
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Authentication**: JWT tokens
- **Features**: User accounts, challenge sync, stats, calendar

---

## 🛠️ Step 1: Install Required Software

### A. Install Node.js (if not already installed)
1. Go to https://nodejs.org/
2. Download **LTS version** (Long Term Support)
3. Run installer, accept all defaults
4. Verify installation:
   ```bash
   node --version
   npm --version
   ```

### B. Install MongoDB

**Option 1: MongoDB Atlas (Cloud - Recommended for beginners)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a free cluster (M0 tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (we'll use it later)

**Option 2: MongoDB Local Installation**
1. Go to https://www.mongodb.com/try/download/community
2. Download MongoDB Community Server
3. Install with default settings
4. MongoDB will run on `mongodb://localhost:27017`

### C. Install Postman (for API testing)
1. Go to https://www.postman.com/downloads/
2. Download and install
3. We'll use this to test our API endpoints

---

## 📁 Step 2: Project Structure

We'll create this structure:
```
studyfire/
├── client/                 # Frontend (React - move existing files here)
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/                 # Backend (New!)
│   ├── models/            # Database models
│   ├── routes/            # API endpoints
│   ├── middleware/        # Auth, validation
│   ├── controllers/       # Business logic
│   ├── config/            # Configuration
│   └── server.js          # Entry point
│
└── package.json           # Root package.json
```

---

## 🔧 Step 3: Backend Technologies

### What We'll Use:
- **Express.js**: Web framework for Node.js
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: Secure authentication tokens
- **bcryptjs**: Password hashing
- **cors**: Allow frontend-backend communication
- **dotenv**: Environment variables

---

## 🎯 Step 4: Features to Build

### User Authentication
- ✅ Sign up with email/password
- ✅ Login with JWT token
- ✅ Logout functionality
- ✅ Protected routes

### Challenge Management
- ✅ Create challenges (saved to database)
- ✅ Get user's challenges
- ✅ Update challenge progress
- ✅ Delete challenges
- ✅ Mark days complete

### Stats & Analytics
- ✅ Total streaks across all challenges
- ✅ Total time invested
- ✅ Best streak record
- ✅ Completion rate
- ✅ Calendar view with completed days
- ✅ Monthly/weekly statistics

### Dashboard Features
- ✅ Active challenges list
- ✅ Completed challenges list
- ✅ Calendar with streak visualization
- ✅ Progress charts
- ✅ Motivational stats

---

## 📊 Database Schema

### User Model
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Challenge Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (reference to User),
  title: String,
  description: String,
  duration: Number,
  dailyTargetMinutes: Number,
  targetTime: String,
  betItem: {
    name: String,
    size: Number,
    type: String,
    uploadedAt: Date
  },
  currentStreak: Number,
  longestStreak: Number,
  completedDays: [{
    date: String,
    minutes: Number
  }],
  totalMinutes: Number,
  lastCompletedDate: Date,
  isActive: Boolean,
  isBetLocked: Boolean,
  isCompleted: Boolean,
  isBetReturned: Boolean,
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 Next Steps

I'll now create the complete backend structure for you with:
1. Server setup files
2. Database models
3. API routes
4. Authentication system
5. Integration with frontend

**Ready to proceed?** Say "yes" and I'll:
1. Create the server folder structure
2. Set up all backend files
3. Configure the database connection
4. Create API endpoints
5. Update the frontend to use the backend
6. Give you commands to run everything

---

## 📝 Quick Commands Reference

Once setup is complete, you'll use:

```bash
# Install backend dependencies
cd server
npm install

# Start backend server
npm run dev

# In another terminal, start frontend
cd client
npm run dev
```

Backend will run on: `http://localhost:5000`
Frontend will run on: `http://localhost:5173`

---

Ready to build? 🔥
