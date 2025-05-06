const cloudinary = require("cloudinary").v2;
const Creator = require("../models/Creator");
const User = require("../models/User");


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

exports.updateCreatorData = async (req, res) => {
  try {
    const { userId } = req.params;

    const creator = await Creator.findOne({ where: { userId } });
    if (!creator) {
      return res.status(404).json({ message: "Creator not found" });
    }

    const allowedFields = [
      "bio",
      "educationLevel",
      "experience",
      "skills",
      "location",
      "socialLinks",
      "bankAccount",
      "bankType",
    ];

    const updateData = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) updateData[key] = req.body[key];
    }

    creator.set(updateData);
    await creator.save();

    res.status(200).json({ message: "Creator data updated", creator });
  } catch (err) {
    console.error("Error updating creator data:", err);
    res.status(500).json({ message: "Error updating creator data", error: err.message });
  }
};



exports.getCreatorById = async (req, res) => {
  const { id } = req.params; // This should now be userId

  try {
    const creator = await Creator.findOne({ where: { userId: id } }); // Use userId as lookup
    if (!creator) {
      return res.status(404).json({ message: "Creator not found" });
    }
    res.status(200).json({ creator });
  } catch (error) {
    console.error("Error fetching creator by userId:", error);
    res.status(500).json({ message: "Failed to fetch creator data" });
  }
};



exports.updateProfilePicture = async (req, res) => {
  try {
    const { userId } = req.params;

    const creator = await Creator.findOne({ where: { userId } });
    if (!creator) {
      return res.status(404).json({ message: "Creator not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const cloudinaryUpload = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "dagulearn/profile_pictures",
            public_id: `${Date.now()}-${req.file.originalname}`,
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

    const result = await cloudinaryUpload();
    creator.profilePicture = result.secure_url;
    await creator.save();

    res.status(200).json({ message: "Profile picture updated", creator });
  } catch (err) {
    console.error("Error updating profile picture:", err);
    res.status(500).json({ message: "Error updating profile picture - size limit", error: err.message });
  }
};


exports.getAllCreators = async (req, res) => {
  try {
    const creators = await Creator.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'name'], // Include user fields if needed
        }
      ]
    });

    res.status(200).json({ creators });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching creators', error: err.message });
  }
};


exports.deleteCreator = async (req, res) => {
  const { userId } = req.params;

  try {
    const deletedCount = await Creator.destroy({
      where: { userId }
    });

    if (deletedCount === 0) {
      return res.status(404).json({ message: 'Creator not found' });
    }

    res.status(200).json({ message: 'Creator deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting creator', error: err.message });
  }
};


