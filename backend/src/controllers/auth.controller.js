import authService from "../services/auth.service.js";
import ApiResponse from "../utils/api-response.js";

/**
 * Excludes sensitive fields from the user object.
 */
const sanitizeUser = (user) => {
  const userObj = typeof user.toObject === "function" ? user.toObject() : { ...user };
  delete userObj.__v;
  return userObj;
};

/**
 * Returns current authenticated user profile, auto-registering if they don't exist yet.
 */
export const getMe = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const rawToken = authHeader.split(" ")[1] || "";
    
    // Call the service to find or create the user record based on req.user claims
    const user = await authService.getMe(req.user, rawToken);
    
    return ApiResponse.success(res, sanitizeUser(user), "User profile retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export default {
  getMe,
};
