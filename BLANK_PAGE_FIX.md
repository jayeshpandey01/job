# Blank Page Issue - Complete Fix

## Problem
The website shows a blank page because the client-side Firebase configuration is missing.

## Root Cause
The React app requires 6 Firebase Web SDK environment variables (VITE_FIREBASE_*) to initialize. Without these, the app shows a blank page instead of content.

## Solution: Add 6 Environment Variables to Vercel

### Step 1: Get Firebase Web SDK Values
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **jobfinder-de280**
3. Go to **Project Settings** (gear icon)
4. Click **Your Apps** section
5. Find your **Web App** (if not there, create one)
6. You'll see these 6 values:

```
apiKey
authDomain
projectId
storageBucket
messagingSenderId
appId
```

### Step 2: Add to Vercel Environment Variables
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select project: **job**
3. Click **Settings** → **Environment Variables**
4. Add these 6 variables (use EXACT names):

| Variable Name | Value | Source |
|---------------|-------|--------|
| VITE_FIREBASE_API_KEY | YOUR_API_KEY | Firebase Console → Web App |
| VITE_FIREBASE_AUTH_DOMAIN | YOUR_AUTH_DOMAIN | Firebase Console → Web App |
| VITE_FIREBASE_PROJECT_ID | YOUR_PROJECT_ID | Firebase Console → Web App |
| VITE_FIREBASE_STORAGE_BUCKET | YOUR_STORAGE_BUCKET | Firebase Console → Web App |
| VITE_FIREBASE_MESSAGING_SENDER_ID | YOUR_MESSAGING_ID | Firebase Console → Web App |
| VITE_FIREBASE_APP_ID | YOUR_APP_ID | Firebase Console → Web App |

### Step 3: Important Settings
For each variable in Vercel:
- Set scope to: ✓ Production ✓ Preview ✓ Development
- Save each one

### Step 4: Redeploy
- Vercel automatically redeploys after env vars are added
- Wait 2-3 minutes for deployment to complete
- Refresh the website

## Expected Result After Fix
- Website loads with the home page visible
- Login button appears
- Chat feature becomes accessible
- No blank pages or console errors

## Code Changes Made
1. Updated `client/src/config/firebase.js` with clearer error messages
2. Added backend URL export for same-domain backend
3. Backend and frontend API calls use relative paths (no separate backend URL needed)

## If Still Blank After Adding Env Vars
Check browser console (F12 → Console tab):
- Look for error messages
- Run: `curl https://joblet-gamma.vercel.app/api/debug-config` to verify backend is ready
- Verify all 6 environment variables were added correctly on Vercel

## Quick Test
After adding variables and waiting for redeploy:
```bash
# Check if Firebase is configured
curl https://joblet-gamma.vercel.app/api/debug-config

# Expected response should include status: "READY"
```

## Summary
- You need 6 Firebase Web SDK values (PUBLIC values, safe to expose)
- Add them to Vercel with VITE_ prefix
- Backend is on same domain, so no backend URL needed
- Website should load after env vars are set
