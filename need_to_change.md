Here is an audit of the project as it exists today (after your recent Supabase removal and Firebase Storage logo work), organized by layer.

---

## How the project actually works

| Layer | Reality |
|--------|---------|
| **Frontend** | React (Vite) + Firebase Auth (Google) for job seekers |
| **Backend** | Express on port 3000 + Firebase Admin (Firestore, Auth, Storage) |
| **Database** | **Firestore** (`jobs`, `companies`, `users`, `applications`, `resume_analyses`) — not MongoDB |
| **Files** | Company logos → Firebase Storage or Cloudinary; resumes → **Cloudinary only** (broken path) |
| **job-scraper** | Standalone Python + Supabase — **not connected** to the portal API anymore |

The root `README.md` still describes MERN + Clerk + scrape/Supabase merge; that does not match the code.

---

## Frontend — what’s missing or broken

### Required (blocks core features)

| Issue | Where | Impact |
|--------|--------|--------|
| **Applications page uses Clerk, app uses Firebase** | `Applications.jsx` imports `@clerk/clerk-react`; no `ClerkProvider` in `main.jsx` | **“My Jobs”** (`/applications`) crashes or fails |
| **`fetchUserData` not in context** | Defined in `AppContext.jsx` but not exported in `value` | Applications resume update breaks |
| **Recruiter token is wrong type** | `RecruiterLogin.jsx` stores server `customToken` in `localStorage` | Dashboard APIs expect a Firebase **ID token** (`verifyIdToken`) — recruiter tools likely fail after login |
| **No `signInWithCustomToken` / email-password on client** | Recruiter flow only POSTs to API | Custom token never becomes an ID token |
| **`fetchUserApplications` not exported** | `AppContext.jsx` | Apply flow may not refresh “already applied” state |
| **Broken routes** | `AppDownload.jsx`: `/jobs`, `/recruiter-dashboard` | 404 links |
| **Dashboard child routes hidden without token** | `App.jsx` nests routes only if `companyToken` is set at render | Brief empty dashboard; worse if token is invalid |

### Recommended

| Issue | Notes |
|--------|--------|
| **`VITE_BACKEND_URL` not validated** | Unlike Firebase (good check in `firebase.js`), missing backend URL → broken API calls |
| **No route guards** | `/dashboard`, `/applications`, `/resume-analyzer` open without login |
| **Recruiter login UI shows password** | Server ignores password (`loginCompany` only uses `email`) |
| **Mixed API auth headers** | Some calls use `Authorization: Bearer`, recruiter pages use `token:` header |
| **README env drift** | Documents `VITE_CLERK_*`, `VITE_API_BASE_URL`; app uses `VITE_FIREBASE_*` + `VITE_BACKEND_URL` |
| **`@clerk/clerk-react` in package.json** | Unused except broken Applications page |

### Optional / polish

- Admin portal: mock audit table, no nav link to `/admin`
- Footer newsletter: no API
- Hero stats: hardcoded marketing numbers
- Job bookmark in `JobCard`: local state only
- Missing asset: `resume-scan.gif` referenced in Resume Analyzer
- No tests / `npm test` script

### Frontend env (current)

| Variable | In `.env.example`? | Used? |
|----------|-------------------|--------|
| `VITE_BACKEND_URL` | Yes | Yes |
| `VITE_FIREBASE_*` (6 vars) | Yes | Yes (auth) |
| `VITE_FIREBASE_MEASUREMENT_ID` | No | In `.env` but unused in code |
| `VITE_CLERK_*` | No (README only) | Broken page only |

---

## Backend — what’s missing or broken

### Required

| Issue | Where | Impact |
|--------|--------|--------|
| **Recruiter login does not check password** | `comapanyController.js` `loginCompany` | Anyone who knows recruiter email can “log in” |
| **Returns custom token, middleware needs ID token** | Register/login + `protectCompany` | Post job, manage jobs, applicants fail auth |
| **Multer only allows images** | `config/multer.js` | PDF resumes rejected on upload |
| **Controllers use `req.file.path`** | `userController`, `resumeController`, `chatbotController` | Breaks with memory storage (no path) |
| **Resumes require Cloudinary** | Resume controllers | No Cloudinary in `server/.env` → resume upload/analyze fails |
| **`GEMINI_API_KEY`** | Resume + chatbot | Required in `.env`; you have it set |

### Recommended

| Issue | Notes |
|--------|--------|
| **Job scraper not mounted** | `scraperController.js` + `jobScraperService.js` exist; no route in `jobRoutes.js` |
| **Dead Mongo/Clerk code** | `models/`, `db.js`, `webhooks.js` — not used |
| **`protectCompany` doesn’t check `recruiter` role** | Any valid Firebase ID token could hit company routes |
| **`change-status` no company ownership check** | Possible IDOR on application IDs |
| **Mock Firebase admin if init fails** | `firebaseAdmin.js` mock auth with `role: "admin"` — unsafe in dev |
| **Service account JSON in repo** | `jobfinder-de280-firebase-adminsdk-*.json` — not in `.gitignore` (security risk) |
| **README**: `npm run dev`, port 5000, MongoDB, Clerk | Actual: `npm run server`, port 3000, Firebase |

