"use client";

const Chapter = require("../models/Chapter");

exports.createChapter = async (req, res) => {
  try {
    // Destructure incoming data
    const { title, courseId, order } = req.body;

    // Validate input data
    if (!title) {
      return res.status(400).json({ error: "Valid 'title' is required" });
    }

    if (!courseId) {
      return res.status(400).json({ error: "Valid 'courseId' is required" });
    }

    if (!order || isNaN(order) || order <= 0) {
      return res.status(400).json({
        error: "Valid 'order' is required and must be a positive number",
      });
    }

    // Check for duplicate `order` within the same course
    const existingChapter = await Chapter.findOne({
      where: { courseId, order },
    });

    if (existingChapter) {
      return res.status(409).json({
        error: `Chapter with order '${order}' already exists for this course.`,
      });
    }

    // Create the chapter
    const chapter = await Chapter.create({ title, courseId, order });

    return res.status(201).json({
      message: "Chapter created successfully",
      chapter,
    });
  } catch (error) {
    console.error("Error creating chapter:", error);

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors.map((err) => err.message),
      });
    }

    return res.status(500).json({
      error: "An unexpected error occurred",
      details: error.message,
    });
  }
};

// Get all chapters
exports.getAllChapters = async (req, res) => {
  try {
    const chapters = await Chapter.findAll();
    if (!chapters.length) {
      return res.status(404).json({ message: "No chapters found" });
    }
    res.status(200).json(chapters);
  } catch (error) {
    console.error("Error fetching chapters:", error.message);
    res.status(500).json({
      error: "Error fetching chapters",
      details: error.message,
    });
  }
};

// Get a chapter by ID
exports.getChapterById = async (req, res) => {
  try {
    const chapter = await Chapter.findByPk(req.params.id);
    if (chapter) {
      res.status(200).json(chapter);
    } else {
      res.status(404).json({ message: "Chapter not found" });
    }
  } catch (error) {
    console.error("Error fetching chapter:", error.message);
    res.status(500).json({
      error: "Error fetching chapter",
      details: error.message,
    });
  }
};

// Update a chapter by ID
exports.updateChapter = async (req, res) => {
  try {
    const { title, courseId, order } = req.body;

    // Check for required fields
    if (!title && !courseId && !order) {
      return res
        .status(400)
        .json({ error: "At least one field is required to update" });
    }

    if (!courseId) {
      return res.status(400).json({ error: "courseId is required" });
    }

    const chapterId = req.params.id;

    // Ensure the chapter exists
    const chapter = await Chapter.findByPk(chapterId);
    if (!chapter) {
      return res.status(404).json({ error: "Chapter not found" });
    }

    // Log to check if `courseId` is valid
    console.log("Updating chapter with courseId:", courseId);

    // Update the chapter
    chapter.title = title || chapter.title;
    chapter.courseId = courseId || chapter.courseId;
    chapter.order = order || chapter.order;

    // Save the updated chapter
    await chapter.save();

    res.status(200).json(chapter);
  } catch (error) {
    console.error("Error updating chapter:", error.message);
    res.status(500).json({
      error: "Error updating chapter",
      details: error.message,
    });
  }
};

// Delete a chapter by ID
exports.deleteChapter = async (req, res) => {
  try {
    const chapterId = req.params.id;

    // Find the chapter
    const chapter = await Chapter.findByPk(chapterId);
    if (!chapter) {
      return res.status(404).json({ error: "Chapter not found" });
    }

    // Delete chapter
    await chapter.destroy();
    res
      .status(200)
      .json({ message: `Chapter with ID ${chapterId} has been deleted` });
  } catch (error) {
    console.error("Error deleting chapter:", error.message);
    res.status(500).json({
      error: "Error deleting chapter",
      details: error.message,
    });
  }
};

//for selected

// Get chapters by course ID
exports.getChaptersByCourseId = async (req, res) => {
  try {
    const courseId = req.params.courseId;

    // Validate courseId
    if (!courseId) {
      return res.status(400).json({ error: "Course ID is required" });
    }

    // Get all chapters for the specified course
    const chapters = await Chapter.findAll({
      where: { courseId: courseId },
      order: [["order", "ASC"]], // Order chapters based on the "order" field (optional)
    });

    if (!chapters.length) {
      return res
        .status(404)
        .json({ message: "No chapters found for this course" });
    }

    res.status(200).json(chapters);
  } catch (error) {
    console.error("Error fetching chapters by course ID:", error.message);
    res.status(500).json({
      error: "Error fetching chapters",
      details: error.message,
    });
  }
};

exports.updateChapter = async (req, res) => {
  const { courseId, order } = req.params;
  const { title } = req.body; // Assuming you're updating the title of the chapter

  try {
    // Find the chapter by courseId and order
    const chapter = await Chapter.findOne({
      where: { courseId, order },
    });

    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    // Update the chapter
    chapter.title = title || chapter.title; // Only update the title if provided
    await chapter.save();

    return res
      .status(200)
      .json({ message: "Chapter updated successfully", chapter });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.deleteChapterByOrder = async (req, res) => {
  const { courseId, order } = req.params;

  try {
    // Find the chapter by courseId and order
    const chapter = await Chapter.findOne({
      where: { courseId, order },
    });

    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    // Delete the chapter
    await chapter.destroy();

    return res.status(200).json({ message: "Chapter deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getChapterByCourseIdAndChapterId = async (req, res) => {
  const { courseId, chapterId } = req.params; // Get courseId and chapterId from the URL parameters

  try {
    // Find the chapter by courseId and chapterId
    const chapter = await Chapter.findOne({
      where: { courseId, order: chapterId }, // Match both courseId and chapterId
      attributes: [
        "id",
        "title",
        "courseId",
        "order",
        "createdAt",
        "updatedAt",
      ], // Specify the columns you want to return
    });

    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    return res.status(200).json({ chapter });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
