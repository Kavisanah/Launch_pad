import adminService from "../services/admin.service.js";
import projectService from "../services/project.service.js";
import ApiResponse from "../utils/api-response.js";

/**
 * Excludes sensitive fields (googleId, __v) from a user object.
 */
const sanitizeUser = (user) => {
  if (!user) return null;
  const userObj = typeof user.toObject === "function" ? user.toObject() : { ...user };
  delete userObj.auth0Sub;
  delete userObj.__v;
  return userObj;
};

/**
 * Excludes sensitive fields from a project and its nested owner.
 */
const sanitizeProject = (project) => {
  if (!project) return null;
  const projectObj = typeof project.toObject === "function" ? project.toObject() : { ...project };
  delete projectObj.__v;
  if (projectObj.owner) {
    projectObj.owner = sanitizeUser(projectObj.owner);
  }
  return projectObj;
};

/**
 * GET /api/admin/dashboard
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    return ApiResponse.success(res, stats, "Dashboard stats retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/users
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const filters = {
      role: req.query.role,
      isActive: req.query.isActive,
      search: req.query.search,
    };

    const result = await adminService.getAllUsers(filters, page, limit);

    const responseData = {
      users: result.users.map(sanitizeUser),
      pagination: {
        page: result.page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };

    return ApiResponse.success(res, responseData, "Users retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/users/:id
 */
export const getUserById = async (req, res, next) => {
  try {
    const { user, followStats, projectCount } = await adminService.getUserById(req.params.id);
    
    const sanitized = sanitizeUser(user);
    sanitized.followStats = followStats;
    sanitized.projectCount = projectCount;

    return ApiResponse.success(res, sanitized, "User details retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/users/:id/role
 */
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await adminService.updateUserRole(req.user.userId, req.params.id, role);
    return ApiResponse.success(res, sanitizeUser(user), "User role updated successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/users/:id/deactivate
 */
export const deactivateUser = async (req, res, next) => {
  try {
    const user = await adminService.deactivateUser(req.user.userId, req.params.id);
    return ApiResponse.success(res, sanitizeUser(user), "User deactivated successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/users/:id/reactivate
 */
export const reactivateUser = async (req, res, next) => {
  try {
    const user = await adminService.reactivateUser(req.user.userId, req.params.id);
    return ApiResponse.success(res, sanitizeUser(user), "User reactivated successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/projects
 */
export const getAllProjects = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const filters = {
      status: req.query.status,
      category: req.query.category,
      owner: req.query.owner,
    };

    const result = await adminService.getAllProjects(filters, page, limit);

    const responseData = {
      projects: result.projects.map(sanitizeProject),
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
 * PATCH /api/admin/projects/:id/status
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
    return ApiResponse.success(res, sanitizeProject(project), "Project status updated successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/projects/:id
 */
export const deleteProject = async (req, res, next) => {
  try {
    await projectService.deleteProject(req.params.id, req.user.userId, req.user.role);
    return ApiResponse.success(res, null, "Project deleted permanently");
  } catch (error) {
    next(error);
  }
};

export default {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUserRole,
  deactivateUser,
  reactivateUser,
  getAllProjects,
  adminUpdateStatus,
  deleteProject,
};
