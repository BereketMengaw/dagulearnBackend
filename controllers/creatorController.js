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

exports.updateCreator = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    const creator = await Creator.findOne({ where: { userId } });
    if (!creator) {
      return res.status(404).json({ message: "Creator not found" });
    }

    // If there's an uploaded file (profile picture), handle Cloudinary upload with Promise
    if (req.file) {
      const cloudinaryUpload = () =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "dagulearn/profile_pictures",
              public_id: `${Date.now()}-${req.file.originalname}`,
            },
            (error, result) => {
              if (error) {
                return reject(error);
              }
              resolve(result);
            }
          );
          stream.end(req.file.buffer);
        });

      try {
        const result = await cloudinaryUpload();
        updateData.profilePicture = result.secure_url;
      } catch (uploadErr) {
        console.error("Cloudinary upload error:", uploadErr);
        return res.status(500).json({ message: "Failed to upload profile picture" });
      }
    }

    // Update the creator
    await creator.update(updateData);
    res.status(200).json({ message: "Creator updated", creator });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating creator", error: err.message });
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


