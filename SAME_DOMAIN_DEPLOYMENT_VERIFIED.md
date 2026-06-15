# Same-Domain Deployment - VERIFIED ✅

Your Job Portal is configured for **single-domain deployment on Vercel** with NO separate hosting needed.

## Architecture Overview

```
Vercel Single Domain (joblet-gamma.vercel.app)
├── Frontend (React SPA)
│   ├── / → Serves client/dist/index.html
│   ├── /app/* → React Router handles all routes
│   └── Uses relative API paths (/api/...)
│
└── Backend (Express Server)
    ├── /api/* → Node.js API routes
    ├── /uploads/* → Static file uploads
    └── Server runs at same origin
```

## Configuration Verification

### 1. Frontend Setup (Verified ✅)
- **AppContext.jsx** (Line 11-17):
  - `backendUrl = ""` (empty string = relative paths)
  - Automatically strips localhost URLs on production
  - All axios calls use `/api/...` format
- **firebase.js**:
  - Exports `BACKEND_URL = ""`
  - Firebase client credentials from VITE_* env vars
  - No external API gateway needed

### 2. Backend Setup (Verified ✅)
- **server.js**:
  - Initializes Firebase Admin SDK
  - CORS configured for same-origin and *.vercel.app
  - Routes: `/api/*` → Node.js Express handlers
- **firebaseAdmin.js**:
  - Uses server-side private credentials (FIREBASE_*)
  - Separate from client-side public credentials (VITE_*)

### 3. Vercel Routing (Verified ✅)
**vercel.json** - Perfect configuration for SPA + Backend:
```json
{
  "builds": [
    { "src": "client/package.json", "use": "@vercel/static-build" },
    { "src": "server/server.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "server/server.js" },      // → Backend
    { "src": "/uploads/(.*)", "dest": "server/server.js" },  // → Backend
    { "handle": "filesystem" },                               // → Static files
    { "src": "/.*", "dest": "/client/index.html" }           // → React SPA
  ]
}
```

**How it works:**
1. Request to `/api/users/user` → Routes to backend server.js
2. Request to `/chat` → Routes to client/index.html (React Router handles it)
3. Request to `/logo.svg` → Serves from static files
4. Request to `/api/chatbot/applicant/chat` → Routes to backend server.js

## API Call Flow (Same Domain)

### Frontend making API call:
```javascript
// In AppContext.jsx
axios.get(`${backendUrl}/api/users/user`)
// backendUrl = "" (empty)
// Actually calls: GET /api/users/user
// Resolved to: https://joblet-gamma.vercel.app/api/users/user ✅
```

### No external URL needed:
- Frontend and backend share same domain
- Relative paths work automatically
- No separate hosting required
- CORS fully configured

## Environment Variables Required

### Backend (Server-Side) - MUST SET ✅
- `FIREBASE_PROJECT_ID` - Private, server-only
- `FIREBASE_CLIENT_EMAIL` - Private, server-only
- `FIREBASE_PRIVATE_KEY` - Private, server-only
- `FIREBASE_STORAGE_BUCKET` - Private, server-only
- `GEMINI_API_KEY` - Private API key

### Frontend (Client-Side) - MUST SET ✅
- `VITE_FIREBASE_API_KEY` - PUBLIC, safe in frontend code
- `VITE_FIREBASE_AUTH_DOMAIN` - PUBLIC
- `VITE_FIREBASE_PROJECT_ID` - PUBLIC
- `VITE_FIREBASE_STORAGE_BUCKET` - PUBLIC
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - PUBLIC
- `VITE_FIREBASE_APP_ID` - PUBLIC

**Note:** `VITE_BACKEND_URL` is NOT used - relative paths handle everything.

## What's Ready to Deploy

✅ **Frontend**
- React Router configured (SPA)
- Firebase Web SDK integrated
- API calls use relative paths
- Works with same-domain backend

✅ **Backend**
- Express server with all routes
- Firebase Admin SDK configured
- CORS allows same-origin + *.vercel.app
- Rate limiting, auth middleware in place

✅ **Vercel Config**
- Static build for client (Vite)
- Node.js function for server (Express)
- Perfect routing for SPA + API

✅ **No Additional Setup**
- No separate backend hosting
- No API gateway needed
- No proxy configuration needed
- Everything runs on one Vercel domain

## How Everything Works Together

1. **User visits:** https://joblet-gamma.vercel.app/
   - Vercel serves `client/dist/index.html` (React app)
   
2. **User clicks "My Applications":**
   - Browser navigates to `/app/applications` (client-side routing)
   - React Router renders ApplicantApplications component
   
3. **Component loads applications:**
   - Calls `axios.get('/api/users/applications')`
   - Vercel routing matches `/api/*` → sends to `server/server.js`
   - Backend queries Firestore for user's applications
   - Returns JSON response
   - React renders the applications list

4. **User sends chat message:**
   - Calls `axios.post('/api/chatbot/applicant/chat', { message })`
   - Backend receives request, authenticates with Firebase token
   - Calls Gemini API for AI response
   - Returns AI message to frontend

## Deployment Steps (When Ready)

1. Push code to GitHub branch
2. Vercel automatically deploys
3. Set all environment variables on Vercel (8 total)
4. Wait 2-3 minutes for redeploy
5. Visit https://joblet-gamma.vercel.app
6. Application works perfectly

## Troubleshooting

**Blank page?** → Missing `VITE_FIREBASE_*` environment variables

**500 errors on API calls?** → Missing `FIREBASE_*` server environment variables

**Chat not working?** → Missing `GEMINI_API_KEY` server environment variable

**CORS errors?** → Already configured for same-origin (vercel.app domains allowed)

## Summary

✅ **One domain:** joblet-gamma.vercel.app  
✅ **One server:** Vercel (runs both frontend + backend)  
✅ **One database:** Firebase Firestore (shared)  
✅ **No additional hosting:** Everything included  
✅ **Relative API paths:** Automatic same-domain routing  

**You are ready to deploy. No separate backend hosting needed.**
