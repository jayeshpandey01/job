# Joblet.AI Project Blackbook

## 1. Project Summary

**Joblet.AI** is a Firebase-forward job portal with a dual-role architecture:
- **Applicants** use a mobile-first chat experience powered by **CareerBot** for job discovery, resume analysis, and application activity.
- **Recruiters** use a separate dashboard with **HireBot** for pipeline analytics, applicant screening, and job description generation.

The repository is a monorepo with an Express backend in `server/` and a React frontend in `client/`.

## 2. Goals and Scope

Primary goals:
- Build a dual-role job platform in one Firebase project.
- Keep applicant and recruiter experiences isolated by UI, API, prompts, and data access.
- Support AI chat for both users and recruiters using Gemini.
- Support resume upload and parsing for applicants.
- Provide recruiter analytics and hiring insights.

Out of scope for v1:
- Combined applicant/recruiter account experience.
- Native mobile apps.
- Streaming chat responses.

## 3. Repo Structure

### Root
- `README.md` — summary and quick start.
- `package.json` — monorepo convenience scripts.
- `firebase.json`, `firestore.rules`, `firestore.indexes.json` — Firebase deployment config.
- `docs/` — detailed design, architecture, API, and QA docs.
- `DEPLOYMENT-CHECKLIST.md`, `README-DEPLOYMENT.md`, `implementation_plan.md`, `need_to_change.md` — deployment and audit notes.

### `client/`
- React 18 + Vite app.
- `src/` contains layouts, pages, components, context, and utilities.
- Uses Tailwind, Firebase Auth, Axios, React Router, and Quill.
- Entrypoint: `client/src/main.jsx`.

### `server/`
- Express API server with Firebase Admin integration.
- `server.js` is the main server entry.
- Uses Gemini API, Firebase Admin, Cloudinary, Supabase, and authentication middleware.
- Controllers and routes are organized under `server/controller/` and `server/routes/`.

### `docs/`
- Design and implementation documents for architecture, UX, API, data model, and QA.

### `FoloUp/`
- Separate project folder included in workspace; not part of Joblet.AI core.

## 4. Key Technologies

### Frontend
- React 18
- Vite
- Tailwind CSS
- Firebase Auth
- React Router DOM
- Axios
- Quill editor
- React Toastify

### Backend
- Express
- Firebase Admin SDK
- Gemini generative AI
- Cloudinary
- Supabase JS
- Multer
- PDF parsing
- JSON Web Tokens
- Sentry
- Svix

### Data Store
- Firestore
- Firebase Storage
- Cloudinary (optional files)

## 5. Dual-Role Architecture

### Applicant role
- Role: `user`
- UI: `/app/chat`, `/app/jobs`, `/app/activity`
- Primary experience: CareerBot chat shell.
- Data access: owns user profile, own applications, chat sessions, activity logs.
- API routes: `/api/chatbot/applicant/*`, `/api/activity`.

### Recruiter role
- Role: `recruiter`
- UI: `/dashboard/*` routes and recruiter chat experience.
- Primary experience: HireBot assistant plus analytics.
- Data access: own company jobs, applicants, recruiter sessions.
- API routes: `/api/chatbot/recruiter/*`, `/api/company/analytics`.

### Separation principles
- Separate chat prompts and controller logic for applicants and recruiters.
- Strict middleware enforcement by role.
- No shared recruiter/applicant chat route behavior.

## 6. API and Data Model

### API design
- **Applicant chat**
  - `POST /api/chatbot/applicant/chat`
  - `POST /api/chatbot/applicant/parse-resume`
  - `GET /api/chatbot/applicant/sessions`
  - `POST /api/chatbot/applicant/sessions`
- **Recruiter chat**
  - `POST /api/chatbot/recruiter/chat`
  - `GET /api/chatbot/recruiter/sessions`
- **Activity feed**
  - `GET /api/activity`
- **Analytics**
  - `GET /api/company/analytics`

### Request auth
- All protected routes require `Authorization: Bearer <Firebase ID token>`.
- Applicant routes use `protectRoute("user")`.
- Recruiter routes use `protectCompany` and require `role === "recruiter"`.

### Firestore collections
- `users`
- `companies`
- `jobs`
- `applications`
- `chat_sessions`
- `activity_logs`
- Additional support collections for analytics and resume analysis.

### Role-specific scoping
- Applicants only query visible jobs and their own records.
- Recruiters only query company-owned jobs and applicants.
- Own-your-data enforcement is required for every endpoint.

## 7. UX and Product Flow

### Applicant UX
- Mobile-first chat shell with bottom tab navigation.
- Chat with CareerBot for resume advice, job search, and job matching.
- Resume upload and parsing route for ATS-like analysis.
- Activity feed to view recent actions and application history.

### Recruiter UX
- Recruiter dashboard separate from applicant UI.
- AI assistant for pipeline summaries, applicant screening, and JD generation.
- Analytics view for company hiring metrics.
- Recruiter chat uses dedicated rich cards and intent handling.

## 8. Setup and Run

### Requirements
- Node.js 18+
- Firebase project with Auth, Firestore, Storage.
- Firebase service account JSON in `server/`.
- Gemini API key.

### Install

```bash
cd server && npm install
cd ../client && npm install
```

### Environment files
- `client/.env` requires `VITE_BACKEND_URL` and Firebase config variables.
- `server/.env` requires `PORT`, `GEMINI_API_KEY`, `FIREBASE_STORAGE_BUCKET`, and optional Cloudinary vars.

### Run

```bash
# API
cd server && npm run server

# UI
cd client && npm run dev
```

### Monorepo shortcuts
- `npm run install:all` — install both server and client.
- `npm run server` — run server from root.
- `npm run client` — run client dev server from root.

## 9. Deployment and QA

### Deployment files
- `firebase.json`
- `firestore.rules`
- `firestore.indexes.json`
- `render.yaml`
- `README-DEPLOYMENT.md`
- `DEPLOYMENT-CHECKLIST.md`

### QA docs
- `docs/e2e-verification.md`
- `docs/04-e2e-implementation-roadmap.md`

## 10. Important Files and References

- `README.md` — project overview and quick start.
- `docs/README.md` — centralized design doc index.
- `docs/01-architecture-role-separation.md` — critical role separation design.
- `docs/05-api-data-model.md` — API contract and Firestore model.
- `server/server.js` — server bootstrap and route mounting.
- `client/src/App.jsx` — frontend routing and layout structure.
- `server/controller/applicantChatbotController.js` and `server/controller/recruiterChatbotController.js` — chat logic separation.

## 11. Notes and Next Steps

- The codebase includes legacy routes and screens; a migration to fully separate applicant/recruiter chat routes is recommended.
- Follow the `docs/` phase roadmap for implementation order.
- Audit `need_to_change.md` before new feature work.
- Keep recruiter and applicant prompt definitions strictly separate.
