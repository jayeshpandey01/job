# Joblet.AI — Dual-Role Job Portal

Firebase-powered job platform with **CareerBot** (applicant AI chat) and **HireBot** (recruiter AI assistant).

| Role | Entry point | AI assistant |
|------|-------------|--------------|
| Applicant | `/app/chat` | CareerBot — resume ATS, job matching |
| Recruiter | `/dashboard` | HireBot — pipeline, screening, JD drafts |

**Full design docs:** [`docs/README.md`](docs/README.md)

---

## Tech stack

| Layer | Stack |
|-------|--------|
| Frontend | React 18, Vite, Tailwind, React Router, Firebase Auth |
| Backend | Express (port 3000), Firebase Admin, Gemini 1.5 Flash |
| Database | Firestore (`jobs`, `users`, `companies`, `applications`, `chat_sessions`, `activity_logs`) |
| Files | Firebase Storage and/or Cloudinary (resumes, logos) |

---

## Quick start

### Prerequisites

- Node.js 18+
- Firebase project with Auth (Google + email/password), Firestore, Storage
- Firebase service account JSON in `server/` (see `.env.example`)
- [Gemini API key](https://aistudio.google.com/apikey)

### Install

```bash
cd server && npm install
cd ../client && npm install
```

### Environment

Copy examples and fill in values:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

**Client** (`client/.env`): `VITE_BACKEND_URL`, `VITE_FIREBASE_*`

**Server** (`server/.env`): `PORT`, `GEMINI_API_KEY`, `FIREBASE_STORAGE_BUCKET`, optional `CLOUDINARY_*`

### Run

```bash
# Terminal 1 — API
cd server && npm run server

# Terminal 2 — UI
cd client && npm run dev
```

- Marketing site: `http://localhost:5173/`
- Applicant app: `http://localhost:5173/app/chat`
- Recruiter dashboard: `http://localhost:5173/dashboard` (after recruiter login)

---

## Firestore indexes

Composite indexes are defined in [`firestore.indexes.json`](firestore.indexes.json). Deploy with Firebase CLI:

```bash
firebase deploy --only firestore:indexes
```

---

## Project layout

```
client/src/
  layouts/AppShell.jsx          # Applicant mobile shell
  pages/applicant/              # Chat, Jobs, Activity
  pages/recruiter/              # HireBot, Analytics
  components/chat/              # Applicant rich UI
  components/recruiter/         # Recruiter rich UI

server/
  controller/applicantChatbotController.js
  controller/recruiterChatbotController.js
  services/chat/                # Prompts, intents, activity logger
  routes/                       # Split applicant/recruiter APIs
```

---

## QA

Manual E2E checklist: [`docs/e2e-verification.md`](docs/e2e-verification.md)

---

## Related docs

- [`need_to_change.md`](need_to_change.md) — legacy audit notes
- [`docs/04-e2e-implementation-roadmap.md`](docs/04-e2e-implementation-roadmap.md) — build phases

---

## License

Personal, non-commercial use only. See original README footer for full terms.
