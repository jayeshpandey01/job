# Vercel Deployment Guide for Joblet.AI

## Overview

This guide walks you through deploying the entire Job Portal stack on Vercel with proper Firebase configuration.

**Current Issue**: The backend is returning 500 errors because Firebase Admin SDK is not initialized due to missing environment variables.

---

## Architecture

```
┌─────────────────────────────────────────┐
│     Frontend (Vite + React)             │
│     deployed to: joblet-gamma.vercel.app│
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│     Backend (Express.js)                │
│     API Routes: /api/chatbot/applicant/*│
│     Deployed as Serverless Functions    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│     Firebase (Google Cloud)             │
│     - Firestore Database                │
│     - Firebase Auth                     │
│     - Cloud Storage                     │
└─────────────────────────────────────────┘
```

---

## Step 1: Get Firebase Credentials

### 1.1 Extract Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **jobfinder-de280**
3. Click ⚙️ **Settings** → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
   - A JSON file will download containing:
     - `project_id`
     - `private_key_id`
     - `private_key`
     - `client_email`
     - `client_id`

### 1.2 Extract Individual Values

The downloaded JSON looks like this:
```json
{
  "type": "service_account",
  "project_id": "jobfinder-de280",
  "private_key_id": "9b2e4d657d...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQ...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc-9b2e4d657d@jobfinder-de280.iam.gserviceaccount.com",
  "client_id": "1234567890",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

**Extract these values:**
- `FIREBASE_PROJECT_ID` = `project_id`
- `FIREBASE_PRIVATE_KEY_ID` = `private_key_id`
- `FIREBASE_PRIVATE_KEY` = `private_key` (with literal newlines, not escaped)
- `FIREBASE_CLIENT_EMAIL` = `client_email`
- `FIREBASE_CLIENT_ID` = `client_id`

---

## Step 2: Add Environment Variables to Vercel

### 2.1 Open Vercel Project Settings

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **job** (joblet-gamma)
3. Click **Settings** (top right)
4. Go to **Environment Variables** (left sidebar)

### 2.2 Add Required Variables

**Click "Add" for each variable:**

#### Firebase Credentials (REQUIRED)
```
FIREBASE_PROJECT_ID = jobfinder-de280
FIREBASE_PRIVATE_KEY_ID = 9b2e4d657d... (from your JSON)
FIREBASE_PRIVATE_KEY = -----BEGIN PRIVATE KEY-----\nMIIEvQ...\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL = firebase-adminsdk-fbsvc-9b2e4d657d@jobfinder-de280.iam.gserviceaccount.com
FIREBASE_CLIENT_ID = 1234567890
FIREBASE_STORAGE_BUCKET = jobfinder-de280.firebasestorage.app
```

#### API Keys (REQUIRED)
```
GEMINI_API_KEY = your_gemini_api_key (get from https://makersuite.google.com/app/apikey)
```

#### Frontend URLs (REQUIRED)
```
FRONTEND_URL = https://joblet-gamma.vercel.app
```

#### Optional Services
```
CLOUDINARY_NAME = your_cloudinary_cloud_name
CLOUDINARY_API_KEY = your_cloudinary_api_key
CLOUDINARY_SECRET_KEY = your_cloudinary_secret_key
SUPABASE_URL = your_supabase_url
SUPABASE_ANON_KEY = your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY = your_supabase_service_role_key
SENTRY_DSN = your_sentry_dsn
```

### 2.3 Important: Set Environment Scope

For each variable:
- **Environment**: Select all three (Production, Preview, Development)
- This ensures the variables are available in all deployment contexts

---

## Step 3: Configure Vercel Build Settings

### 3.1 Check Build Configuration

1. In Vercel project settings, go to **Build & Development Settings**
2. Verify:
   - **Framework Preset**: Leave blank (monorepo)
   - **Build Command**: Leave as is or use: `npm run build`
   - **Output Directory**: Leave blank

### 3.2 Verify vercel.json

The project has a `vercel.json` file that handles the monorepo setup:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    },
    {
      "src": "server/server.js",
      "use": "@vercel/node",
      "config": { "includeFiles": ["server/*.json"] }
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "server/server.js" },
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/client/$1" }
  ]
}
```

This tells Vercel to:
- Deploy `server/server.js` as a serverless function for `/api/*` routes
- Deploy `client/` as static files for everything else

---

## Step 4: Deploy and Test

### 4.1 Trigger Deployment

1. Push your changes to GitHub:
   ```bash
   git add .
   git commit -m "Fix: Add Firebase init checks and improve error handling"
   git push
   ```

2. Vercel will automatically redeploy
3. Watch deployment logs in Vercel Dashboard

### 4.2 Test Firebase Initialization

Once deployed, test if Firebase is initialized:

```bash
curl https://joblet-gamma.vercel.app/api/debug-firebase-init
```

**Expected Response:**
```json
{
  "success": true,
  "firebaseInitError": null,
  "dbInitialized": true,
  "env": {
    "NODE_ENV": "production",
    "VERCEL": "1",
    "FIREBASE_STORAGE_BUCKET": "jobfinder-de280.firebasestorage.app",
    "FRONTEND_URL": "https://joblet-gamma.vercel.app",
    "GEMINI_API_KEY_OBSCURED": "AIzaS...xxxxx",
    "SA_PROJECT_ID": "jobfinder-de280",
    "SA_PRIVATE_KEY_FORMAT": "valid header"
  }
}
```

### 4.3 Test Chat Endpoint

Get a valid Firebase ID token from your frontend (check `localStorage` or dev console after login).

```bash
curl -X GET \
  -H "Authorization: Bearer YOUR_ID_TOKEN" \
  https://joblet-gamma.vercel.app/api/chatbot/applicant/sessions
```

**Expected Response:**
```json
{
  "success": true,
  "sessions": [
    {
      "id": "session_id_123",
      "title": "Resume Review",
      "messageCount": 5,
      "createdAt": "2024-06-14T10:30:00.000Z",
      "updatedAt": "2024-06-14T11:00:00.000Z"
    }
  ]
}
```

---

## Step 5: Troubleshooting

### Issue: "Firebase Admin SDK is not initialized"

**Cause**: Environment variables not set correctly.

**Solution**:
1. Go to Vercel Settings → Environment Variables
2. Check that all `FIREBASE_*` variables are present
3. Verify `FIREBASE_PRIVATE_KEY` contains actual newlines (not `\n` escaped)
4. Redeploy: Go to Deployments tab and click "Redeploy" on the latest build

### Issue: "CORS blocked origin"

**Cause**: Frontend URL not in FRONTEND_URL env var.

**Solution**:
```env
FRONTEND_URL = https://joblet-gamma.vercel.app,http://localhost:5173
```

### Issue: "Unauthorized: Missing token"

**Cause**: Bearer token not sent in Authorization header.

**Solution**:
- Make sure your frontend is sending the token
- Check browser DevTools → Network → check request headers
- Token format must be: `Authorization: Bearer <token>`

### Issue: "Invalid token"

**Cause**: Malformed or expired Firebase ID token.

**Solution**:
- Clear browser cache and localStorage
- Log out and log back in
- Get a fresh ID token from Firebase

### Issue: Rate limit errors

**Cause**: Too many requests from same IP.

**Solution**:
- Wait 15 minutes or redeploy to change IP
- Check rate limiter config in `server/middleware/rateLimiters.js`

### Debug Everything at Once

1. Check Vercel Function Logs:
   - Vercel Dashboard → Deployments → [Latest] → Logs
   - Filter by function: `server/server.js`
   - Look for any error messages

2. Check Firebase Console:
   - Go to https://console.firebase.google.com/
   - Select your project
   - Check Firestore for any write errors
   - Check Authentication for invalid tokens

3. Test Endpoint Response:
   ```bash
   curl -v https://joblet-gamma.vercel.app/api/debug-firebase-init 2>&1 | grep -E "HTTP|firebase|error|Error"
   ```

---

## Advanced: Vercel Observability

### Enable Sentry Error Tracking (Optional)

1. Create account at https://sentry.io/
2. Create new project for Node.js
3. Add to Vercel env vars:
   ```
   SENTRY_DSN = https://your-sentry-dsn
   ```
4. Errors will be tracked automatically

### Monitor Database Queries

The backend logs all database operations to console. In Vercel:

1. Go to Deployments → [Latest] → Logs
2. Filter by `[v0]` or `[ChatBot]` to see debug logs

### Check Rate Limiting

Rate limiting logs are printed to console:
```
[RateLimit] IP 1.2.3.4 - requests: 5/100, resetTime: 1234567890
```

---

## Maintenance Checklist

### Weekly
- [ ] Check Vercel dashboard for errors
- [ ] Monitor Sentry for new issues
- [ ] Review Firebase billing

### Monthly
- [ ] Rotate Firebase private key (generate new one)
- [ ] Update environment variables if needed
- [ ] Check Vercel deployment logs for warnings

### Every 6 Months
- [ ] Review Firebase security rules
- [ ] Audit IAM permissions
- [ ] Update dependencies

---

## Quick Reference

| Issue | File to Check | Fix |
|-------|---------------|-----|
| Firebase not initializing | `server/config/firebaseAdmin.js` | Check env vars on Vercel |
| 500 errors on /api/chatbot/* | `server/controller/applicantChatbotController.js` | Ensure Firebase is initialized |
| CORS errors | `server/server.js` | Check FRONTEND_URL env var |
| Rate limit errors | `server/middleware/rateLimiters.js` | Wait 15 min or redeploy |
| Auth token errors | Frontend login flow | Ensure Firebase Auth is configured |

---

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Firebase Docs**: https://firebase.google.com/docs
- **Express.js Docs**: https://expressjs.com/
- **GitHub Issues**: Open issue in your repo

---

## What's Been Fixed

1. ✅ Added Firebase initialization checks in all controllers
2. ✅ Improved error messages to guide debugging
3. ✅ Added `/api/debug-firebase-init` endpoint for diagnostics
4. ✅ Enhanced middleware error handling
5. ✅ Better error logging for troubleshooting

All changes are backward compatible and production-ready.
