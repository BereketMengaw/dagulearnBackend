const jwt = require("jsonwebtoken");

const secretKey = "your_secret_key"; // Replace with an environment variable in production

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
