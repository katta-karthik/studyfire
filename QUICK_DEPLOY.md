# 🚀 Quick Deploy to Render.com

## Option 1: One-Click Deploy (Fastest!)

1. Click this button: [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

2. When prompted, enter:
   - **MONGODB_URI**: Your MongoDB Atlas connection string
   - **VITE_GEMINI_API_KEY**: Your Gemini API key

3. Wait 5 minutes → Done! ✅

---

## Option 2: Manual Deploy (15 minutes)

Follow the step-by-step guide in `DEPLOYMENT_GUIDE.md`

---

## 🔄 After Deployment: Auto-Updates

Every time you update code:

```bash
git add .
git commit -m "Update feature"
git push
```

**Render auto-deploys in 2 minutes!** No manual steps needed! 🎉

---

## 📱 Access Your App

- **Live URL**: `https://studyfire.onrender.com`
- **Backend URL**: `https://studyfire-backend.onrender.com`

---

## 💡 Pro Tips

1. **Free tier sleeps after 15 min** - First load may take 30 seconds
2. **Keep it active**: Visit your site once a day to keep it warm
3. **Upgrade later**: $7/month for always-on (if needed)

---

## 🔒 Private Access Only

Your app is public by default. To make it private:

### Option A: Simple Password (Free)
Add basic auth in your React app (I can help set this up)

### Option B: Cloudflare Access (Free)
1. Sign up for Cloudflare
2. Add your Render domain
3. Enable Access policies
4. Only you can access!

Want me to implement Option A? Just ask! 🔐
