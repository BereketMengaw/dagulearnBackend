const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");

// Create a new enrollment
exports.createEnrollment = async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    if (!userId || !courseId) {
      return res.status(400).json({
        error: "User ID and Course ID are required.",
      });
    }

    const enrollment = await Enrollment.create({ userId, courseId });
    res.status(201).json(enrollment);
  } catch (error) {
    res.status(500).json({
      error: "Error creating enrollment",
      details: error.message,
    });
  }
};

// Get all enrollments
exports.getAllEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll();

    if (!enrollments.length) {
      return res.status(404).json({ message: "No enrollments found" });
    }

    res.status(200).json(enrollments);
  } catch (error) {
    console.error("Error fetching enrollments:", error.message);
    res.status(500).json({
      error: "Error fetching enrollments",
      details: error.message,
    });
  }
};

// Get enrollment by ID
exports.getEnrollmentById = async (req, res) => {
  try {
    const enrollmentId = req.params.id;

    const enrollment = await Enrollment.findByPk(enrollmentId);

    if (enrollment) {
      res.status(200).json(enrollment);
    } else {
      res.status(404).json({ error: "Enrollment not found" });
    }
  } catch (error) {
    console.error("Error fetching enrollment:", error.message);
    res.status(500).json({
      error: "Error fetching enrollment",
      details: error.message,
    });
  }
};

// Update enrollment by ID
exports.updateEnrollment = async (req, res) => {
  try {
    const { userId, courseId } = req.body;
    const enrollmentId = req.params.id;

    if (!userId && !courseId) {
      return res.status(400).json({
        error:
          "At least one field (User ID or Course ID) is required to update.",
      });
    }

    const enrollment = await Enrollment.findByPk(enrollmentId);

    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    // Update fields
    enrollment.userId = userId || enrollment.userId;
    enrollment.courseId = courseId || enrollment.courseId;

    await enrollment.save();
    res.status(200).json(enrollment);
  } catch (error) {
    console.error("Error updating enrollment:", error.message);
    res.status(500).json({
      error: "Error updating enrollment",
      details: error.message,
    });
  }
};

// Delete enrollment by ID
exports.deleteEnrollment = async (req, res) => {
  try {
    const enrollmentId = req.params.id;

    const enrollment = await Enrollment.findByPk(enrollmentId);

    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    await enrollment.destroy();
    res.status(200).json({
      message: `Enrollment with ID ${enrollmentId} has been deleted.`,
    });
  } catch (error) {
    console.error("Error deleting enrollment:", error.message);
    res.status(500).json({
      error: "Error deleting enrollment",
      details: error.message,
    });
  }
};

// Check if user is enrolled in the course
exports.checkEnrollment = async (req, res) => {
  try {
    const { userId, courseId } = req.params;

    // Check if both userId and courseId are present
    if (!userId || !courseId) {
      return res
        .status(400)
        .json({ error: "User ID and Course ID are required." });
    }

    // Logic to check enrollment
    const enrollment = await Enrollment.findOne({
      where: { userId, courseId },
    });

    if (enrollment) {
      return res.status(200).json({ enrolled: true });
    } else {
      return res.status(404).json({ enrolled: false });
    }
  } catch (error) {
    console.error("Error checking enrollment:", error);
    res
      .status(500)
      .json({ error: "An error occurred while checking enrollment." });
  }
};

exports.getEnrolledCourses = async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch enrollments with associated courses
    const enrollments = await Enrollment.findAll({
      where: { userId },
      include: [
        {
          model: Course,
          as: "course", // Match the alias used in Enrollment.belongsTo(Course)
          attributes: ["id", "title", "description", "price"],
        },
      ],
    });

    if (!enrollments || enrollments.length === 0) {
      return res
        .status(404)
        .json({ message: "No courses found for the user." });
    }

    // Map enrollments to extract course details
    const courses = enrollments.map((enrollment) => enrollment.course);

    res.status(200).json({ courses });
  } catch (error) {
    console.error("Error fetching enrolled courses:", error.message);
    res.status(500).json({
      error: "Failed to fetch enrolled courses.",
      details: error.message,
    });
  }
};

exports.getEnrollmentCountByCourse = async (req, res) => {
  try {
    const { courseId } = req.params; // Get the courseId from the request parameters

    // Validate courseId
    if (!courseId) {
      return res.status(400).json({ error: "Course ID is required" });
    }

    // Fetch the enrollment count for the specified course
    const enrollmentCount = await Enrollment.count({
      where: { courseId },
    });

    // Check if the course has enrollments
    if (enrollmentCount === 0) {
      return res
        .status(404)
        .json({ error: "No enrollments found for the specified course" });
    }

    res.status(200).json({
      courseId,
      enrollmentCount,
    });
  } catch (error) {
    console.error("Error fetching enrollment count:", error);
    res.status(500).json({ message: "Error fetching enrollment count." });
  }
};

exports.getEnrollmentsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({ error: "Course ID is required" });
    }

    const enrollments = await Enrollment.findAll({
      where: { courseId },
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "description", "price"],
        },
      ],
    });

    if (!enrollments.length) {
      return res
        .status(404)
        .json({ message: "No enrollments found for this course." });
    }

    res.status(200).json(enrollments);
  } catch (error) {
    console.error("Error fetching enrollments for course:", error.message);
    res.status(500).json({
      error: "Error fetching enrollments for the course",
      details: error.message,
    });
  }
};
