import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { getMe } from "../controllers/auth.controller.js";

const router = express.Router();

// GET /api/auth/me
router.get("/me", authenticate, getMe);

export default router;
