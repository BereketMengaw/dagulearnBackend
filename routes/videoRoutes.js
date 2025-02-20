const express = require("express");
const router = express.Router();
const videoController = require("../controllers/videoController");

// Video CRUD routes
router.post("/:courseId", videoController.createVideo); // Create a new video
router.get("/", videoController.getAllVideos); // Get all videos
router.get("/:id", videoController.getVideoById); // Get a specific video by ID
router.put("/:id", videoController.updateVideo); // Update a video
router.delete("/:id", videoController.deleteVideo); // Delete a video

// Routes to get videos by chapterId and courseId
router.get("/chapter/:chapterId", videoController.getVideosByChapter);
router.get("/course/:courseId", videoController.getVideosByCourse);

// Get videos for a specific course and order
router.get(
  "/course/:courseId/order/:order",
  videoController.getVideosByCourseAndOrder
);

module.exports = router;
