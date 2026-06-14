# Firebase Environment Variables - Visual Setup Guide

## 🎯 Goal
Connect your Vercel deployment to Firebase so the chatbot API works.

---

## 📋 Step 1: Open Firebase Console

1. Go to: **https://console.firebase.google.com/**
2. Click on your project: **jobfinder-de280**

```
┌─────────────────────────────────────────────┐
│  Firebase Console                           │
│  ┌─────────────────────────────────────────┤
│  │ Projects                                 │
│  │ > jobfinder-de280  ← CLICK HERE         │
│  │ > my-other-project                      │
│  └─────────────────────────────────────────┘
└─────────────────────────────────────────────┘
```

---

## 🔐 Step 2: Get Service Account Credentials

### 2.1 Go to Settings

In your Firebase project, click the **⚙️ Settings** icon (top left):

```
┌─────────────────────────────────────────────┐
│ jobfinder-de280                    ⚙️       │
│                                             │
│ Overview                                    │
│ Build                                       │
│ Quality                                     │
│ > Settings                ← CLICK HERE     │
└─────────────────────────────────────────────┘
```

### 2.2 Go to Service Accounts

Click the **Service Accounts** tab:

```
┌─────────────────────────────────────────────┐
│ Project Settings                            │
│ ─────────────────────────────────────────── │
│ General | Your apps | Service Accounts      │
│          (tab 1)      (tab 2)              │
│                          ↑ CLICK HERE      │
└─────────────────────────────────────────────┘
```

### 2.3 Download Private Key

Click the blue button "**Generate New Private Key**":

```
┌─────────────────────────────────────────────┐
│ Service Accounts                            │
│                                             │
│ Firebase Admin SDK                          │
│ [Generate New Private Key] ← CLICK HERE    │
│                                             │
│ A JSON file will download with your keys   │
└─────────────────────────────────────────────┘
```

A JSON file downloads. It looks like:

```json
{
  "type": "service_account",
  "project_id": "jobfinder-de280",
  "private_key_id": "9b2e4d657d",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG...",
  "client_email": "firebase-adminsdk-fbsvc-9b2e4d657d@jobfinder-de280.iam.gserviceaccount.com",
  "client_id": "1234567890",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

**Keep this file open!** You'll copy values from it.

---

## 🌐 Step 3: Add Variables to Vercel

### 3.1 Go to Vercel Dashboard

1. Go to: **https://vercel.com/dashboard**
2. Click on your project: **job**
3. Click **Settings** (top right)

```
┌─────────────────────────────────────────────┐
│ Vercel Dashboard                            │
│ joblet-gamma.vercel.app                     │
│                                             │
│ [Overview] [Deployments] [Settings] ← CLICK│
│                                             │
└─────────────────────────────────────────────┘
```

### 3.2 Go to Environment Variables

Click **Environment Variables** in the left sidebar:

```
┌──────────────────┬───────────────────────────┐
│ SETTINGS         │ Settings                  │
│                  │                           │
│ General          │ Project ID                │
│ > Environment... │ [Project ID shown]        │
│   Variables ←    │                           │
│ Domains          │ Domains                   │
│ Build & Dev      │ [Add Domain]              │
│ Monitoring       │                           │
│ Integrations     │                           │
└──────────────────┴───────────────────────────┘
```

---

## ➕ Step 4: Add Each Environment Variable

### Pattern for Each Variable:

```
┌──────────────────────────────────────────────────────┐
│ Key: FIREBASE_PROJECT_ID                             │
│ Value: jobfinder-de280                              │
│ ☑ Production ☑ Preview ☑ Development (all checked!)│
│                                                      │
│ [Add Environment Variable] ← click when ready        │
└──────────────────────────────────────────────────────┘
```

### Variables to Add (In Order):

#### 1️⃣ FIREBASE_PROJECT_ID
- **Key**: `FIREBASE_PROJECT_ID`
- **Value**: Copy from JSON → `"project_id"`
  - Example: `jobfinder-de280`

```json
{
  "project_id": "jobfinder-de280",  ← COPY THIS
  ...
}
```

#### 2️⃣ FIREBASE_PRIVATE_KEY_ID
- **Key**: `FIREBASE_PRIVATE_KEY_ID`
- **Value**: Copy from JSON → `"private_key_id"`
  - Example: `9b2e4d657d123...`

```json
{
  "private_key_id": "9b2e4d657d123",  ← COPY THIS
  ...
}
```

#### 3️⃣ FIREBASE_PRIVATE_KEY ⚠️ **IMPORTANT**
- **Key**: `FIREBASE_PRIVATE_KEY`
- **Value**: Copy from JSON → `"private_key"`
  - Looks like: `-----BEGIN PRIVATE KEY-----\nMIIEvQ...\n-----END PRIVATE KEY-----\n`

```json
{
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkq...\n-----END PRIVATE KEY-----\n",
  ↑ COPY ENTIRE VALUE (including -----BEGIN and -----END)
}
```

**⚠️ IMPORTANT NOTES:**
- Copy the **entire** key including `-----BEGIN` and `-----END`
- Include the `\n` at the end
- Paste directly into Vercel (don't modify it)
- Vercel handles the newlines correctly automatically

#### 4️⃣ FIREBASE_CLIENT_EMAIL
- **Key**: `FIREBASE_CLIENT_EMAIL`
- **Value**: Copy from JSON → `"client_email"`
  - Example: `firebase-adminsdk-fbsvc-9b2e4d657d@jobfinder-de280.iam.gserviceaccount.com`

```json
{
  "client_email": "firebase-adminsdk-fbsvc-9b2e4d657d@jobfinder-de280.iam.gserviceaccount.com",
  ↑ COPY THIS
}
```

#### 5️⃣ FIREBASE_CLIENT_ID
- **Key**: `FIREBASE_CLIENT_ID`
- **Value**: Copy from JSON → `"client_id"`
  - Example: `1234567890`

```json
{
  "client_id": "1234567890",  ← COPY THIS
  ...
}
```

#### 6️⃣ FIREBASE_STORAGE_BUCKET
- **Key**: `FIREBASE_STORAGE_BUCKET`
- **Value**: Usually `{project-id}.firebasestorage.app`
  - Example: `jobfinder-de280.firebasestorage.app`

**OR** copy from JSON → `"storage_bucket"` if it exists.

#### 7️⃣ GEMINI_API_KEY ⚠️ **GET NEW KEY**
- **Key**: `GEMINI_API_KEY`
- **Value**: Go to https://makersuite.google.com/app/apikey and generate a new API key
  - Looks like: `AIzaSyD_aBCD1234...`

#### 8️⃣ FRONTEND_URL
- **Key**: `FRONTEND_URL`
- **Value**: Your Vercel deployment URL(s)
  - Example: `https://joblet-gamma.vercel.app,http://localhost:5173`
  - Can be multiple URLs separated by commas

