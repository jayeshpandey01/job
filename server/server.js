import "./config/loadEnv.js";
import './config/instrument.js'
import express from "express";
import cors from "cors";
import * as Sentry from "@sentry/node";
import companyRoutes from './routes/companyRoutes.js'
import connectCloudinary from './config/cloudinary.js';
import JobRoutes from './routes/jobRoutes.js';
import userRoutes from './routes/userRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';
import applicantChatbotRoutes from './routes/applicantChatbotRoutes.js';
import recruiterChatbotRoutes from './routes/recruiterChatbotRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import calendarNotesRoutes from './routes/calendarNotesRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import googleCalendarRoutes from './routes/googleCalendarRoutes.js';
import { protectRoute, protectCompany } from './middleware/authMiddleware.js';
import { chatRateLimiter } from './middleware/rateLimiters.js';
import { db } from './config/firebaseAdmin.js';

// Initialize Express
const app = express();

// Lazy Cloudinary Init — non-blocking, safe for serverless cold starts
connectCloudinary().catch((err) =>
  console.warn("[Cloudinary] Init failed (non-fatal):", err.message)
);

// CORS — allow same-origin (Vercel), localhost dev, and any explicit FRONTEND_URL list
const rawOrigins = process.env.FRONTEND_URL || "";
const explicitOrigins = rawOrigins
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (mobile apps, curl, Postman, same-origin SSR)
      if (!origin) return callback(null, true);

      // Allow localhost for local development
      if (origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1")) {
        return callback(null, true);
      }

      // Allow any *.vercel.app domain (covers all your preview + prod deployments)
      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      // Allow explicitly listed origins
      if (explicitOrigins.includes(origin)) {
        return callback(null, true);
      }

      callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static("uploads"));

// Routes
app.get("/", (req, res) => res.send("API Working with Firebase"));

// Mount modular sub-routes
app.use('/api/company', companyRoutes)
app.use('/api/jobs', JobRoutes)
app.use('/api/users', protectRoute("user"), userRoutes)
app.use('/api/resumes', protectRoute("user"), resumeRoutes)
app.use('/api/chatbot/applicant', chatRateLimiter, protectRoute("user"), applicantChatbotRoutes)
app.use('/api/chatbot/recruiter', chatRateLimiter, protectCompany, recruiterChatbotRoutes)
app.use('/api/activity', protectRoute("user"), activityRoutes)
app.use('/api/chatbot', chatRateLimiter, protectRoute("user"), chatbotRoutes)
app.use('/api/calendar-notes', calendarNotesRoutes)
app.use('/api/interviews', interviewRoutes)
app.use('/api/calendar', googleCalendarRoutes)

// Unified Admin Route for `/admin`
app.get('/api/admin/metrics', protectRoute("admin"), async (req, res) => {
  try {
    const jobsSnapshot = await db.collection("jobs").get();
    const usersSnapshot = await db.collection("users").get();
    const appsSnapshot = await db.collection("applications").get();

    res.json({
      success: true,
      metrics: {
        totalJobs: jobsSnapshot.size,
        totalUsers: usersSnapshot.size,
        totalApplications: appsSnapshot.size
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

Sentry.setupExpressErrorHandler(app);

// Start the server locally only — Vercel exports the app as a handler
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Server running on port ${port}`));
}

// Export as default for Vercel serverless function handler
export default app;

