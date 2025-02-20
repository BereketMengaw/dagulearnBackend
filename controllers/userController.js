const User = require("../models/User");
const bcrypt = require("bcrypt"); // For password hashing

// Helper function to format responses
const formatResponse = (status, message, data = null) => {
  return { status, message, data };
};

// Create a new user
exports.createUser = async (req, res) => {
  try {
    console.log("Request body:", req.body); // Log incoming data
    const { name, phoneNumber, gmail, role, password } = req.body;

    // Validate input fields
    if (!name || name.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "Name is required and cannot be empty.",
      });
    }

    if (!phoneNumber) {
      return res.status(400).json({
        status: "error",
        message: "Phone number is required.",
      });
    }

    // Validate phone number format (Ethiopian phone number pattern)
    const phoneRegex = /^\+251[1-9]\d{8}$/; // Example: +251912345678
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({
        status: "error",
        message:
          "Phone number format is not correct. Use +251 followed by 9 digits.",
      });
    }

    if (!gmail || !/^[\w-.]+@[\w-]+\.[a-z]{2,4}$/.test(gmail)) {
      return res.status(400).json({
        status: "error",
        message: "Valid Gmail address is required.",
      });
    }

    if (
      !role ||
      (role !== "student" && role !== "creator" && role !== "admin")
    ) {
      return res.status(400).json({
        status: "error",
        message:
          "Role is required and must be either 'student' or 'creator' or 'admin' .",
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        status: "error",
        message: "Password is required and must be at least 6 characters long.",
      });
    }

    // Check for unique phone number
    const existingPhoneNumber = await User.findOne({ where: { phoneNumber } });
    if (existingPhoneNumber) {
      return res.status(400).json({
        status: "error",
        message:
          "Phone number already exists. Please use a different phone number.",
      });
    }

    // Check for unique Gmail address
    const existingGmail = await User.findOne({ where: { gmail } });
    if (existingGmail) {
      return res.status(400).json({
        status: "error",
        message:
          "Gmail address already exists. Please use a different Gmail address.",
      });
    }

    const user = await User.create({
      name,
      phoneNumber,
      gmail,
      role,
      password,
    });

    res.status(201).json({ status: "success", message: "User created", user });
  } catch (error) {
    console.error("Error creating user:", error.message); // Log detailed error
    res.status(400).json({
      status: "error",
      message: "Error creating user. Please ensure all fields are valid.",
      data: error.message,
    });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res
      .status(200)
      .json(formatResponse("success", "Users fetched successfully", users));
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res
      .status(500)
      .json(formatResponse("error", "Error fetching users", error.message));
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json(formatResponse("error", "Invalid user ID"));
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json(formatResponse("error", "User not found"));
    }

    res
      .status(200)
      .json(formatResponse("success", "User fetched successfully", user));
  } catch (error) {
    console.error("Error fetching user:", error.message);
    res
      .status(500)
      .json(formatResponse("error", "Error fetching user", error.message));
  }
};

// Update user by ID
exports.updateUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json(formatResponse("error", "Invalid user ID"));
    }

    const { name, phoneNumber, role, password } = req.body;

    // Find the user by ID
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json(formatResponse("error", "User not found"));
    }

    // Update fields
    if (name) user.name = name;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (role) user.role = role;

    if (password) {
      user.password = password;
    }

    // Save the updated user
    await user.save();

    res
      .status(200)
      .json(formatResponse("success", "User updated successfully", user));
  } catch (error) {
    console.error("Error updating user:", error.message);
    res
      .status(500)
      .json(formatResponse("error", "Error updating user", error.message));
  }
};

// Delete user by ID
exports.deleteUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json(formatResponse("error", "Invalid user ID"));
    }

    // Find the user by ID
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json(formatResponse("error", "User not found"));
    }

    // Delete the user
    await user.destroy();

    res
      .status(200)
      .json(
        formatResponse("success", `User with ID ${id} deleted successfully`)
      );
  } catch (error) {
    console.error("Error deleting user:", error.message);
    res
      .status(500)
      .json(formatResponse("error", "Error deleting user", error.message));
  }
};
