import followService from "../services/follow.service.js";
import ApiResponse from "../utils/api-response.js";

/**
 * Sanitizes follower relationship records.
 * Strips email unless the requester is the user themselves or an Admin.
 */
const sanitizeFollowRecord = (follow, requester = null) => {
  if (!follow) return null;
  const followObj = typeof follow.toObject === "function" ? follow.toObject() : { ...follow };
  delete followObj.__v;

  const checkAndSanitize = (user) => {
    if (!user) return null;
    let userObj = typeof user.toObject === "function" ? user.toObject() : { ...user };
    delete userObj.auth0Sub;
    delete userObj.__v;

    const userId = (userObj._id || userObj.id || "").toString();
    const isSelf = requester && requester.userId.toString() === userId;
    const isAdmin = requester && requester.role === "ADMIN";
    if (!isSelf && !isAdmin) {
      delete userObj.email;
    }
    return userObj;
  };

  if (followObj.follower) {
    followObj.follower = checkAndSanitize(followObj.follower);
  }

  if (followObj.following) {
    followObj.following = checkAndSanitize(followObj.following);
  }

  return followObj;
};

const sanitizeFollowRecords = (records, requester = null) => {
  return records.map((r) => sanitizeFollowRecord(r, requester));
};

/**
 * POST /api/users/:id/follow
 */
export const toggleFollow = async (req, res, next) => {
  try {
    const result = await followService.toggleFollow(req.user.userId, req.params.id);
    const message = result.following ? "User followed successfully" : "User unfollowed successfully";
    return ApiResponse.success(res, result, message);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/:id/followers
 */
export const getFollowers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    const result = await followService.getFollowers(req.params.id, page, limit);

    const responseData = {
      followers: sanitizeFollowRecords(result.followers, req.user),
      pagination: {
        page: result.page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };

    return ApiResponse.success(res, responseData, "Followers retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/:id/following
 */
export const getFollowing = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    const result = await followService.getFollowing(req.params.id, page, limit);

    const responseData = {
      following: sanitizeFollowRecords(result.following, req.user),
      pagination: {
        page: result.page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };

    return ApiResponse.success(res, responseData, "Following retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/:id/follow-stats
 */
export const getFollowStats = async (req, res, next) => {
  try {
    const stats = await followService.getFollowStats(req.params.id);
    return ApiResponse.success(res, stats, "Follow stats retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export default {
  toggleFollow,
  getFollowers,
  getFollowing,
  getFollowStats,
};
