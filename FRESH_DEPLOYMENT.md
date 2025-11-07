# 🔥 Fresh Deployment Guide - Start From Scratch

## 📋 What You'll Need (5 minutes to gather)

1. **MongoDB Connection String** (from MongoDB Atlas)
2. **Gemini API Key** (from Google AI Studio)
3. **GitHub Account** (already have it)
4. **Render Account** (sign up at render.com)

---

## 🗄️ Step 1: Get MongoDB Connection String (3 minutes)

1. Go to: https://cloud.mongodb.com/
2. Login to your account
3. Click your cluster (Cluster0)
4. Click **"Connect"** button
5. Click **"Connect your application"**
6. **COPY** the connection string (looks like this):
   ```
   mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. **Replace `<password>`** with your actual MongoDB password
8. **Save this string somewhere safe** - you'll need it in Step 4

**Example result:**
```
mongodb+srv://katta:YOUR_PASSWORD@cluster0.s4rai.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

---

## 🤖 Step 2: Get Gemini API Key (2 minutes)

1. Go to: https://makersuite.google.com/app/apikey
2. Login with Google account
3. Click **"Create API Key"**
4. **COPY** the API key (looks like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)
5. **Save it somewhere safe** - you'll need it in Step 5

---

## 🚀 Step 3: Sign Up for Render (1 minute)

1. Go to: https://render.com/
2. Click **"Get Started"**
3. Sign up with your **GitHub** account
4. Authorize Render to access your GitHub

---

## 🖥️ Step 4: Deploy Backend (5 minutes)

### 4.1 Create Web Service

1. In Render Dashboard, click **"New +"** button (top right)
2. Select **"Web Service"**
3. Click **"Connect account"** (if not connected)
4. Find your repository: **katta-karthik/studyfire**
5. Click **"Connect"**

### 4.2 Configure Backend Service

Fill in these fields **EXACTLY**:

| Field | Value |
|-------|-------|
| **Name** | `studyfire-backend` |
| **Region** | Choose closest to you (e.g., Oregon, Singapore, Frankfurt) |
| **Branch** | `main` |
| **Root Directory** | `server` ⚠️ **CRITICAL - Type exactly: server** |
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

### 4.3 Add Environment Variable

Scroll down to **"Environment Variables"** section:

1. Click **"Add Environment Variable"**
2. **Key**: `MONGODB_URI` (type exactly)
3. **Value**: Paste your MongoDB connection string from Step 1
4. Click **"Add Environment Variable"** again
5. **Key**: `PORT`
6. **Value**: `5000`

### 4.4 Create Service

1. Click **"Create Web Service"** button at bottom
2. **WAIT 3-5 MINUTES** for deployment
3. Watch the logs - you should see:
   ```
   ✅ MongoDB connected successfully
   🔥 Default user already exists
   🚀 Server running on port 10000
   ==> Your service is live 🎉
   ```
4. **COPY YOUR BACKEND URL** from top of page (looks like: `https://studyfire-backend-xxxx.onrender.com`)
5. **SAVE THIS URL** - you need it for Step 5!

---

## 🎨 Step 5: Deploy Frontend (5 minutes)

### 5.1 Create Static Site

1. In Render Dashboard, click **"New +"** button
2. Select **"Static Site"**
3. Find your repository: **katta-karthik/studyfire**
4. Click **"Connect"**

### 5.2 Configure Frontend Service

Fill in these fields **EXACTLY**:

| Field | Value |
|-------|-------|
| **Name** | `studyfire` |
| **Region** | Same as backend (e.g., Oregon) |
| **Branch** | `main` |
| **Root Directory** | Leave EMPTY (blank) |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

### 5.3 Add Environment Variables

Scroll down to **"Environment Variables"** section:

1. Click **"Add Environment Variable"**
2. **Key**: `VITE_API_URL`
3. **Value**: `YOUR_BACKEND_URL_FROM_STEP_4/api`
   - Example: `https://studyfire-backend-xxxx.onrender.com/api`
   - ⚠️ **MUST end with `/api`**

