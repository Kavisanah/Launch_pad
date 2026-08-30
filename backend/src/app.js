import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import mongoose from "mongoose";

import env from "./config/env.js";

import errorMiddleware from "./middlewares/error.middleware.js";
import { globalLimiter } from "./middlewares/rate-limit.middleware.js";
import NotFoundException from "./exceptions/not-found.exception.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import projectRoutes from "./routes/project.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import interactionRoutes from "./routes/interaction.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import statsRoutes from "./routes/stats.routes.js";

const app = express();

// Security Headers (Helmet)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", `https://${env.AUTH0_DOMAIN}`],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: false,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(compression());
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// Health Check (no auth)
app.get("/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
    db: dbStatus,
  });
});

// Root API version check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Student Project Showcase API",
    version: "1.0.0",
  });
});

// Apply global rate limiting to all /api/* routes
app.use("/api", globalLimiter);

// Mount API routes in specific order
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/interactions", interactionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stats", statsRoutes);

// 404 Handler for unmatched routes
app.use((req, res, next) => {
  next(new NotFoundException("Resource not found"));
});

// Global Error Handler (must be registered last)
app.use(errorMiddleware);

export default app;