---

## ✅ Step 5: Verify All Variables Added

After adding all variables, your Vercel Environment Variables page should look like:

```
┌─────────────────────────────────────────────────┐
│ Environment Variables                           │
│                                                 │
│ ✓ FIREBASE_PROJECT_ID                           │
│ ✓ FIREBASE_PRIVATE_KEY_ID                       │
│ ✓ FIREBASE_PRIVATE_KEY                          │
│ ✓ FIREBASE_CLIENT_EMAIL                         │
│ ✓ FIREBASE_CLIENT_ID                            │
│ ✓ FIREBASE_STORAGE_BUCKET                       │
│ ✓ GEMINI_API_KEY                                │
│ ✓ FRONTEND_URL                                  │
│                                                 │
│ All variables show: 🔒 ••••••••••••••••••      │
│ (Vercel hides values for security)              │
│                                                 │
│ Environment: ☑ Production ☑ Preview ☑ Dev     │
│              (all three checked for each var)   │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Step 6: Deploy

Vercel automatically redeploys when you add environment variables.

Wait 30-60 seconds, then go to **Deployments** tab and verify it says **Ready**.

```
┌─────────────────────────────┐
│ Deployments                 │
│                             │
│ ✓ main (commit hash)        │
│   Ready                     │
│   https://joblet-gamma.vercel.app
│                             │
│ (Previous deployment)       │
│ × previous deploy           │
└─────────────────────────────┘
```

---

## 🧪 Step 7: Test

### Test 1: Check Firebase Initialization

Open this URL in your browser:
```
https://joblet-gamma.vercel.app/api/debug-firebase-init
```

You should see:
```json
{
  "success": true,
  "firebaseInitError": null,
  "dbInitialized": true,
  "env": {
    "FIREBASE_STORAGE_BUCKET": "jobfinder-de280.firebasestorage.app",
    "SA_PROJECT_ID": "jobfinder-de280"
  }
}
```

### Test 2: Test Chat API

Get a Firebase ID token from your app after logging in, then:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://joblet-gamma.vercel.app/api/chatbot/applicant/sessions
```

You should see:
```json
{
  "success": true,
  "sessions": [...]
}
```

---

## 🐛 Troubleshooting

### Problem: "firebaseInitError" is not null

**Solution:**
1. Check the error message - it tells you what's wrong
2. Common issues:
   - Variable name typo (must be exactly `FIREBASE_PROJECT_ID`)
   - Missing a required variable
   - Private key is escaped (`\"` instead of actual quotes)

### Problem: Nothing changes after adding variables

**Solution:**
1. Wait 1-2 minutes for Vercel to redeploy
2. Go to Deployments tab and verify status is "Ready"
3. Hard refresh browser (Ctrl+Shift+R on Windows, Cmd+Shift+R on Mac)

### Problem: "SA_PRIVATE_KEY_FORMAT: invalid header"

**Solution:**
- Your FIREBASE_PRIVATE_KEY is malformed
- Delete it and copy again from Firebase JSON
- Make sure it starts with `-----BEGIN PRIVATE KEY-----`

---

## 📋 Checklist

- [ ] Downloaded Firebase service account JSON
- [ ] Opened Firebase Console
- [ ] Opened Vercel Settings → Environment Variables
- [ ] Added FIREBASE_PROJECT_ID (from JSON)
- [ ] Added FIREBASE_PRIVATE_KEY_ID (from JSON)
- [ ] Added FIREBASE_PRIVATE_KEY (from JSON)
- [ ] Added FIREBASE_CLIENT_EMAIL (from JSON)
- [ ] Added FIREBASE_CLIENT_ID (from JSON)
- [ ] Added FIREBASE_STORAGE_BUCKET
- [ ] Got GEMINI_API_KEY from makersuite.google.com
- [ ] Added GEMINI_API_KEY
- [ ] Added FRONTEND_URL
- [ ] All variables set to: ☑️ Production ☑️ Preview ☑️ Development
- [ ] Waited for Vercel to redeploy (status = Ready)
- [ ] Tested `/api/debug-firebase-init`
- [ ] Confirmed success response with firebaseInitError null

---

## 🎉 Done!

Your backend is now connected to Firebase and ready to use!

Test it in your app:
1. Go to https://joblet-gamma.vercel.app
2. Log in with your account
3. Open the chat section
4. Send a message to the chatbot
5. It should work without 500 errors!

If you still get errors, run the `/api/debug-firebase-init` test above to see what's wrong.
