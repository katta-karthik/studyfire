# 🚀 StudyFire Deployment Guide - Render.com

## 🎯 Quick Start (15 Minutes Total Setup)

### Prerequisites
- GitHub account
- MongoDB Atlas account (free)
- Render.com account (free)

---

## Step 1: Setup MongoDB Database (5 min)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create FREE account
3. Create a FREE cluster (M0 tier - 512MB storage)
4. Click "Connect" → "Connect your application"
5. Copy connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
6. Save this for later!

---

## Step 2: Push Code to GitHub (2 min)

```bash
# In your project folder
git init
git add .
git commit -m "Initial commit - StudyFire app"

# Create new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/studyfire.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy Backend to Render (3 min)

1. Go to [Render.com](https://render.com)
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repo
5. Configure:
   - **Name**: `studyfire-backend`
   - **Environment**: `Node`
   - **Region**: Pick closest to you
   - **Branch**: `main`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
6. Click **"Advanced"** → Add Environment Variable:
   - **Key**: `MONGODB_URI`
   - **Value**: `YOUR_MONGODB_CONNECTION_STRING` (from Step 1)
7. Click **"Create Web Service"**
8. **COPY THE URL** (e.g., `https://studyfire-backend.onrender.com`)

---

## Step 4: Update Frontend API URL (2 min)

1. Open `src/services/api.js`
2. Change line 1 to:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'https://studyfire-backend.onrender.com/api';
```

3. Create `.env.production` file:
```env
VITE_API_URL=https://studyfire-backend.onrender.com/api
VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

4. Push to GitHub:
```bash
git add .
git commit -m "Update API URL for production"
git push
```

---

## Step 5: Deploy Frontend to Render (3 min)

1. In Render dashboard, click **"New +"** → **"Static Site"**
2. Connect same GitHub repo
3. Configure:
   - **Name**: `studyfire`
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Click **"Advanced"** → Add Environment Variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://studyfire-backend.onrender.com/api`
   - **Key**: `VITE_GEMINI_API_KEY`
   - **Value**: `YOUR_GEMINI_API_KEY`
5. Click **"Create Static Site"**

---

## ✅ Done! Your App is Live!

**Your app will be at**: `https://studyfire.onrender.com`

### 🔒 Make It Private (Optional):
In Render, go to Settings → Add custom authentication or use Cloudflare Access for free private access.

---

## 🔄 How to Update Your Live Site

**Super Easy!** Just push code to GitHub:

```bash
# Make your code changes
git add .
git commit -m "Add new feature"
git push
```

**Render auto-deploys in 2-3 minutes!** ✨

---

## 🆓 Free Tier Limits

- Backend: Spins down after 15 min inactivity (wakes in 30 sec)
- Frontend: Always instant
- MongoDB: 512MB storage (enough for years!)
- **Cost**: $0/month forever

---

## 🛠️ Troubleshooting

### Backend won't start?
- Check MongoDB URI is correct
- Check logs in Render dashboard

### Frontend shows errors?
- Check API_URL environment variable
- Check CORS settings in server.js

### Need help?
- Render has excellent docs: https://render.com/docs
- Check deployment logs in Render dashboard

---

## 🎉 Tips

1. **Auto-updates**: Every git push auto-deploys!
2. **Logs**: Check Render dashboard for errors
3. **Database**: Use MongoDB Atlas dashboard to view data
4. **Backups**: MongoDB Atlas has free backups
5. **Custom Domain**: Render allows custom domains (free)

Enjoy your private StudyFire app! 🔥
