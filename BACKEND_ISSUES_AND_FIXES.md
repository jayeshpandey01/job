# Backend Issues & Fixes for Joblet.AI on Vercel

## Issues Identified

### 1. **500 Error on `/api/chatbot/applicant/sessions` & `/api/chatbot/applicant/chat`**

**Root Causes:**

#### A. Firebase Admin SDK Not Initialized
- The `firebaseAdmin.js` config is failing silently because **required environment variables are not set on Vercel**
- Without Firebase credentials, `db` and `auth` become `null`, causing all database queries to fail
- Controllers try to access `db` without checking if it's initialized

#### B. Missing Authentication Check
- The `protectRoute` middleware doesn't validate if Firebase is initialized before verifying tokens
- It returns a 500 error instead of a clear initialization error

#### C. Rate Limiter Issues
- The rate limiter can fail if Redis/session storage isn't configured properly
- No fallback for production environments

#### D. Missing Error Boundaries
- Controllers don't check if `db` is null before executing queries
- This causes uncaught errors resulting in 500 responses

---

## Solution: 3-Step Fix

### Step 1: Fix Firebase Initialization Error Handling

**File: `server/config/firebaseAdmin.js`**

The file already has good error handling, but we need to ensure the app doesn't crash. ✓ **Status: OK**

### Step 2: Fix Authentication Middleware

**File: `server/middleware/authMiddleware.js`**

We need to provide better error messages when Firebase isn't initialized.

**Changes:**
- Improve error message to guide users on environment setup
- Add clear diagnostic output

### Step 3: Fix Controllers to Handle Missing Firebase

**File: `server/controller/applicantChatbotController.js`**

All database operations must check if `db` is initialized before executing queries.

**Changes:**
- Add Firebase initialization checks in all handlers
- Provide helpful error messages

---

## Vercel Environment Setup

### Required Environment Variables

Add these to your Vercel project (Settings → Environment Variables):

#### **Firebase Admin SDK Credentials** (Choose ONE method):

**Method 1: Individual Variables (Recommended for Vercel)**
```
FIREBASE_PROJECT_ID=jobfinder-de280
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc-9b2e4d657d@jobfinder-de280.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQE...\n-----END PRIVATE KEY-----\n
FIREBASE_PRIVATE_KEY_ID=9b2e4d657d
FIREBASE_CLIENT_ID=1234567890
```

**Method 2: Single JSON Blob**
```
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"jobfinder-de280",...}
```

#### **Storage & Other Services**
```
FIREBASE_STORAGE_BUCKET=jobfinder-de280.firebasestorage.app
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=https://joblet-gamma.vercel.app,http://localhost:5173
NODE_ENV=production
```

#### **Optional Services**
```
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_SECRET_KEY=your_secret
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
SENTRY_DSN=your_sentry_dsn
```

---

## How to Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`jobfinder-de280`)
3. Go to **Settings** → **Service Accounts**
4. Click **Generate new private key**
5. You'll download a JSON file with all the credentials

**To extract values:**
```json
{
  "type": "service_account",
  "project_id": "jobfinder-de280",           // → FIREBASE_PROJECT_ID
  "private_key_id": "9b2e4d657d",           // → FIREBASE_PRIVATE_KEY_ID
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",  // → FIREBASE_PRIVATE_KEY
  "client_email": "firebase-adminsdk-fbsvc-9b2e4d657d@jobfinder-de280.iam.gserviceaccount.com",  // → FIREBASE_CLIENT_EMAIL
  "client_id": "1234567890",                // → FIREBASE_CLIENT_ID
  ...
}
```

---

## Testing the Fixes

### Local Testing
```bash
cd server
npm install
export FIREBASE_PROJECT_ID=jobfinder-de280
export FIREBASE_CLIENT_EMAIL=your_client_email
export FIREBASE_PRIVATE_KEY="your_private_key"
export FIREBASE_STORAGE_BUCKET=jobfinder-de280.firebasestorage.app
export GEMINI_API_KEY=your_gemini_key
npm start
```

