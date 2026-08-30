import projectService from "../services/project.service.js";
import likeService from "../services/like.service.js";
import ApiResponse from "../utils/api-response.js";

/**
 * Excludes sensitive fields (__v and googleId) and strips email unless requester is self or Admin.
 */
const sanitizeProject = (project, requester = null) => {
  if (!project) return null;
  const projectObj = typeof project.toObject === "function" ? project.toObject() : { ...project };
  delete projectObj.__v;

  if (projectObj.owner) {
    if (typeof projectObj.owner.toObject === "function") {
      projectObj.owner = projectObj.owner.toObject();
    } else {
      projectObj.owner = { ...projectObj.owner };
    }
    delete projectObj.owner.auth0Sub;
    delete projectObj.owner.__v;

    // Email privacy: only show email to owner self or Admin
    const ownerId = (projectObj.owner._id || projectObj.owner.id || "").toString();
    const isSelf = requester && requester.userId.toString() === ownerId;
    const isAdmin = requester && requester.role === "ADMIN";
    if (!isSelf && !isAdmin) {
      delete projectObj.owner.email;
    }
  }

  return projectObj;
};

/**
 * Excludes sensitive fields from an array of projects.
 */
const sanitizeProjects = (projects, requester = null) => {
  return projects.map((p) => sanitizeProject(p, requester));
};

/**
 * POST /api/projects
 */
export const createProject = async (req, res, next) => {
  try {
    const { title, description, category, techStack, demoLink, githubLink } = req.body;
    const projectData = { title, description, category, techStack, demoLink, githubLink };
    
    const project = await projectService.createProject(req.user.userId, projectData, req.files);
    return ApiResponse.created(res, sanitizeProject(project, req.user), "Project created successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/projects
 */
export const getProjects = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const filters = {
      category: req.query.category,
      techStack: req.query.techStack,
      status: req.query.status,
    };

    const result = await projectService.getProjects(filters, page, limit, req.user);

    const responseData = {
      projects: sanitizeProjects(result.projects, req.user),
      pagination: {
        page: result.page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };

    return ApiResponse.success(res, responseData, "Projects retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/projects/search
 */
export const searchProjects = async (req, res, next) => {
  try {
    const query = req.query.q;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const filters = {
      category: req.query.category,
      techStack: req.query.techStack,
      status: req.query.status,
    };

    const result = await projectService.searchProjects(query, filters, page, limit, req.user);

    const responseData = {
      projects: sanitizeProjects(result.projects, req.user),
      pagination: {
        page: result.page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };

    return ApiResponse.success(res, responseData, "Projects searched successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/projects/:id
 */
export const getProjectById = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id, req.user);
    
    let isLiked = false;
    if (req.user) {
      isLiked = await likeService.isLiked(req.user.userId, req.params.id);
    }

    const sanitized = sanitizeProject(project, req.user);
    sanitized.isLiked = isLiked;

    return ApiResponse.success(res, sanitized, "Project retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/projects/:id
 */
export const updateProject = async (req, res, next) => {
  try {
    const { title, description, category, techStack, demoLink, githubLink } = req.body;
    const projectData = { title, description, category, techStack, demoLink, githubLink };

    const project = await projectService.updateProject(
      req.params.id,
      req.user.userId,
      req.user.role,
      projectData,
      req.files
    );
    return ApiResponse.success(res, sanitizeProject(project, req.user), "Project updated successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/projects/:id
 */
export const deleteProject = async (req, res, next) => {
  try {
    const result = await projectService.deleteProject(req.params.id, req.user.userId, req.user.role);
    return ApiResponse.success(res, result, "Project deleted successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/projects/:id/status
 */
export const adminUpdateStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    const project = await projectService.adminUpdateStatus(
      req.params.id,
      req.user.userId,
      status,
      rejectionReason
    );
    return ApiResponse.success(res, sanitizeProject(project, req.user), "Project status updated successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/projects/:id/hide
 */
export const hideProject = async (req, res, next) => {
  try {
    const project = await projectService.hideProject(req.params.id, req.user.userId);
    return ApiResponse.success(res, sanitizeProject(project, req.user), "Project hidden successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/projects/:id/resubmit
 */
export const resubmitProject = async (req, res, next) => {
  try {
    const project = await projectService.resubmitProject(req.params.id, req.user.userId);
    return ApiResponse.success(res, sanitizeProject(project, req.user), "Project resubmitted successfully");
  } catch (error) {
    next(error);
  }
};

export default {
  createProject,
  getProjects,
  searchProjects,
  getProjectById,
  updateProject,
  deleteProject,
  adminUpdateStatus,
  hideProject,
  resubmitProject,
};
