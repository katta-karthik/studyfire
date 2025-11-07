# ✅ Deployment Checklist - Quick Reference

## Before You Start
- [ ] MongoDB connection string ready
- [ ] Gemini API key ready
- [ ] Render account created (render.com)

---

## Backend Deployment

### Create Service
- [ ] Render Dashboard → New + → Web Service
- [ ] Connect repository: katta-karthik/studyfire
- [ ] Name: `studyfire-backend`
- [ ] Root Directory: `server` ⚠️
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`

### Environment Variables
- [ ] MONGODB_URI = `your_mongodb_connection_string`
- [ ] PORT = `5000`

### Verify
- [ ] Wait 3-5 minutes
- [ ] Logs show "Your service is live 🎉"
- [ ] Copy backend URL

---

## Frontend Deployment

### Create Service
- [ ] Render Dashboard → New + → Static Site
- [ ] Connect repository: katta-karthik/studyfire
- [ ] Name: `studyfire`
- [ ] Root Directory: (leave empty)
- [ ] Build Command: `npm install && npm run build`
- [ ] Publish Directory: `dist`

### Environment Variables
- [ ] VITE_API_URL = `https://your-backend-url.onrender.com/api`
- [ ] VITE_GEMINI_API_KEY = `your_gemini_api_key`

### Verify
- [ ] Wait 3-5 minutes
- [ ] Logs show "Your site is live 🎉"
- [ ] Visit frontend URL

---

## Test
- [ ] Open frontend URL
- [ ] Login: karthik / 1234
- [ ] Works? SUCCESS! 🎉

---

## If Login Fails

1. [ ] Backend service shows "Live" (green dot)?
2. [ ] Backend logs show "MongoDB connected"?
3. [ ] Frontend VITE_API_URL ends with `/api`?
4. [ ] Frontend → Manual Deploy → Clear cache & deploy

---

**Full instructions: See FRESH_DEPLOYMENT.md**