Then test the endpoint:
```bash
curl http://localhost:3000/api/debug-firebase-init

# Expected response:
{
  "success": true,
  "firebaseInitError": null,
  "dbInitialized": true,
  "env": {
    "FIREBASE_STORAGE_BUCKET": "jobfinder-de280.firebasestorage.app",
    ...
  }
}
```

### Production Testing on Vercel

1. Push changes to GitHub
2. Vercel redeploys automatically
3. Check `/api/debug-firebase-init` endpoint
4. If `firebaseInitError` is null, Firebase is initialized
5. Test `/api/chatbot/applicant/sessions` with a valid Bearer token

---

## Error Handling Improvements

### What Each Error Means

| Error | Cause | Solution |
|-------|-------|----------|
| "Firebase Admin SDK is not initialized" | Missing env vars | Add FIREBASE_* env vars to Vercel |
| "Unauthorized: Missing token" | No Bearer token | Send `Authorization: Bearer <idToken>` header |
| "Invalid token" | Bad token format | Use valid Firebase ID token |
| "Forbidden: Access denied" | Wrong user role | Check user role in Firebase Auth |
| "CORS blocked origin" | Wrong frontend URL | Add frontend URL to FRONTEND_URL env var |
| "CareerBot (Gemini) is temporarily unavailable" | Gemini API quota exceeded | Use other modes: job-scraper, resume_job, websearch |

---

## Debugging Checklist

If you still get 500 errors:

1. **Check Firebase Initialization**
   ```
   GET /api/debug-firebase-init
   ```
   - Look for `firebaseInitError` in response
   - If not null, the error message tells you what's wrong

2. **Check Vercel Environment Variables**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Verify all FIREBASE_* variables are set
   - Check for hidden characters or extra quotes

3. **Check Firebase Console**
   - Verify the project is active
   - Check Firestore Database is enabled
   - Verify service account has proper permissions

4. **Check Frontend Origin**
   - Ensure FRONTEND_URL matches your Vercel deployment URL
   - Format: `https://joblet-gamma.vercel.app` (no trailing slash)

5. **Monitor Logs**
   - Go to Vercel Dashboard → Logs → Function logs
   - Look for Firebase initialization errors
   - Check rate limiter logs

6. **Test with curl**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://joblet-gamma.vercel.app/api/chatbot/applicant/sessions
   ```

---

## Code Changes Summary

### Files Modified

1. **`server/middleware/authMiddleware.js`**
   - Enhanced error messages for Firebase initialization failure
   - Better diagnostic information

2. **`server/controller/applicantChatbotController.js`**
   - Added Firebase initialization checks in all handlers
   - Improved error handling with clear messages

3. **`server/config/firebaseAdmin.js`** (No changes needed)
   - Already has robust error handling
   - Supports all credential loading strategies

---

## Performance Optimization

### Rate Limiting Configuration

Current setup uses in-memory rate limiting (no Redis needed):
- 100 requests per 15 minutes per IP
- Falls back gracefully if Redis unavailable

This is perfect for Vercel's serverless environment.

### Session Storage

Chat sessions are stored in Firebase Firestore:
- Automatic persistence
- Real-time sync across clients
- No additional database required

---

## Deployment Checklist

- [ ] Set all required FIREBASE_* environment variables on Vercel
- [ ] Set GEMINI_API_KEY on Vercel
- [ ] Set FRONTEND_URL on Vercel (your production URL)
- [ ] Test `/api/debug-firebase-init` endpoint
- [ ] Test `/api/chatbot/applicant/sessions` with Bearer token
- [ ] Check Vercel Function Logs for any errors
- [ ] Test chat functionality in production
- [ ] Verify rate limiting works
- [ ] Monitor error rates on Sentry (if enabled)

---

## Quick Links

- Firebase Console: https://console.firebase.google.com/
- Vercel Dashboard: https://vercel.com/dashboard
- Google Cloud Console: https://console.cloud.google.com/
- Sentry Dashboard: https://sentry.io/ (if enabled)

---

## Still Having Issues?

Run the debug endpoint to get detailed diagnostics:
```
GET https://joblet-gamma.vercel.app/api/debug-firebase-init
```

This will show:
- Firebase initialization status
- All relevant environment variables (obscured for security)
- Firebase project ID from service account
- Private key format validation

Share the output of this endpoint for support.
