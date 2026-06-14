# Quick Reference Card - Backend Fix

## 🔴 Problem
Backend returning 500 errors:
- `/api/chatbot/applicant/sessions`
- `/api/chatbot/applicant/chat`

## 🔧 Root Cause
Firebase not initialized. Missing env vars on Vercel.

## ✅ Solution (30 minutes)

### 1️⃣ Get Firebase Credentials
```
Firebase Console → jobfinder-de280 → Settings → Service Accounts → Generate Key
↓
Download JSON file with all credentials
```

### 2️⃣ Add 8 Variables to Vercel
```
Vercel Dashboard → job → Settings → Environment Variables
```

**Copy these from Firebase JSON:**
| Vercel Env Var | Firebase JSON Field |
|---|---|
| `FIREBASE_PROJECT_ID` | `project_id` |
| `FIREBASE_CLIENT_EMAIL` | `client_email` |
| `FIREBASE_PRIVATE_KEY` | `private_key` |
| `FIREBASE_PRIVATE_KEY_ID` | `private_key_id` |
| `FIREBASE_CLIENT_ID` | `client_id` |
| `FIREBASE_STORAGE_BUCKET` | `jobfinder-de280.firebasestorage.app` |

**Get these separately:**
| Vercel Env Var | Source |
|---|---|
| `GEMINI_API_KEY` | https://makersuite.google.com/app/apikey |
| `FRONTEND_URL` | `https://joblet-gamma.vercel.app` |

**For each variable:**
- Set scope: ☑️ Production ☑️ Preview ☑️ Development

### 3️⃣ Test
```bash
# Should return: {"success": true, "firebaseInitError": null}
curl https://joblet-gamma.vercel.app/api/debug-firebase-init
```

**Done!** ✅

---

## 📖 Documentation

| File | Purpose | Time |
|------|---------|------|
| `README_BACKEND_FIX.md` | Overview & all links | 5 min |
| `QUICK_FIX_SUMMARY.md` | Quick solution | 5 min |
| `FIREBASE_ENV_SETUP_VISUAL.md` | Visual guide | 15 min |
| `BACKEND_ISSUES_AND_FIXES.md` | Technical deep dive | 30 min |
| `VERCEL_DEPLOYMENT_GUIDE.md` | Complete deployment | 45 min |

---

## 🐛 Troubleshooting

| Issue | Check |
|-------|-------|
| Still 500 errors | `/api/debug-firebase-init` response |
| CORS error | FRONTEND_URL env var |
| Firebase error | Env var names & values |
| Auth error | Firebase ID token format |

---

## 🔗 Links

- Firebase: https://console.firebase.google.com/
- Vercel: https://vercel.com/dashboard
- Gemini: https://makersuite.google.com/app/apikey
- Debug: https://joblet-gamma.vercel.app/api/debug-firebase-init

---

## ✨ After Setup

✅ Chat works
✅ No 500 errors
✅ Clear error messages
✅ Easy debugging
✅ Production ready

---

**Start**: Read `README_BACKEND_FIX.md` or `FIREBASE_ENV_SETUP_VISUAL.md`
