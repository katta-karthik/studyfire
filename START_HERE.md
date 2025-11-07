# 🚀 START HERE - Fresh Deployment

## 🎯 Your Mission: Get StudyFire Live in 15 Minutes

**Read this first, then follow FRESH_DEPLOYMENT.md step by step!**

---

## 📁 Files You Need

### Main Guide (Follow This!)
👉 **FRESH_DEPLOYMENT.md** - Complete step-by-step instructions

### Quick Reference
👉 **DEPLOYMENT_CHECKLIST.md** - Checkbox list to track progress

---

## ⚠️ Critical Rules

### Rule 1: Root Directory Settings
- **Backend**: Root Directory = `server` (MUST type this!)
- **Frontend**: Root Directory = (leave empty/blank)

### Rule 2: Environment Variables
- **Backend needs**: `MONGODB_URI` and `PORT`
- **Frontend needs**: `VITE_API_URL` and `VITE_GEMINI_API_KEY`

### Rule 3: API URL Format
- Backend URL example: `https://studyfire-backend-abc.onrender.com`
- Frontend needs: `https://studyfire-backend-abc.onrender.com/api` ← Must add `/api`!

---

## 🎬 Deployment Order

```
Step 1: Get MongoDB Connection String
   ↓
Step 2: Get Gemini API Key
   ↓
Step 3: Sign up for Render
   ↓
Step 4: Deploy Backend (5 min)
   ↓
Step 5: Deploy Frontend (5 min)
   ↓
Step 6: Test Login (2 min)
   ↓
🎉 SUCCESS!
```

---

## 🔥 Quick Start (If You're in a Rush)

1. Open **FRESH_DEPLOYMENT.md**
2. Gather your MongoDB string and Gemini key (Steps 1-2)
3. Deploy backend (Step 4) - **Don't forget Root Directory: `server`**
4. Copy backend URL
5. Deploy frontend (Step 5) - Use backend URL + `/api`
6. Test login: karthik/1234

---

## 💡 Common Mistakes (Avoid These!)

❌ Forgetting to set Root Directory to `server` for backend
❌ Not adding `/api` to the end of VITE_API_URL
❌ Using `<password>` placeholder in MongoDB string
❌ Mixing up backend and frontend environment variables
❌ Not waiting 3-5 minutes for deployment to complete

✅ Follow the guide exactly and you'll be fine!

---

## 🆘 Need Help?

If stuck:
1. Check FRESH_DEPLOYMENT.md → Troubleshooting section
2. Check Render logs for error messages
3. Tell me what error you see and I'll help!

---

## 🎉 After Success

Once deployed:
- Your app is live 24/7
- Auto-deploys on every `git push`
- Completely free (Render free tier)
- Backend sleeps after 15 min (wakes in 30 sec)

---

**Ready? Open FRESH_DEPLOYMENT.md and let's deploy!** 🔥🚀
