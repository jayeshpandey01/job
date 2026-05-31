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
import { protectRoute, protectCompany } from './middleware/authMiddleware.js';
import { chatRateLimiter, scrapeRateLimiter } from './middleware/rateLimiters.js';
import { db } from './config/firebaseAdmin.js';

// Initialize Express
const app = express();

// Cloudinary Init
await connectCloudinary();

// Middleware
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked origin: ${origin}`));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

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

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
export default app;
