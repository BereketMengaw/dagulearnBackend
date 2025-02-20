const express = require("express");
const router = express.Router();
const enrollmentController = require("../controllers/enrollmentController");

// Enrollment CRUD routes
router.post("/", enrollmentController.createEnrollment); // Create a new enrollment
router.get("/", enrollmentController.getAllEnrollments); // Get all enrollments
router.get("/:id", enrollmentController.getEnrollmentById); // Get a specific enrollment by ID
router.put("/:id", enrollmentController.updateEnrollment); // Update an enrollment
router.delete("/:id", enrollmentController.deleteEnrollment); // Delete an enrollment
router.get("/check/:userId/:courseId", enrollmentController.checkEnrollment);
router.get("/user/:userId", enrollmentController.getEnrolledCourses);
router.get(
  "/counts/:courseId",
  enrollmentController.getEnrollmentCountByCourse
); // Route to fetch enrollment counts

router.get("/course/:courseId", enrollmentController.getEnrollmentsByCourse);

module.exports = router;
