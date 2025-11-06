# 🔍 Debug Steps - Let's Find The Issue!

## Step 1: Open Browser Console

1. Go to `http://localhost:5173`
2. Press `F12` to open Developer Tools
3. Click on **Console** tab
4. Keep it open while testing

## Step 2: Login and Check Console

1. **Login** with karthik/1234
2. Look for these messages in console:
   ```
   🔐 Login successful! {userId: "...", username: "karthik", ...}
   🔍 Checking login state...
      userId: ...
      username: karthik
   ✅ User already logged in!
   🔄 Loading challenges from backend...
   👤 Current userId: ...
   ✅ Challenges loaded: X challenges
   ```

## Step 3: Create a Challenge

1. Click "Create New Challenge"
2. Fill in details and create
3. Look for:
   ```
   📝 Creating challenge in backend...
   ✅ Challenge created: {...}
   ```

## Step 4: Refresh Page (THE BIG TEST!)

1. **Press F5 or Ctrl+R**
2. **IMPORTANT:** Look at the console messages
3. You should see:
   ```
   🔍 Checking login state...
      userId: 673c...
      username: karthik
   ✅ User already logged in!
   🔄 Loading challenges from backend...
   👤 Current userId: 673c...
   ✅ Challenges loaded: X challenges
   📦 Challenge data: [...]
   ```

## What to Check

### ✅ Good Signs:
- userId is present in localStorage
- "User already logged in!" appears
- "Loading challenges from backend..." appears
- "Challenges loaded: X challenges" appears
- Challenges array is not empty

### ❌ Bad Signs:
- "No userId found in localStorage"
- "User not logged in" error
- "Challenges loaded: 0 challenges"
- Challenges array is empty `[]`

## Step 5: Check localStorage

1. In Console tab, type:
   ```javascript
   localStorage.getItem('userId')
   localStorage.getItem('username')
   ```
2. Both should return values (not null)

## Step 6: Check Network Tab

1. Click **Network** tab in Developer Tools
2. Refresh the page
3. Look for requests to:
   - `http://localhost:5000/api/challenges?userId=...`
4. Click on it and check:
   - **Request URL:** Should have userId parameter
   - **Response:** Should show your challenges

## Common Issues

### Issue 1: userId is null after refresh
**Fix:** Login component might not be saving to localStorage correctly

### Issue 2: Challenges loaded: 0 challenges
**Causes:**
- Wrong userId (not matching MongoDB)
- Backend filtering by wrong user
- Challenges were created without userId

### Issue 3: Network request fails
**Causes:**
- Backend not running
- CORS error
- MongoDB connection lost

## Share Console Output

Please share what you see in the console after:
1. Login
2. Create challenge
3. Refresh page

Copy the console messages and share them so I can see exactly what's happening! 🔍
