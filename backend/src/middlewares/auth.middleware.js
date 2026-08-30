import jwt from "jsonwebtoken";
import jwksRsa from "jwks-rsa";
import env from "../config/env.js";
import { userRepository } from "../container/container.js";
import AuthenticationException from "../exceptions/authentication.exception.js";
import AuthorizationException from "../exceptions/authorization.exception.js";

// JWKS Client for retrieving Auth0 signing keys
const jwksClient = jwksRsa({
  jwksUri: `https://${env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 10,
});

// Helper to get signing key
const getKey = (header, callback) => {
  jwksClient.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
    } else {
      const signingKey = key.getPublicKey();
      callback(null, signingKey);
    }
  });
};

// Helper to extract token from Authorization header
const extractTokenFromRequest = (req) => {
  if (req.headers && req.headers.authorization) {
    const parts = req.headers.authorization.split(" ");
    if (parts.length === 2 && parts[0] === "Bearer") {
      return parts[1];
    }
  }
  return null;
};

// Main token verification helper
const verifyAccessToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        audience: env.AUTH0_AUDIENCE,
        issuer: env.AUTH0_ISSUER,
        algorithms: ["RS256"],
      },
      (err, decoded) => {
        if (err) {
          reject(new AuthenticationException(`Token validation failed: ${err.message}`));
        } else {
          resolve(decoded);
        }
      }
    );
  });
};

/**
 * Authentication middleware that verifies the Auth0 access token and attaches the DB user to req.user.
 */
export const authenticate = async (req, res, next) => {
  try {
    // ── Mock Auth for Testing ──
    if (env.NODE_ENV === "test" && req.headers["x-test-user-sub"]) {
      const mockSub = req.headers["x-test-user-sub"];
      const user = await userRepository.findOne({ auth0Sub: mockSub });
      if (!user) {
        req.user = {
          auth0Sub: mockSub,
          email: "test@test.com",
          name: "Test User",
          role: "STUDENT",
        };
        return next();
      }
      req.user = {
        userId: user._id,
        auth0Sub: user.auth0Sub,
        email: user.email,
        name: user.name,
        role: user.role,
      };
      return next();
    }

    const token = extractTokenFromRequest(req);
    if (!token) {
      throw new AuthenticationException("Access token is missing");
    }

    const decoded = await verifyAccessToken(token);
    
    // Look up the database user by auth0Sub
    const user = await userRepository.findOne({ auth0Sub: decoded.sub });
    if (!user) {
      // Allow auth middleware to pass sub info so `/api/auth/me` can auto-register the user
      req.user = {
        auth0Sub: decoded.sub,
        email: decoded.email || "",
        name: decoded.name || "",
        role: "STUDENT", // default role placeholder
      };
      return next();
    }

    if (!user.isActive) {
      throw new AuthorizationException("Account is deactivated");
    }

    req.user = {
      userId: user._id,
      auth0Sub: user.auth0Sub,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication middleware that attempts to verify token but does not fail if missing.
 */
export const optionalAuthenticate = async (req, res, next) => {
  try {
    if (env.NODE_ENV === "test" && req.headers["x-test-user-sub"]) {
      const mockSub = req.headers["x-test-user-sub"];
      const user = await userRepository.findOne({ auth0Sub: mockSub });
      if (user && user.isActive) {
        req.user = {
          userId: user._id,
          auth0Sub: user.auth0Sub,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      } else {
        req.user = null;
      }
      return next();
    }

    const token = extractTokenFromRequest(req);
    if (token) {
      const decoded = await verifyAccessToken(token);
      const user = await userRepository.findOne({ auth0Sub: decoded.sub });
      if (user && user.isActive) {
        req.user = {
          userId: user._id,
          auth0Sub: user.auth0Sub,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      } else {
        req.user = null;
      }
    } else {
      req.user = null;
    }
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

/**
 * Authorization middleware checks if the user has one of the allowed database roles.
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        throw new AuthenticationException("User is not authenticated");
      }
      if (!roles.includes(req.user.role)) {
        throw new AuthorizationException("Not authorized to access this resource");
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default {
  authenticate,
  optionalAuthenticate,
  authorize,
};
