# 🔥 QUICK SETUP - 3 Steps to Live App

## ✅ Already Done (Automated)
- ✅ Code pushed to GitHub
- ✅ All credentials updated
- ✅ Backend deployed at: `studyfire-backend.onrender.com`
- ✅ Frontend deployed at: `studyfire.onrender.com`

---

## 🚀 Do These 3 Things NOW:

### 1️⃣ Fix Backend (1 minute)
1. Go to: https://dashboard.render.com
2. Click: **studyfire-backend**
3. Click: **Environment** (left sidebar)
4. Add variable:
   - Key: `MONGODB_URI`
   - Value: `mongodb+srv://katta:1234@cluster0.s4rai.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
5. Click: **Save Changes**
6. Wait 2 minutes for restart

---

### 2️⃣ Fix Frontend (2 minutes)
1. In Render Dashboard, click: **studyfire**
2. Click: **Environment**
3. Add TWO variables:

**First:**
- Key: `VITE_API_URL`
- Value: `https://studyfire-backend.onrender.com/api`

**Second:**
- Key: `VITE_GEMINI_API_KEY`
- Value: `AIzaSyDL9sjZekkN5tQSSKzwl-W3bNWg-Yq_CIU`

4. Click: **Save Changes**
5. Wait 2 minutes for redeploy

---

### 3️⃣ Test Your App
1. Visit: **https://studyfire.onrender.com**
2. Login: **karthik / 1234**
3. Create a challenge and test! 🔥

---

## 🔄 Future Updates
```bash
git add .
git commit -m "Your changes"
git push origin main
```
**Auto-deploys in 2 minutes!** ✨

---

## 💡 Important
- Backend "Cannot GET /api" is **NORMAL** - it means server is running!
- First visit after 15 min inactivity takes 30 sec (free tier)
- Subsequent visits are instant

**You're almost done! Just add those environment variables!** 🚀
