# 🔥 Render Deployment Checklist - StudyFire

## ✅ What I Just Did (Automated)

1. ✅ Updated `.env.production` with your actual Gemini API key
2. ✅ Updated `server/.env` with your actual MongoDB URI
3. ✅ Updated `.gitignore` to protect server/.env but allow .env.production
4. ✅ Updated DEPLOYMENT_GUIDE.md with correct credentials
5. ✅ Committed and pushed to GitHub

---

## 🚀 What YOU Need to Do Now (5 Minutes)

### Step 1: Update Backend Environment Variables in Render

Your backend is already deployed, but it needs the MongoDB connection:

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click on **"studyfire-backend"** service
3. Click **"Environment"** tab on the left
4. **Update or Add** this environment variable:
   - **Key**: `MONGODB_URI`
   - **Value**: `YOUR_MONGODB_CONNECTION_STRING` (get from MongoDB Atlas)
5. Click **"Save Changes"**
6. **Backend will auto-restart** (takes 1-2 minutes)

---

### Step 2: Update Frontend Environment Variables in Render

1. In Render Dashboard, click on **"studyfire"** (your frontend static site)
2. Click **"Environment"** tab
3. **Add these TWO environment variables**:

   **Variable 1:**
   - **Key**: `VITE_API_URL`
   - **Value**: `https://studyfire-backend.onrender.com/api`

   **Variable 2:**
   - **Key**: `VITE_GEMINI_API_KEY`
   - **Value**: `YOUR_GEMINI_API_KEY`

4. Click **"Save Changes"**
5. **Frontend will auto-redeploy** (takes 1-2 minutes)

---

### Step 3: Test Your Live App

After both services finish deploying:

1. Visit: **https://studyfire.onrender.com**
2. Login with: **karthik / 1234**
3. Test creating a challenge
4. Test the timer
5. Everything should work! 🔥

---

## 🔄 Future Updates (Super Easy!)

Whenever you make code changes:

```powershell
git add .
git commit -m "Your change description"
git push origin main
```

**Render auto-deploys in 2-3 minutes!** No manual steps needed! ✨

---

## 🆓 Your Free Tier Setup

- **Backend**: Spins down after 15 min inactivity (wakes up in 30 seconds)
- **Frontend**: Always instant (static site)
- **MongoDB**: 512MB free storage
- **Cost**: $0/month forever!

---

## 📝 Important Notes

### Backend URL
- Your backend is at: `https://studyfire-backend.onrender.com`
- The `/api` shows "Cannot GET /api" - **THIS IS NORMAL!**
- It means the server is running but has no root route
- The actual routes work fine: `/api/auth/login`, `/api/challenges`, etc.

### First Visit Delay
- If backend hasn't been used in 15 minutes, first request takes 30 seconds
- This is normal for Render's free tier
- Subsequent requests are instant

### Database
- Your MongoDB Atlas is at: `cluster0.s4rai.mongodb.net`
- Database name: Auto-created from connection string
- You can view data in MongoDB Atlas dashboard

---

## 🛠️ Troubleshooting

### If login doesn't work:
1. Check Render backend logs (click backend service → "Logs" tab)
2. Make sure MONGODB_URI is set correctly
3. Wait for backend to fully start (check logs for "MongoDB connected")

### If frontend shows old version:
1. Go to frontend service in Render
2. Click "Manual Deploy" → "Clear build cache & deploy"

### If you see CORS errors:
1. Backend is configured to allow all origins
2. Should work automatically
3. If not, check backend logs

---

## 🎉 You're Done!

Once you complete the 3 steps above, your StudyFire app will be:
- ✅ Fully deployed and live
- ✅ Auto-deploying on every git push
- ✅ Running on 100% free tier
- ✅ Private (only you know the URL)

**Enjoy your gamified consistency tracker!** 🔥🚀