### Optional

- `/debug-sentry` route throws on purpose
- Open CORS, no rate limiting
- `package.json` `"main": "index.js"` but entry is `server.js`
- Typo filenames: `comapanyController.js`, `changeVisiblity`

### Backend env (current `server/.env`)

| Variable | Set? | Needed for |
|----------|------|----------------|
| `PORT` | Yes | Server |
| `GEMINI_API_KEY` | Yes | Resume analyzer, chatbot |
| `FIREBASE_STORAGE_BUCKET` | Yes | Company logos |
| `CLOUDINARY_*` | No | Resumes (required by code today) |
| Firebase service account | JSON file in `server/` | All Firestore/Auth/Storage |
| `SUPABASE_*` | No | Only if you re-wire job-scraper |

---

## Database & infrastructure — what’s missing

### Firestore collections (in use)

| Collection | Purpose |
|------------|---------|
| `companies` | Recruiter profiles |
| `jobs` | Recruiter-posted listings (`visible`, `companyId`, …) |
| `users` | Applicant profiles + resume URL |
| `applications` | Job applications (denormalized job/user details) |
| `resume_analyses` | ATS / resume analysis results |

Client does **not** talk to Firestore directly — only through the API.

### Required setup (often missing)

| Item | Status |
|------|--------|
| **Firebase project** `jobfinder-de280` | Referenced in client `.env` |
| **Firebase Auth** — Google provider enabled | For job seekers |
| **Firebase Storage** enabled | For logos (`jobfinder-de280.firebasestorage.app`) |
| **Service account JSON** on server | Present; should not be committed long-term |
| **Firestore composite indexes** | Likely needed at runtime for: `resume_analyses` (`userId` + `createdAt`), `applications` (`userId` + `jobId`) — not in repo |
| **Firestore / Storage security rules** | **Not in repo** (`firestore.rules`, `storage.rules`, `firebase.json`) |
| **Admin custom claim** | `/api/admin/metrics` needs `role: "admin"` — no setup script in repo |

### Data model gaps

- **Single job source in portal**: only Firestore recruiter jobs (Supabase/scraper disconnected by design).
- **Applicants can’t apply** to scraped jobs (no such jobs in API).
- **Recruiters** live in `companies` + Auth; **applicants** in `users` — two parallel models.
- **MongoDB models** in `server/models/` are legacy and unused.

### job-scraper (separate)

- Uses **Supabase** (`jobs`, resumes, etc.) per `job-scraper/.env.example`.
- **Not wired** to `GET /api/jobs` or client search.
- Your `server/job-scraper/.env` is effectively empty — fine for portal-only mode.

### Security (database-related)

- Committed **Firebase admin private key** — rotate if repo was ever shared.
- No versioned Firestore rules/indexes in git.
- All data access today trusts the **server Admin SDK** (bypasses client rules).

---

## Feature readiness snapshot

| Feature | Frontend | Backend | Database |
|---------|----------|---------|----------|
| Browse / search jobs (recruiter) | OK (client filter) | OK `GET /api/jobs` | Firestore `jobs` |
| Google sign-in (applicant) | OK | OK (token verify) | `users` |
| Apply to job | Partial | OK if resume exists | `applications` |
| My Jobs / applications page | **Broken (Clerk)** | API exists | `applications` |
| Recruiter register + logo | UI OK | Register OK; token wrong | `companies` + Storage |
| Recruiter login | UI OK | **No password check** | Auth |
| Recruiter dashboard | **Auth broken** | Routes exist | Firestore |
| Resume analyzer | UI OK | **Upload broken** | `resume_analyses` |
| AI chatbot | UI OK | Needs Gemini; PDF parse broken | Reads `jobs` |
| Admin metrics | Weak gate | Needs `admin` claim | Counts collections |
| Live job scrape | Not used | Not mounted | Supabase (scraper only) |

---

## Suggested priority order (when you want to fix things)

1. **Recruiter auth** — client `signInWithCustomToken` or `signInWithEmailAndPassword` + send ID token; server verify password on login.
2. **Applications page** — migrate from Clerk to Firebase (`AppContext`).
3. **Resume uploads** — PDF multer + buffer upload + Cloudinary **or** Firebase Storage (like logos).
4. **Export missing context helpers** — `fetchUserData`, `fetchUserApplications`.
5. **Docs & env** — align README with Firebase; document indexes, Storage, Gemini, optional Cloudinary.
6. **Security** — gitignore service account, rotate key, remove mock admin fallback.
7. **Decide on job-scraper** — either wire it back (without Supabase in portal if you prefer) or treat as standalone tool only.

If you tell me which area you want first (recruiter dashboard, applicant “My Jobs”, or resumes), I can turn that section into a concrete fix plan or implement it in Agent mode.