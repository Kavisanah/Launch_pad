import likeService from "../services/like.service.js";
import ApiResponse from "../utils/api-response.js";

/**
 * Sanitizes a like object and its nested user details.
 * Strips email unless the requester is the user themselves or an Admin.
 */
const sanitizeLike = (like, requester = null) => {
  if (!like) return null;
  const likeObj = typeof like.toObject === "function" ? like.toObject() : { ...like };
  delete likeObj.__v;

  if (likeObj.user) {
    if (typeof likeObj.user.toObject === "function") {
      likeObj.user = likeObj.user.toObject();
    } else {
      likeObj.user = { ...likeObj.user };
    }
    delete likeObj.user.auth0Sub;
    delete likeObj.user.__v;

    // Email privacy: only show email to user self or Admin
    const userId = (likeObj.user._id || likeObj.user.id || "").toString();
    const isSelf = requester && requester.userId.toString() === userId;
    const isAdmin = requester && requester.role === "ADMIN";
    if (!isSelf && !isAdmin) {
      delete likeObj.user.email;
    }
  }
  return likeObj;
};

const sanitizeLikes = (likes, requester = null) => {
  return likes.map((l) => sanitizeLike(l, requester));
};

/**
 * POST /api/projects/:id/like
 */
export const toggleLike = async (req, res, next) => {
  try {
    const result = await likeService.toggleLike(req.user.userId, req.params.id);
    const message = result.liked ? "Project liked successfully" : "Project unliked successfully";
    return ApiResponse.success(res, result, message);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/projects/:id/likes
 */
export const getProjectLikes = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    const result = await likeService.getProjectLikes(req.params.id, page, limit);

    const responseData = {
      likes: sanitizeLikes(result.likes, req.user),
      pagination: {
        page: result.page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };

    return ApiResponse.success(res, responseData, "Project likes retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export default {
  toggleLike,
  getProjectLikes,
};
