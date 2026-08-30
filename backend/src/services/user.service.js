import { userRepository, projectRepository } from "../container/container.js";
import followService from "./follow.service.js";
import { uploadImage, deleteImage, extractPublicId } from "../utils/cloudinary.js";
import NotFoundException from "../exceptions/not-found.exception.js";
import ValidationException from "../exceptions/validation.exception.js";
import AuthorizationException from "../exceptions/authorization.exception.js";
import { sanitizeInput } from "../utils/sanitization.js";

/**
 * Validates and sanitizes pagination values.
 */
const validatePagination = (page, limit) => {
  const p = Number(page);
  const l = Number(limit);

  if (isNaN(p) || isNaN(l) || p <= 0 || l <= 0 || !Number.isInteger(p) || !Number.isInteger(l)) {
    throw new ValidationException("Page and limit must be positive integers");
  }
  if (l > 50) {
    throw new ValidationException("Limit cannot exceed 50");
  }
  return { page: p, limit: l };
};

/**
 * Retrieves a user profile along with follow stats and their count of approved projects.
 */
export const getProfile = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user || !user.isActive) {
    throw new NotFoundException("Active user not found");
  }

  const followStats = await followService.getFollowStats(userId);
  const projectCount = await projectRepository.count({ owner: userId, status: "APPROVED" });

  return { user, followStats, projectCount };
};

/**
 * Updates editable user profile details and replaces old Cloudinary profile pictures.
 */
export const updateProfile = async (userId, requestingUserId, data, file) => {
  // Enforce profile ownership check
  if (userId.toString() !== requestingUserId.toString()) {
    throw new AuthorizationException("You are not authorized to update this profile");
  }

  const user = await userRepository.findById(userId);
  if (!user || !user.isActive) {
    throw new NotFoundException("Active user not found");
  }

  const updateData = {};
  if (data.name !== undefined) {
    const sanitizedName = sanitizeInput(data.name);
    if (sanitizedName === "") {
      throw new ValidationException("Name cannot be empty");
    }
    updateData.name = sanitizedName;
  }
  if (data.bio !== undefined) {
    updateData.bio = sanitizeInput(data.bio);
  }
  if (data.university !== undefined) {
    updateData.university = sanitizeInput(data.university);
  }
  if (data.department !== undefined) {
    updateData.department = sanitizeInput(data.department);
  }
  if (data.graduationYear !== undefined) {
    updateData.graduationYear = Number(data.graduationYear) || undefined;
  }

  // If a profile picture file is uploaded
  if (file) {
    // Delete old profile picture if exists
    if (user.profilePicture) {
      const publicId = extractPublicId(user.profilePicture);
      if (publicId) {
        await deleteImage(publicId).catch((err) =>
          console.error(`Failed to delete old profile picture: ${err.message}`)
        );
      }
    }
    
    // Upload new profile picture
    updateData.profilePicture = await uploadImage(file.buffer, "profiles");
  }

  return await userRepository.updateById(userId, updateData);
};

/**
 * Retrieves a user's projects with pagination.
 */
export const getUserProjects = async (userId, requestingUserId = null, page = 1, limit = 12) => {
  const { page: p, limit: l } = validatePagination(page, limit);

  const user = await userRepository.findById(userId);
  if (!user || !user.isActive) {
    throw new NotFoundException("Active user not found");
  }

  const query = { owner: userId };
  
  const isSelf = requestingUserId && requestingUserId.toString() === userId.toString();
  if (!isSelf) {
    query.status = "APPROVED";
  }

  return await projectRepository.findWithPagination(query, p, l);
};

/**
 * Self deactivates user profile, hiding all of their projects.
 */
export const deactivateAccount = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user || !user.isActive) {
    throw new NotFoundException("Active user not found");
  }

  // Set user state to inactive
  await userRepository.updateById(userId, { isActive: false });

  // Hide all of their projects
  await projectRepository.model.updateMany(
    { owner: userId },
    { status: "HIDDEN" }
  );

  return { success: true };
};

export default {
  getProfile,
  updateProfile,
  getUserProjects,
  deactivateAccount,
};
