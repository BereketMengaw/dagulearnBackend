const User = require("../models/User"); // Adjust the path if necessary
const Creator = require("../models/Creator");

exports.createCreator = async (req, res) => {
  const {
    userId,
    bio,
    educationLevel,
    experience,
    skills,
    location,
    socialLinks,
    bankAccount,
    bankType, // New field
  } = req.body;

  const profilePicture = req.file
    ? `/uploads/profile_pictures/${req.file.filename}`
    : null; // Use uploaded file path

  try {
    // Now create the creator linked to the user
    const newCreator = await Creator.create({
      userId,
      bio,
      profilePicture,
      educationLevel,
      experience,
      skills,
      location,
      socialLinks,
      bankAccount,
      bankType, // Include the new field
      // Link the creator to the newly created user
    });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      creator: newCreator,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create creator" });
  }
};

exports.updateProfilePicture = async (req, res) => {
  const { id } = req.params;
  const profilePicture = req.file
    ? `/uploads/profile_pictures/${req.file.filename}`
    : null;

  if (!profilePicture) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    // Find the creator by ID
    const creator = await Creator.findByPk(id);

    if (!creator) {
      return res.status(404).json({ message: "Creator not found" });
    }

    // Update profile picture
    creator.profilePicture = profilePicture;
    await creator.save();

    res
      .status(200)
      .json({ message: "Profile picture updated successfully", creator });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update profile picture" });
  }
};

exports.getCreatorByUserId = async (req, res) => {
  const { userId } = req.params; // Get the user ID from request parameters

  try {
    // Find the creator using userId
    const creator = await Creator.findOne({ where: { userId } });

    // Check if the creator exists
    if (!creator) {
      return res.status(404).json({ message: "Creator not found" });
    }

    // Return the creator data
    res.status(200).json({ creator });
  } catch (error) {
    console.error("Error fetching creator by userId:", error);
    res.status(500).json({ message: "Failed to fetch creator data" });
  }
};

exports.updateCreator = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    // Find the creator by userId
    let creator = await Creator.findOne({ where: { userId } });

    if (!creator) {
      return res.status(404).json({ message: "Creator not found" });
    }

    // Update the creator record
    await creator.update(updateData);

    console.log(updateData);

    res
      .status(200)
      .json({ message: "Creator profile updated successfully", creator });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
