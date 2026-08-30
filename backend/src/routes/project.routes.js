import express from "express";
import { authenticate, optionalAuthenticate, authorize } from "../middlewares/auth.middleware.js";
import { uploadFields } from "../middlewares/upload.middleware.js";
import { validate, validateQuery } from "../middlewares/validation.middleware.js";
import { createProject, updateProject, listProjectsQuery, searchProjectsQuery } from "../validators/project.validator.js";
import { uploadLimiter } from "../middlewares/rate-limit.middleware.js";
import {
  createProject as createProjectController,
  getProjects,
  searchProjects,
  getProjectById,
  updateProject as updateProjectController,
  deleteProject,
  adminUpdateStatus,
  hideProject,
  resubmitProject,
} from "../controllers/project.controller.js";
import { USER_ROLES } from "../constants/roles.js";

const router = express.Router();

// POST /api/projects
router.post(
  "/",
  authenticate,
  authorize(USER_ROLES.STUDENT),
  uploadLimiter,
  uploadFields,
  validate(createProject),
  createProjectController
);

// GET /api/projects
router.get("/", optionalAuthenticate, validateQuery(listProjectsQuery), getProjects);

// GET /api/projects/search
router.get("/search", optionalAuthenticate, validateQuery(searchProjectsQuery), searchProjects);

// GET /api/projects/:id
router.get("/:id", optionalAuthenticate, getProjectById);

// PUT /api/projects/:id
router.put(
  "/:id",
  authenticate,
  authorize(USER_ROLES.STUDENT),
  uploadLimiter,
  uploadFields,
  validate(updateProject),
  updateProjectController
);

// DELETE /api/projects/:id
router.delete(
  "/:id",
  authenticate,
  authorize(USER_ROLES.STUDENT, USER_ROLES.ADMIN),
  deleteProject
);

// PATCH /api/projects/:id/status
router.patch(
  "/:id/status",
  authenticate,
  authorize(USER_ROLES.ADMIN),
  adminUpdateStatus
);

// PATCH /api/projects/:id/hide
router.patch(
  "/:id/hide",
  authenticate,
  authorize(USER_ROLES.STUDENT),
  hideProject
);

// PATCH /api/projects/:id/resubmit
router.patch(
  "/:id/resubmit",
  authenticate,
  authorize(USER_ROLES.STUDENT),
  resubmitProject
);

export default router;
