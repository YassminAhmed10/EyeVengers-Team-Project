import admin from "firebase-admin";

/**
 * Firebase Authentication Middleware
 * Verifies Bearer token from Authorization header and attaches user info to request
 */
export const firebaseAuthMiddleware = async (req, res, next) => {
  const token = getTokenFromHeader(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Missing or malformed authorization token",
    });
  }

  try {
    // Verify the token using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Attach user information to request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      issuedAtTime: new Date(decodedToken.iat * 1000),
      expirationTime: new Date(decodedToken.exp * 1000),
    };

    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);

    // Handle different error scenarios
    if (error.code === "auth/id-token-expired") {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please log in again.",
      });
    } else if (error.code === "auth/id-token-revoked") {
      return res.status(401).json({
        success: false,
        message: "Token has been revoked. Please log in again.",
      });
    } else if (error.code === "auth/invalid-id-token") {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    } else {
      return res.status(403).json({
        success: false,
        message: "Authentication failed",
      });
    }
  }
};

/**
 * Extract Bearer token from Authorization header
 * @param {Object} req - Express request object
 * @returns {string|null} Token or null
 */
function getTokenFromHeader(req) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
}

/**
 * Optional: Middleware to check if user is admin (requires custom claim)
 */
export const firebaseAdminMiddleware = async (req, res, next) => {
  // First verify the token
  await firebaseAuthMiddleware(req, res, () => {
    // Check if user has admin claim
    if (req.user && req.user.admin) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }
  });
};

/**
 * Optional: Middleware to check specific role claim
 * @param {string} requiredRole - The role required to access the endpoint
 */
export const firebaseRoleMiddleware = (requiredRole) => {
  return async (req, res, next) => {
    // First verify the token
    await firebaseAuthMiddleware(req, res, () => {
      // Check if user has required role claim
      if (req.user && req.user.role === requiredRole) {
        next();
      } else {
        return res.status(403).json({
          success: false,
          message: `${requiredRole} access required`,
        });
      }
    });
  };
};
