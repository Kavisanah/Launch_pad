import { userRepository } from "../container/container.js";
import env from "../config/env.js";
import AuthorizationException from "../exceptions/authorization.exception.js";

/**
 * Fetches user profile by auth0Sub, auto-registering on first login.
 * @param {Object} tokenUser - The decoded token user payload from auth middleware
 * @param {string} rawToken - The raw Bearer token for /userinfo fetching if necessary
 * @returns {Promise<Object>} The user profile
 */
export const getMe = async (tokenUser, rawToken) => {
  let user = await userRepository.findOne({ auth0Sub: tokenUser.auth0Sub });
  
  if (!user) {
    let email = tokenUser.email;
    let name = tokenUser.name;
    let profilePicture = "";

    // Sync profile fields from /userinfo if they are not in the token
    if ((!email || !name) && rawToken) {
      try {
        const response = await fetch(`https://${env.AUTH0_DOMAIN}/userinfo`, {
          headers: { Authorization: `Bearer ${rawToken}` },
        });
        if (response.ok) {
          const info = await response.json();
          email = email || info.email;
          name = name || info.name || info.nickname || "New Student";
          profilePicture = info.picture || "";
        }
      } catch (err) {
        console.error("Failed to query /userinfo:", err.message);
      }
    }

    // Auto-register user as STUDENT
    user = await userRepository.create({
      auth0Sub: tokenUser.auth0Sub,
      name: name || "New Student",
      email: email || `${tokenUser.auth0Sub}@student.com`,
      profilePicture: profilePicture || "",
      role: "STUDENT",
      isActive: true,
    });
  } else {
    if (!user.isActive) {
      throw new AuthorizationException("Account is deactivated");
    }
  }

  return user;
};

export default {
  getMe,
};