4. Click **"Add Environment Variable"** again
5. **Key**: `VITE_GEMINI_API_KEY`
6. **Value**: Paste your Gemini API key from Step 2

### 5.4 Create Site

1. Click **"Create Static Site"** button at bottom
2. **WAIT 3-5 MINUTES** for deployment
3. Watch the logs - you should see:
   ```
   npm run build
   ✓ built in XXXms
   ==> Your site is live 🎉
   ```
4. **COPY YOUR FRONTEND URL** from top (looks like: `https://studyfire-xxxx.onrender.com`)

---

## ✅ Step 6: Test Your App (2 minutes)

1. Click on your frontend URL or go to: `https://studyfire-xxxx.onrender.com`
2. You should see the StudyFire login page
3. Login with:
   - **Username**: `karthik`
   - **Password**: `1234`
4. If login works → **SUCCESS!** 🎉
5. If you see "Connection failed" → Continue to troubleshooting below

---

## 🐛 Troubleshooting

### ❌ "Connection failed. Make sure backend is running"

**Check these 4 things:**

1. **Backend is running?**
   - Go to Render Dashboard → studyfire-backend
   - Check if it says "Live" (green dot)
   - Click "Logs" - should show "Your service is live 🎉"

2. **MONGODB_URI is correct?**
   - Click backend service → "Environment" tab
   - Check `MONGODB_URI` value
   - Password should be correct (no `<password>` placeholder)

3. **Frontend API URL is correct?**
   - Click frontend service → "Environment" tab
   - Check `VITE_API_URL` value
   - Should match your backend URL + `/api`
   - Example: `https://studyfire-backend-abc.onrender.com/api`

4. **Frontend rebuild needed?**
   - Click frontend service
   - Click "Manual Deploy" dropdown (top right)
   - Select "Clear build cache & deploy"
   - Wait 3-5 minutes

### ❌ Backend shows "Application failed to respond"

**Fix:**
1. Click backend service → "Environment"
2. Make sure `MONGODB_URI` has NO spaces and NO `<password>` placeholder
3. Click "Manual Deploy" → "Clear build cache & deploy"

### ❌ "Cannot GET /api" in browser

**This is NORMAL!** Your backend is working. The `/api` endpoint alone shows this message, but the actual routes like `/api/auth/login` work fine.

---

## 🔄 Future Updates (After Initial Deployment)

Whenever you make code changes:

```powershell
git add .
git commit -m "Your change description"
git push origin main
```

**Both services auto-deploy in 2-3 minutes!** ✨

---

## 📝 Important Notes

### Backend Sleeping (Free Tier)
- Backend "spins down" after 15 minutes of inactivity
- First request after sleeping takes **30-50 seconds** to wake up
- This is NORMAL for Render's free tier
- Subsequent requests are instant

### Environment Variables
- NEVER commit real API keys to GitHub
- Always set them in Render's Environment Variables section
- They're encrypted and secure in Render

### Root Directory
- Backend MUST have `server` as Root Directory
- Frontend MUST have EMPTY Root Directory
- This is critical for proper deployment

---

## 🎉 Success Checklist

After completing all steps, you should have:

- ✅ Backend live at: `https://studyfire-backend-xxxx.onrender.com`
- ✅ Frontend live at: `https://studyfire-xxxx.onrender.com`
- ✅ Can login with karthik/1234
- ✅ Can create challenges
- ✅ Can start/stop timer
- ✅ Auto-deploys on git push

---

## 🆘 Still Having Issues?

If you're still stuck after troubleshooting:

1. Check backend logs: Backend service → "Logs" tab
2. Check frontend logs: Frontend service → "Logs" tab
3. Look for RED error messages
4. Share the error message and I'll help you fix it!

---

**Ready to deploy? Start with Step 1!** 🚀🔥
