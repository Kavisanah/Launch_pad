import { userRepository } from "../container/container.js";
import userService from "../services/user.service.js";
import followService from "../services/follow.service.js";
import ApiResponse from "../utils/api-response.js";
import NotFoundException from "../exceptions/not-found.exception.js";

/**
 * Sanitizes the user object to exclude private credentials.
 * Strips email unless the requester is the user themselves or an Admin.
 */
const sanitizeUser = (user, requester = null) => {
  if (!user) return null;
  const userObj = typeof user.toObject === "function" ? user.toObject() : { ...user };
  delete userObj.auth0Sub;
  delete userObj.__v;

  const targetUserId = (userObj._id || userObj.id || "").toString();
  const isSelf = requester && requester.userId.toString() === targetUserId;
  const isAdmin = requester && requester.role === "ADMIN";

  if (!isSelf && !isAdmin) {
    delete userObj.email;
  }
  return userObj;
};

/**
 * GET /api/users/me
 * Retrieves current authenticated user profile, with follow counts and projects counts.
 */
export const getMyProfile = async (req, res, next) => {
  try {
    const { user, followStats, projectCount } = await userService.getProfile(req.user.userId);
    
    const sanitized = sanitizeUser(user, req.user);
    sanitized.followStats = followStats;
    sanitized.projectCount = projectCount;

    return ApiResponse.success(res, sanitized, "My profile retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/users/me
 * Updates own profile details and uploads avatar.
 */
export const updateProfile = async (req, res, next) => {
  try {
    const user = await userService.updateProfile(req.user.userId, req.user.userId, req.body, req.file);
    return ApiResponse.success(res, sanitizeUser(user, req.user), "Profile updated successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/:id
 * Retrieves public user profile details, follow stats, projects counts, and relationship stats.
 */
export const getUserProfile = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const { user, followStats, projectCount } = await userService.getProfile(targetUserId);

    let isFollowing = false;
    if (req.user) {
      isFollowing = await followService.isFollowing(req.user.userId, targetUserId);
    }

    const sanitized = sanitizeUser(user, req.user);
    sanitized.followStats = followStats;
    sanitized.projectCount = projectCount;
    sanitized.isFollowing = isFollowing;

    return ApiResponse.success(res, sanitized, "User profile retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/:id/projects
 * Retrieves paginated list of projects belonging to a user.
 */
export const getUserProjects = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const requestingUserId = req.user ? req.user.userId : null;

    const result = await userService.getUserProjects(req.params.id, requestingUserId, page, limit);

    const sanitizeProject = (project) => {
      const projectObj = typeof project.toObject === "function" ? project.toObject() : { ...project };
      delete projectObj.__v;
      if (projectObj.owner) {
        projectObj.owner = sanitizeUser(projectObj.owner, req.user);
      }
      return projectObj;
    };

    const responseData = {
      projects: result.projects.map(sanitizeProject),
      pagination: {
        page: result.page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };

    return ApiResponse.success(res, responseData, "User projects retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export default {
  getMyProfile,
  updateProfile,
  getUserProfile,
  getUserProjects,
};
