const verifyToken = require("../config/jwt").verifyToken; // Import JWT verification

const roleMiddleware = (requiredRole) => {
  return (req, res, next) => {
    // Ensure req.user exists (authentication middleware must be used before this)
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized. Token missing or invalid." });
    }

    // Check if the user has the required role
    if (req.user.role !== requiredRole) {
      return res
        .status(403)
        .json({ message: "Access forbidden. Insufficient permissions." });
    }

    next(); // Proceed if authorized
  };
};

module.exports = roleMiddleware;
