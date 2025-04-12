const jwt = require("jsonwebtoken");

// Use the JWT_SECRET environment variable for production
const secretKey = process.env.JWT_SECRET || "your_secret_key"; // Default to a hardcoded key for local development

const generateToken = (payload, expiresIn = "1d") => {
  return jwt.sign(payload, secretKey, { expiresIn });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, secretKey);
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
};

module.exports = { generateToken, verifyToken };
