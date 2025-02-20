const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Adjust if needed

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader)
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });

    // Ensure the token follows "Bearer TOKEN" format
    const token = authHeader.split(" ")[1];
    if (!token)
      return res.status(401).json({ message: "Invalid token format." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded); // ✅ Debugging log

    // Ensure userId matches the payload structure from login
    const user = await User.findByPk(decoded.userId);
    if (!user) return res.status(401).json({ message: "Invalid user." });

    req.user = user;
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    res.status(401).json({ message: "Invalid token." });
  }
};

module.exports = authMiddleware;
