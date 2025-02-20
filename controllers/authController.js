const User = require("../models/User");
const Course = require("../models/Course");
const { generateToken, verifyToken } = require("../config/jwt");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  const { name, phoneNumber, gmail, role, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { phoneNumber } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const newUser = await User.create({
      name,
      phoneNumber,
      gmail,
      role,
      password,
    });
    const token = generateToken({
      id: newUser.id,
      phoneNumber: newUser.phoneNumber,
    });

    res.json({ message: "Signup successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Signup failed" });
  }
};

exports.login = async (req, res) => {
  const { phoneNumber, password } = req.body;

  try {
    const user = await User.findOne({ where: { phoneNumber } });

    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    console.log("Entered password:", password);
    console.log("Stored hashed password:", user.password);

    // Compare the entered plain-text password with the hashed password in the DB
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      status: "success",
      message: "Login successful",
      token,
      userId: user.id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      role: user.role,
      gmail: user.gmail,
    });
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

exports.protectedRoute = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);

    // Fetch user details from the database using the user ID from the decoded token
    const user = await User.findByPk(decoded.id, {
      attributes: ["id", "name", "phoneNumber"], // Include only the necessary fields
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "Access granted",
      user: {
        id: user.id,
        name: user.name,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (err) {
    console.error("Error in protected route:", err);
    res.status(401).json({ error: "Unauthorized" });
  }
};

exports.getUserData = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from Authorization header

  if (!token) {
    return res
      .status(401)
      .json({ status: "fail", message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
    const user = await User.findByPk(decoded.id, {
      attributes: ["id", "name", "phoneNumber", "role"], // Select necessary fields
    });

    if (!user) {
      return res
        .status(404)
        .json({ status: "fail", message: "User not found" });
    }

    res.status(200).json({ status: "success", user });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ status: "fail", message: "Internal server error" });
  }
};
