const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const multer = require("multer");
const path = require("path");

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/thumbnails");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) cb(null, true);
    else cb(new Error("Only images are allowed!"));
  },
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
});

// Course CRUD routes
router.post("/", courseController.createCourse); // Create a new course
router.get("/", courseController.getAllCourses); // Get all courses
router.get("/:id", courseController.getCourseById); // Get a specific course by ID
router.put("/:id", courseController.updateCourse); // Update a course
router.delete("/:id", courseController.deleteCourse); // Delete a course
router.get("/creator/:creatorId", courseController.getCoursesByCreator); //to get specific course for specific creator

//related to banner

router.post(
  "/:id/thumbnail",
  upload.single("thumbnail"),
  courseController.uploadThumbnail
);
router.delete("/:id/thumbnail", courseController.deleteThumbnail);
router.get("/search", courseController.searchCourses);
router.get("/course/:title", courseController.getCourseByName);

module.exports = router;
