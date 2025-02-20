// backend/controllers/earningController.js
const Earning = require("../models/Earning"); // Adjust path as per your structure
const User = require("../models/User"); // Adjust path as per your structure
const Course = require("../models/Course"); // Adjust path as per your structure

// Create a new earning
exports.createEarning = async (req, res) => {
  try {
    const { creatorId, courseId, totalEarnings, month, year } = req.body;

    // Validate required fields
    if (!creatorId || !courseId || !totalEarnings || !month || !year) {
      return res.status(400).json({
        error:
          "All fields (creatorId, courseId, totalEarnings, month, year) are required.",
      });
    }

    const earning = await Earning.create({
      creatorId,
      courseId,
      totalEarnings,
      month,
      year,
    });

    res.status(201).json(earning);
  } catch (error) {
    res.status(500).json({
      error: "Error creating earning",
      details: error.message,
    });
  }
};

// Get all earnings
exports.getAllEarnings = async (req, res) => {
  try {
    const earnings = await Earning.findAll();

    if (!earnings.length) {
      return res.status(404).json({ message: "No earnings found" });
    }

    res.status(200).json(earnings);
  } catch (error) {
    res.status(500).json({
      error: "Error fetching earnings",
      details: error.message,
    });
  }
};

// Get earnings by creator ID

exports.getEarningsByCreatorId = async (req, res) => {
  try {
    const { creatorId } = req.params; // Get creatorId from URL params

    // Check if creatorId is a valid integer
    if (isNaN(creatorId)) {
      return res.status(400).json({ message: "Invalid creatorId" });
    }

    // Fetch earnings for the given creatorId with related User and Course data
    const earnings = await Earning.findAll({
      where: { creatorId },
      include: [],
    });

    if (!earnings.length) {
      return res
        .status(404)
        .json({ message: "No earnings found for this creator" });
    }

    // Return the earnings data
    res.status(200).json(earnings);
  } catch (error) {
    console.error(error); // Log the error
    res.status(500).json({
      error: "Error fetching earnings by creator ID",
      details: error.message,
    });
  }
};

// Get an earning by ID
exports.getEarningById = async (req, res) => {
  try {
    const { id } = req.params;

    const earning = await Earning.findByPk(id);

    if (!earning) {
      return res.status(404).json({ error: "Earning not found" });
    }

    res.status(200).json(earning);
  } catch (error) {
    res.status(500).json({
      error: "Error fetching earning",
      details: error.message,
    });
  }
};

// Update an earning by ID
exports.updateEarning = async (req, res) => {
  try {
    const { id } = req.params;
    const { creatorId, courseId, totalEarnings, month, year } = req.body;

    const earning = await Earning.findByPk(id);

    if (!earning) {
      return res.status(404).json({ error: "Earning not found" });
    }

    // Update fields
    earning.creatorId = creatorId || earning.creatorId;
    earning.courseId = courseId || earning.courseId;
    earning.totalEarnings = totalEarnings || earning.totalEarnings;
    earning.month = month || earning.month;
    earning.year = year || earning.year;

    await earning.save();
    res.status(200).json(earning);
  } catch (error) {
    res.status(500).json({
      error: "Error updating earning",
      details: error.message,
    });
  }
};

// Delete an earning by ID
exports.deleteEarning = async (req, res) => {
  try {
    const { id } = req.params;

    const earning = await Earning.findByPk(id);

    if (!earning) {
      return res.status(404).json({ error: "Earning not found" });
    }

    await earning.destroy();
    res.status(200).json({
      message: `Earning with ID ${id} has been deleted.`,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error deleting earning",
      details: error.message,
    });
  }
};

exports.getEarningsByCourseId = async (req, res) => {
  try {
    const { courseId } = req.params; // Get courseId from URL params

    // Check if courseId is a valid integer
    if (isNaN(courseId)) {
      return res.status(400).json({ message: "Invalid courseId" });
    }

    // Fetch earnings for the given courseId with related User and Course data
    const earnings = await Earning.findAll({
      where: { courseId },
    });

    if (!earnings.length) {
      return res
        .status(404)
        .json({ message: "No earnings found for this course" });
    }

    // Return the earnings data
    res.status(200).json(earnings);
  } catch (error) {
    console.error(error); // Log the error
    res.status(500).json({
      error: "Error fetching earnings by course ID",
      details: error.message,
    });
  }
};
