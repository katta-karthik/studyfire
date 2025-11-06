# 🐛 Troubleshooting Guide

## ❌ Issue: Progress Not Saving After Refresh

### ✅ **I Just Fixed:**
- Updated Dashboard to use `challenge._id` (MongoDB ID) instead of `challenge.id`
- This was causing issues with updates

---

## 🔍 **Let's Debug Together:**

### **Step 1: Check if Backend is Running**

In the terminal where you ran `npm run dev` in the server folder, you should see:
```
✅ MongoDB connected successfully
🔥 StudyFire backend is ready!
🚀 Server running on port 5000
```

**Do you see this?** ✅ Yes / ❌ No

---

### **Step 2: Test Backend API Directly**

Open a new browser tab and go to:
```
http://localhost:5000/api/health
```

**You should see:**
```json
{
  "status": "OK",
  "message": "StudyFire API is running",
  "timestamp": "2025-10-24T..."
}
```

**Do you see this?** ✅ Yes / ❌ No

---

### **Step 3: Check Browser Console for Errors**

1. Open StudyFire app (http://localhost:5173)
2. Press `F12` to open Developer Tools
3. Click "Console" tab
4. Create a challenge
5. **Do you see any RED errors?**

**Common Errors:**

**Error 1:** `Failed to fetch` or `net::ERR_CONNECTION_REFUSED`
→ **Solution:** Backend is not running. Restart backend.

**Error 2:** `CORS error`
→ **Solution:** Backend needs CORS enabled (already done)

**Error 3:** `404 Not Found`
→ **Solution:** API URL is wrong

---

### **Step 4: Check Network Tab**

In Developer Tools:
1. Click "Network" tab
2. Create a challenge
3. Look for a request to `http://localhost:5000/api/challenges`
4. Click on it
5. Check "Response" tab

**What do you see?**
- ✅ Challenge data with `_id` field
- ❌ Error message
- ❌ Nothing (request didn't happen)

---

### **Step 5: Check MongoDB Atlas**

1. Go to https://cloud.mongodb.com
2. Login
3. Click "Browse Collections"
4. Look for database: `studyfire`
5. Look for collection: `challenges`

**Do you see your challenges there?** ✅ Yes / ❌ No

---

## 🔧 **Quick Fixes:**

### **Fix 1: Restart Everything**
```bash
# Terminal 1 (Backend):
Ctrl+C
npm run dev

# Terminal 2 (Frontend):
Ctrl+C
npm run dev
```

### **Fix 2: Clear Browser Cache**
1. Press `Ctrl+Shift+Delete`
2. Clear "Cached images and files"
3. Refresh page (`Ctrl+F5`)

### **Fix 3: Check .env File**

Make sure `server/.env` has:
```
MONGODB_URI=mongodb+srv://studyfire_user:UXu6BzKBV4ZtWCLB@cluster0.dhx9z1k.mongodb.net/studyfire?retryWrites=true&w=majority&appName=Cluster0
PORT=5000
NODE_ENV=development
```

---

## 🎯 **Expected Behavior:**

### **When Backend is Working:**
1. Create challenge → Console shows: `POST http://localhost:5000/api/challenges` ✅ 201
2. Refresh page → Console shows: `GET http://localhost:5000/api/challenges` ✅ 200
3. Challenge appears again!

### **When Backend is NOT Working:**
1. Create challenge → Console shows: `Failed to fetch` ❌
2. Falls back to localStorage
3. Refresh page → Data might be lost

---

## 📝 **Tell Me:**

1. **Is backend showing "MongoDB connected"?**
2. **What do you see at http://localhost:5000/api/health?**
3. **Any errors in browser console (F12)?**
4. **What happens when you create a challenge?**

Let me know these 4 things and I'll help you fix it! 🔥
