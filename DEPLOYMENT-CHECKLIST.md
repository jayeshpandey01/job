# ✅ Complete Deployment Checklist

## 🎯 Backend: https://backend-server-lzox.onrender.com

---

## 📋 Pre-Deployment Checklist

### Server Side (Backend)

- [ ] **1. Update package.json**
  - ✅ Already done: Changed `"main": "index.js"` to `"main": "server.js"`
  - ✅ Already done: Updated `firebase-admin` to `^13.10.0`

- [ ] **2. Install updated dependencies**
  ```bash
  cd server
  npm install
  ```

- [ ] **3. Verify no vulnerabilities**
  ```bash
  npm audit
  # Should show 0 vulnerabilities after firebase-admin update
  ```

- [ ] **4. Test locally**
  ```bash
  npm start
  # Visit http://localhost:3000 - should see "API Working with Firebase"
  ```

### Client Side (Frontend)

- [ ] **5. Update backend URL**
  - Edit `client/.env`
  - Change: `VITE_BACKEND_URL=https://backend-server-lzox.onrender.com`
  - See: `client/UPDATE-BACKEND-URL.md` for details

- [ ] **6. Test client locally with production backend**
  ```bash
  cd client
  npm run dev
  # Test if API calls work
  ```

---

## 🚀 Render Deployment Checklist

### In Render Dashboard

- [ ] **7. Go to your service**
  - Visit: https://dashboard.render.com
  - Select your backend service

- [ ] **8. Update Build Settings**
  - Build Command: `npm install`
  - Start Command: `node server.js`
  - Node Version: 24.14.1 (or default)

- [ ] **9. Set Environment Variables**
  
  Go to: Environment tab → Add these variables:

  **Required:**
  ```env
  PORT=3000
  NODE_ENV=production
  GEMINI_API_KEY=your_actual_key
  FRONTEND_URL=https://your-frontend.com,http://localhost:5173
  FIREBASE_STORAGE_BUCKET=jobfinder-de280.firebasestorage.app
  ```

  **Firebase Credentials (choose one method):**
  
  **Method A: Environment Variables** (Recommended)
  ```env
  FIREBASE_PROJECT_ID=jobfinder-de280
  FIREBASE_CLIENT_EMAIL=your-email@jobfinder-de280.iam.gserviceaccount.com
  FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Key\n-----END PRIVATE KEY-----\n"
  ```
  
  **Method B: Secret File**
  - Add secret file: `jobfinder-de280-firebase-adminsdk-fbsvc-9b2e4d657d.json`
  - Paste entire JSON content

  **Optional:**
  ```env
  GEMINI_MODEL=gemini-2.0-flash
  SENTRY_DSN=your_sentry_dsn
  CLOUDINARY_NAME=your_cloud_name
  CLOUDINARY_API_KEY=your_api_key
  CLOUDINARY_SECRET_KEY=your_secret
  ```

- [ ] **10. Push to GitHub**
  ```bash
  cd server
  git add .
  git commit -m "Fix: Update deployment config and security patches"
  git push origin main
  ```

- [ ] **11. Monitor Deployment**
  - Watch Render logs
  - Wait for "Build successful 🎉"
  - Wait for "Deploy live ✅"

---

## ✅ Post-Deployment Verification

### Backend Tests

- [ ] **12. Test health endpoint**
  ```bash
  curl https://backend-server-lzox.onrender.com/
  # Should return: "API Working with Firebase"
  ```

- [ ] **13. Check Render logs**
  - No errors in startup
  - Server running on correct port
  - Firebase connected successfully

- [ ] **14. Test API endpoints**
  ```bash
  # Test jobs endpoint
  curl https://backend-server-lzox.onrender.com/api/jobs
  
  # Test company endpoint
  curl https://backend-server-lzox.onrender.com/api/company
  ```

### Frontend Tests

- [ ] **15. Update client .env**
  - `VITE_BACKEND_URL=https://backend-server-lzox.onrender.com`

- [ ] **16. Test frontend locally**
  ```bash
  cd client
  npm run dev
  ```

- [ ] **17. Check browser console**
  - No CORS errors
  - API calls successful
  - Network tab shows requests to backend-server-lzox.onrender.com

- [ ] **18. Test key features**
  - User authentication
  - Job listings
  - Resume upload
  - Chatbot functionality

---

## 🐛 Troubleshooting Guide

### Issue: "Cannot find module '/opt/render/project/src/index.js'"
✅ **FIXED**: Updated package.json main field

### Issue: Build fails with vulnerabilities
✅ **FIXED**: Updated firebase-admin to v13.10.0

### Issue: Server starts but crashes immediately
**Check:**
- [ ] All environment variables are set
- [ ] Firebase credentials are correct
- [ ] FIREBASE_STORAGE_BUCKET matches your project

### Issue: CORS errors in frontend
**Fix:**
- [ ] Add your frontend URL to `FRONTEND_URL` in Render
- [ ] Format: `https://your-frontend.com,http://localhost:5173`

### Issue: Firebase Admin SDK errors
**Fix:**
- [ ] Verify FIREBASE_PROJECT_ID is correct
- [ ] Check FIREBASE_PRIVATE_KEY includes `\n` characters
- [ ] Ensure private key is wrapped in quotes

---

## 📊 Success Criteria

Your deployment is successful when:

- ✅ Render shows "Deploy live"
- ✅ https://backend-server-lzox.onrender.com/ returns "API Working with Firebase"
- ✅ No errors in Render logs
- ✅ Frontend can make API calls successfully
- ✅ No CORS errors
- ✅ `npm audit` shows 0 vulnerabilities
- ✅ All features work end-to-end

---

## 📁 Files Created/Modified

| File | Status | Purpose |
|------|--------|---------|
| `server/package.json` | ✅ Modified | Fixed entry point & updated dependencies |
| `server/render.yaml` | ✅ Created | Render deployment config |
| `server/DEPLOYMENT.md` | ✅ Created | Detailed deployment guide |
| `server/QUICK-START.md` | ✅ Created | Quick reference guide |
| `client/UPDATE-BACKEND-URL.md` | ✅ Created | Client configuration guide |
| `DEPLOYMENT-CHECKLIST.md` | ✅ Created | This checklist |

---

## 🎉 Next Steps After Successful Deployment

1. **Monitor Performance**
   - Check response times
   - Monitor error rates
   - Set up alerts

2. **Security**
   - Rotate API keys regularly
   - Keep dependencies updated
   - Review Firebase security rules

3. **Scaling**
   - Monitor usage
   - Upgrade Render plan if needed
   - Consider caching strategies

4. **Documentation**
   - Document API endpoints
   - Update README
   - Share deployment guide with team

---

## 🆘 Need Help?

- **Render Docs**: https://render.com/docs/troubleshooting-deploys
- **Firebase Admin**: https://firebase.google.com/docs/admin/setup
- **Check Logs**: Render Dashboard → Logs tab

---

**Ready to deploy? Start with Step 1!** 🚀
