const Creator = require("../models/Creator"); // Ensure this matches your Creator model

const checkCreatorMiddleware = async (req, res, next) => {
  try {
    const userId = req.user.id; // Get user ID from `authMiddleware`

    // Check if the user is already a creator
    const existingCreator = await Creator.findOne({ where: { userId } });

    if (existingCreator) {
      return res
        .status(400)
        .json({ message: "You are already registered as a creator." });
    }

    // Ensure only users with role 'creator' can proceed
    if (req.user.role !== "creator") {
      return res
        .status(403)
        .json({ message: "You are not allowed to register as a creator." });
    }

    next(); // Move to the next function (e.g., controller)
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = checkCreatorMiddleware;
