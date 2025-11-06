# 🔥 StudyFire - Discipline Through Fire

> **Gamified consistency tracker that keeps students disciplined with motivation, humor, and emotional accountability.**

![StudyFire Banner](https://img.shields.io/badge/React-18-blue) ![Vite](https://img.shields.io/badge/Vite-5-purple) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-teal) ![License](https://img.shields.io/badge/License-MIT-green)

## 🎯 What is StudyFire?

StudyFire is a unique web app that helps students and self-learners build **consistent study habits** through:
- 🔥 **Fire Streaks** - Visual tracking that makes you feel unstoppable
- ⏱️ **Real-time Timer** - No manual edits. Only honest work counts.
- 🎲 **Bet Accountability** - Risk something you care about. Break the streak = lose it forever.
- 💬 **Motivational AI** - Duolingo-style feedback that's funny, intense, and keeps you going

## ✨ Features

### 🎨 Non-Editable Challenge Creation
- Create immutable challenges (no editing after creation!)
- Set duration (e.g., 30 days, 90 days)
- Set daily target (in minutes)
- Upload a "bet" file (photo, video, document)
- Confirm with a motivational oath screen

### ⏱️ Real-Time Timer System
- Honest time tracking (no manual manipulation)
- Automatic streak calculation
- Miss one day? Streak breaks. Bet file locks. Forever.

### 🔥 Fire Streak Visualization
- Animated flame for each successful day
- Progress bars with glow effects
- Confetti celebrations at milestones
- Longest streak tracking

### 💬 Motivational Feedback
- Dynamic messages based on your progress
- Encouraging when you're doing great
- Sarcastic warnings when you're slipping
- Duolingo-style personality

### 🎮 Gamified Dashboard
- Beautiful glassmorphism UI
- Dark mode by default
- Fire/orange accent colors
- Smooth Framer Motion animations
- Stats tracking (total time, current streak, best streak)

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Open in browser**
   - Navigate to `http://localhost:5173`
   - Start creating challenges! 🔥

### Build for Production

```bash
npm run build
npm run preview
```

## 🛠️ Tech Stack

- **React 18** - Component-based UI
- **Vite** - Lightning-fast dev server & build tool
- **TailwindCSS** - Utility-first styling
- **Framer Motion** - Smooth animations & transitions
- **Lucide React** - Beautiful icon library
- **Canvas Confetti** - Celebration effects
- **localStorage** - Data persistence (no backend needed)

## 📁 Project Structure

```
studyfire/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx          # Main dashboard view
│   │   ├── ChallengeCard.jsx      # Individual challenge display
│   │   ├── ChallengeCreation.jsx  # Multi-step challenge creator
│   │   └── TimerView.jsx          # Real-time timer interface
│   ├── hooks/
│   │   └── useChallenges.js       # Challenge state management
│   ├── utils/
│   │   └── motivationalMessages.js # Dynamic message generator
│   ├── App.jsx                     # Main app component
│   ├── main.jsx                    # React entry point
│   └── index.css                   # Global styles
├── public/
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🎮 How to Use

1. **Create a Challenge**
   - Click "Create New Challenge"
   - Enter challenge title (e.g., "Study Math 2 hours daily")
   - Set duration (e.g., 30 days)
   - Set daily target (e.g., 120 minutes)
   - Upload a bet file (something you care about)
   - Take the oath and commit!

2. **Track Your Progress**
   - Click "Start Session" on any challenge
   - Timer starts counting (cannot be manually edited)
   - Work until you reach your daily target
   - Click "Complete Day" when goal is reached

3. **Build Your Streak**
   - Complete your daily target every single day
   - Watch your fire streak grow
   - Miss one day = streak breaks + bet file locks forever
   - No edits. No excuses. Only discipline.

## 🎨 Design Philosophy

- **Playful but Intense** - Serious about results, fun in approach
- **Emotional Engagement** - Every action has weight and feedback
- **Visual Motivation** - Fire, streaks, and celebrations keep you hooked
- **Accountability by Design** - Bet system creates real stakes
- **Immutable Commitment** - No editing = honest tracking

## 🔒 Key Design Decisions

### Why No Editing?
Once you create a challenge, you **cannot edit** the duration or daily target. This is intentional:
- **Builds discipline** - You commit to realistic goals upfront
- **Prevents gaming** - No lowering targets when things get tough
- **Honest tracking** - Timer cannot be manipulated

### Why Bet Files?
The bet system creates **emotional accountability**:
- Upload something meaningful (photo, video, document)
- If you break your streak, it locks forever
- Creates real stakes (even if symbolic)
- Psychological motivation to maintain consistency

## 🌟 Roadmap

- [ ] Backend integration for real file locking
- [ ] Social features (share streaks with friends)
- [ ] Leaderboards and community challenges
- [ ] Mobile app (React Native)
- [ ] Apple Watch / wearable integration
- [ ] Advanced analytics and insights
- [ ] Custom theme options

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 📄 License

MIT License - feel free to use this project however you like!

## 💡 Inspiration

StudyFire combines the best of:
- **Duolingo's** addictive streak system
- **Fitness app** psychology
- **Gaming** reward mechanisms
- **Accountability coaching** principles

## 🔥 Motivation

> "Discipline is doing what needs to be done, even when you don't want to do it."

StudyFire makes discipline visual, engaging, and (ironically) fun. Because the best way to build a habit is to make breaking it... unthinkable.

---

**Built with 🔥 by passionate developers who believe in the power of consistency.**

Start your journey today. Ignite your potential. 🚀
