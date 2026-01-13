# Vercel Deployment Guide

## 🚀 Quick Fix for 404 and Network Errors

### Problem 1: 404 NOT_FOUND Error
**Solution:** ✅ Fixed with `vercel.json` file

The `vercel.json` file has been created with proper SPA routing configuration. All routes will now redirect to `index.html` to support React Router.

### Problem 2: Network Error during Login
**Solution:** Set environment variables in Vercel

## 📋 Step-by-Step Deployment

### 1. Push Code to Git
```bash
git add .
git commit -m "Add vercel.json for SPA routing"
git push
```

### 2. Deploy to Vercel

#### Option A: Via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your Git repository
4. Vercel will auto-detect Vite framework
5. **IMPORTANT:** Go to "Environment Variables" section
6. Add the following variables:

#### Required Environment Variables:
```
VITE_API_BASE_URL=https://your-backend-api-url.com
```

#### Optional (if using these features):
```
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_API_KEY=your-api-key
VITE_CLOUDINARY_API_SECRET=your-api-secret
VITE_CLOUDINARY_UPLOAD_PRESET=your-preset

VITE_SMS_API_KEY=your-sms-api-key
VITE_SMS_SENDER_ID=your-sender-id
```

7. Click "Deploy"

#### Option B: Via Vercel CLI
```bash
npm i -g vercel
vercel
# Follow the prompts
# When asked about environment variables, add them
```

### 3. Verify Deployment

After deployment:
1. Visit your Vercel URL (e.g., `https://your-app.vercel.app`)
2. Try navigating to `/login` - should work without 404
3. Try logging in - should connect to backend API

## 🔧 Troubleshooting

### Still Getting 404?
- ✅ Check that `vercel.json` is in the root directory
- ✅ Check that build output is `dist` folder
- ✅ Redeploy after adding `vercel.json`

### Still Getting Network Error?
- ✅ Check `VITE_API_BASE_URL` is set correctly in Vercel
- ✅ Check your backend API is running and accessible
- ✅ Check CORS settings on your backend allow your Vercel domain
- ✅ Check browser console for exact error message

### Check Environment Variables in Vercel:
1. Go to your project on Vercel
2. Settings → Environment Variables
3. Make sure all variables are set for "Production", "Preview", and "Development"

## 📝 Notes

- The `vercel.json` file handles SPA routing automatically
- Environment variables must start with `VITE_` to be accessible in Vite
- After adding/changing environment variables, you need to redeploy
- Backend API URL should NOT have trailing slash (e.g., `https://api.example.com` not `https://api.example.com/`)
