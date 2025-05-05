const Course = require("../models/Course");
const User = require("../models/User");
const Category = require("../models/Category");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");

const { Op } = require("sequelize");

// Setup multer for file uploads
const upload = multer({ dest: "public/uploads/thumbnails/" });

exports.createCourse = async (req, res) => {
  try {
    const { title, description, price, categoryId, creatorId } = req.body;

    // Validate incoming data
    if (!title || !description || !price || !categoryId || !creatorId) {
      return res.status(400).json({
        error: "Title, description, price, category, and creator are required.",
      });
    }

    // Create the course without a thumbnail
    const course = await Course.create({
      title,
      description,
      price,
      categoryId,
      creatorId,
    });

    res.status(201).json({ message: "Course created successfully", course });
  } catch (error) {
    console.error("Error creating course:", error.message);
    res
      .status(500)
      .json({ error: "Error creating course", details: error.message });
  }
};

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      include: [
        { model: User, as: "creator", attributes: ["name"] },
        { model: Category, as: "category", attributes: ["name"] },
      ],
    });

    if (!courses.length) {
      return res.status(404).json({ message: "No courses found" });
    }

    res.status(200).json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error.message);
    res
      .status(500)
      .json({ error: "Error fetching courses", details: error.message });
  }
};

// Get course by ID
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [
        { model: User, as: "creator", attributes: ["name"] },
        { model: Category, as: "category", attributes: ["name"] },
      ],
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json(course);
  } catch (error) {
    console.error("Error fetching course:", error.message);
    res
      .status(500)
      .json({ error: "Error fetching course", details: error.message });
  }
};

// Update course by ID
exports.updateCourse = async (req, res) => {
  try {
    const { title, description, price, categoryId, creatorId } = req.body;
    const courseId = req.params.id;

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    course.title = title || course.title;
    course.description = description || course.description;
    course.price = price || course.price;
    course.categoryId = categoryId || course.categoryId;
    course.creatorId = creatorId || course.creatorId;

    await course.save();

    res.status(200).json({ message: "Course updated successfully", course });
  } catch (error) {
    console.error("Error updating course:", error.message);
    res
      .status(500)
      .json({ error: "Error updating course", details: error.message });
  }
};

// Delete course by ID
exports.deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (course.thumbnail) {
      const thumbnailPath = path.join("public", course.thumbnail);
      if (fs.existsSync(thumbnailPath)) fs.unlinkSync(thumbnailPath);
    }

    await course.destroy();

    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error.message);
    res
      .status(500)
      .json({ error: "Error deleting course", details: error.message });
  }
};

// Get courses by creator
exports.getCoursesByCreator = async (req, res) => {
  const { creatorId } = req.params;

  try {
    const courses = await Course.findAll({
      where: { creatorId },
      include: { model: Category, as: "category", attributes: ["name"] },
    });

    if (!courses.length) {
      return res
        .status(404)
        .json({ message: "No courses found for this creator" });
    }

    res.status(200).json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error.message);
    res
      .status(500)
      .json({ error: "Error fetching courses", details: error.message });
  }
};

// Upload thumbnail for a course

exports.uploadThumbnail = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const courseId = req.params.id;

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "course_thumbnails",
    });

    // Delete old Cloudinary image if exists
    if (course.thumbnail && course.thumbnail.includes("cloudinary.com")) {
      const publicId = course.thumbnail.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`course_thumbnails/${publicId}`);
    }

    // Save new thumbnail URL
    course.thumbnail = result.secure_url;
    await course.save();

    res.status(200).json({
      message: "Thumbnail uploaded successfully",
      thumbnail: result.secure_url,
    });
    console.log("Thumbnail uploaded successfully:", result.secure_url);
  } catch (error) {
    console.error("Error uploading thumbnail:", error.message);
    res.status(500).json({
      error: "Error uploading thumbnail",
      details: error.message,
    });
  }
};


// Delete thumbnail
exports.deleteThumbnail = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });

    const thumbnailPath = `public${course.thumbnail}`;
    if (fs.existsSync(thumbnailPath)) fs.unlinkSync(thumbnailPath);

    course.thumbnail = null;
    await course.save();

    res.status(200).json({ message: "Thumbnail deleted successfully" });
  } catch (error) {
    console.error("Error deleting thumbnail:", error.message);
    res
      .status(500)
      .json({ error: "Error deleting thumbnail", details: error.message });
  }
};

exports.searchCourses = async (req, res) => {
  let { query } = req.query; // Get the search term from query string

  if (!query) {
    return res.status(400).json({ message: "Search query is required" });
  }

  // Trim spaces around the search term
  query = query.trim();

  try {
    // Fetch courses where the title exactly matches the search term
    const courses = await Course.findAll({
      where: {
        title: {
          [Op.eq]: query, // Use exact match for title
        },
      },
      include: [
        { model: User, as: "creator", attributes: ["name"] },
        { model: Category, as: "category", attributes: ["name"] },
      ],
    });

    if (courses.length === 0) {
      return res.status(404).json({ message: "No courses found  " });
    }

    res.status(200).json(courses); // Return the matching courses
  } catch (error) {
    console.error("Error searching courses:", error.message);
    res
      .status(500)
      .json({ error: "Error searching courses", details: error.message });
  }
};

exports.getCourseByName = async (req, res) => {
  try {
    let { title } = req.params;

    // Trim extra spaces and convert to lowercase
    title = title.trim().toLowerCase();

    const course = await Course.findOne({
      where: {
        title: {
          [Op.like]: `%${title}%`, // Matches partial or full title, case-insensitive
        },
      },
      include: ["creator", "category"],
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(course);
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
