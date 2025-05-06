const cloudinary = require("cloudinary").v2;
const Creator = require("../models/Creator");

// Configure Cloudinary with your credentials (if not already configured)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
    : null; // Use uploaded file path, replace with Cloudinary URL if needed

  try {
    // Create the creator linked to the user
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
  const profilePicture = req.file; // File is now in memory

  if (!profilePicture) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    // Upload the image to Cloudinary directly from the buffer
    cloudinary.uploader.upload_stream(
      {
        folder: "dagulearn/profile_pictures", // Store in the profile_pictures folder
        public_id: `${Date.now()}-${profilePicture.originalname}`, // Use unique public_id
      },
      async (error, result) => {
        if (error) {
          console.error("Error uploading to Cloudinary:", error);
          return res.status(500).json({ message: "Failed to upload to Cloudinary" });
        }

        // Find the creator by id
        const creator = await Creator.findByPk(id); // Find creator using Sequelize
        if (!creator) {
          return res.status(404).json({ message: "Creator not found" });
        }

        // Update the creator's profile picture with Cloudinary URL
        creator.profilePicture = result.secure_url;

        try {
          await creator.save();
          res.status(200).json({
            message: "Profile picture updated successfully",
            creator,
          });
        } catch (err) {
          console.error("Error saving creator:", err);
          res.status(500).json({ message: "Failed to save creator's profile" });
        }
      }
    ).end(profilePicture.buffer); // Send the buffer to Cloudinary

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update profile picture" });
  }
};

exports.getCreatorById = async (req, res) => {
  const { id } = req.params;

  try {
    const creator = await Creator.findByPk(id); // Find creator using primary key
    if (!creator) {
      return res.status(404).json({ message: "Creator not found" });
    }
    res.status(200).json({ creator });
  } catch (error) {
    console.error("Error fetching creator by ID:", error);
    res.status(500).json({ message: "Failed to fetch creator data" });
  }
};

exports.updateCreator = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    const creator = await Creator.findOne({ where: { userId } });
    if (!creator) {
      return res.status(404).json({ message: "Creator not found" });
    }

    // If there's an uploaded file (profile picture), handle it
    if (req.file) {
      // Upload the image to Cloudinary directly from the buffer
      const cloudinaryResult = await cloudinary.uploader.upload_stream(
        {
          folder: "dagulearn/profile_pictures", // Store in the profile_pictures folder
          public_id: `${Date.now()}-${req.file.originalname}`, // Use unique public_id
        },
        (error, result) => {
          if (error) {
            console.error("Error uploading to Cloudinary:", error);
            return res.status(500).json({ message: "Failed to upload to Cloudinary" });
          }

          // Update the profile picture URL in the updateData
          updateData.profilePicture = result.secure_url;
        }
      ).end(req.file.buffer);

      // Wait until Cloudinary upload is complete
      if (updateData.profilePicture) {
        await creator.update(updateData);
        return res.status(200).json({ message: "Creator updated", creator });
      } else {
        return res.status(500).json({ message: "Failed to upload profile picture" });
      }
    }

    // If there's no new profile picture, just update the other fields
    await creator.update(updateData);
    res.status(200).json({ message: "Creator updated", creator });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating creator", error: err.message });
  }
};
