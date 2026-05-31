# Implementation Plan: AI Resume & Job Matching Chatbot

This plan details the end-to-end implementation of an **AI Conversational Chatbot** integrated into the **Job Portal**. The chatbot will allow users to upload their resumes, ask for interactive ATS grading, receive instant matching job recommendations from active job listings, and get resume-writing feedback in a friendly chat format.

---

## User Review Required

> [!IMPORTANT]
> **Intelligent Routing & Intent Parsing:**
> The chatbot backend will use Gemini AI to dynamically parse user intents:
> 1. **Resume Analysis Intent:** Grade the resume and output an interactive score gauge in the chat bubble.
> 2. **Job Match Intent:** Match the resume against active portal jobs (fetched from your Firestore database) and output interactive cards.
> 3. **Career Consulting Intent:** General advice on rewriting resume sections, preparing for interviews, or technical questions.
>
> **Interactive Rich Messages:**
> The frontend chat interface will support rich formatting to render **Interactive Job Cards** (with details and quick apply links) and **ATS Score Badges** directly inside the conversation thread.

---

## Proposed Changes

### 1. Backend Server Component

We will create modular chatbot routes and controller logic to handle conversational state, file parsing, database matching, and Gemini API streaming.

#### [NEW] [chatbotController.js](file:///c:/Users/Project/Downloads/Job-Portal/server/controller/chatbotController.js)
- Implement `handleChatSession`:
  - Accepts `message`, optional `resumeUrl`, and `history` (for continuous context).
  - Retrieves active jobs from the Firestore `jobs` collection if a job-matching query is detected.
  - Formulates system instructions to make Gemini act as an expert technical recruiter.
  - Instructs Gemini to output structured Markdown or JSON blocks for jobs (e.g., `[JOB_CARD: jobId]`) or scores (e.g., `[SCORE_BADGE: score]`), enabling the frontend to replace these blocks with real interactive React components.

#### [NEW] [chatbotRoutes.js](file:///c:/Users/Project/Downloads/Job-Portal/server/routes/chatbotRoutes.js)
- Register routes:
  - `POST /api/chatbot/chat` - Process a chat message, perform intent routing, run AI prompt, and return the response.

#### [MODIFY] [server.js](file:///c:/Users/Project/Downloads/Job-Portal/server/server.js)
- Import and mount `chatbotRoutes` under `/api/chatbot` protected by the user auth middleware.

---

### 2. Frontend Client Component

We will create a premium, gorgeous conversational chat interface with attachment support.

#### [MODIFY] [AppContext.jsx](file:///c:/Users/Project/Downloads/Job-Portal/client/src/context/AppContext.jsx)
- Add `sendChatMessage(message, history, resumeFile)` to post messages and file uploads to the backend.

#### [NEW] [Chatbot.jsx](file:///c:/Users/Project/Downloads/Job-Portal/client/src/pages/Chatbot.jsx)
- A beautiful dedicated Chat interface with:
  - Scrollable conversational thread showing user and AI bubbles.
  - Text input with a paperclip button for PDF resume attachment.
  - Premium micro-animations (e.g., typing indicator with dots, hover slide effects).
  - Support for **Rich Renderers**:
    - If the message contains `[SCORE_BADGE: XX]`, render an animated `ScoreGauge` inline.
    - If the message contains `[JOB_CARD: jobId]`, fetch details and render a premium `JobCard` inline with a "Quick Apply" button.

#### [MODIFY] [Navbar.jsx](file:///c:/Users/Project/Downloads/Job-Portal/client/src/components/Navbar.jsx)
- Add an "AI Career Assistant" link with an indicator icon in the header next to "Resume Analyzer".

#### [MODIFY] [App.jsx](file:///c:/Users/Project/Downloads/Job-Portal/client/src/App.jsx)
- Register Route: `/chatbot` -> `Chatbot.jsx`

---

## Verification Plan

### Automated/Integration Tests
1. **Chat Intent Routing**:
   - Verify that sending a message like *"Help me find jobs"* queries active jobs and returns structured card strings.
   - Verify that sending a resume along with *"How's my ATS score?"* yields structured grading metrics.

### Manual Verification
1. **Interactive Demo**:
   - Navigate to `/chatbot`.
   - Send general messages (e.g., *"Hi, what can you do?"*).
   - Attach a PDF resume and type *"Analyze my resume"*. Verify that inline grades render smoothly.
   - Type *"Show me jobs that match my skills"*. Verify that custom job listing cards appear in the chat bubbles and that clicking them launches the job application portal.
