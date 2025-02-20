const path = require("path");
const fs = require("fs");
const Course = require("../models/Course"); // Adjust the import if needed

// Utility function to delete a file
const deleteFile = (filePath) => {
  const fullPath = path.join(__dirname, "..", "public", filePath);
  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
};

// Upload a new banner
exports.uploadBanner = async (req, res) => {
  try {
    const courseId = req.params.id;
    const bannerPath = `/uploads/banner/${req.file.filename}`;

    // Find course by ID
    const course = await Course.findByPk(courseId);
    if (!course) {
      deleteFile(bannerPath); // Clean up uploaded file if course doesn't exist
      return res.status(404).json({ error: "Course not found" });
    }

    // Update the course with the banner path
    course.banner = bannerPath;
    await course.save();

    res.status(200).json({
      message: "Banner uploaded successfully",
      banner: bannerPath,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an existing banner
exports.updateBanner = async (req, res) => {
  try {
    const courseId = req.params.id;
    const bannerPath = `/uploads/banner/${req.file.filename}`;

    // Find course by ID
    const course = await Course.findByPk(courseId);
    if (!course) {
      deleteFile(bannerPath); // Clean up uploaded file if course doesn't exist
      return res.status(404).json({ error: "Course not found" });
    }

    // Delete the old banner if it exists
    if (course.banner) deleteFile(course.banner);

    // Update with the new banner path
    course.banner = bannerPath;
    await course.save();

    res.status(200).json({
      message: "Banner updated successfully",
      banner: bannerPath,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a banner
exports.deleteBanner = async (req, res) => {
  try {
    const courseId = req.params.id;

    // Find course by ID
    const course = await Course.findByPk(courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });

    if (course.banner) {
      deleteFile(course.banner); // Delete the banner file
      course.banner = null; // Reset banner field in the database
      await course.save();
    }

    res.status(200).json({ message: "Banner deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
