const express = require("express");
const router = express.Router();
const chapterController = require("../controllers/chapterController");

// Chapter CRUD routes
router.post("/", chapterController.createChapter); // Create a new chapter
router.get("/", chapterController.getAllChapters); // Get all chapters
router.get("/:id", chapterController.getChapterById); // Get a specific chapter by ID
router.put("/:id", chapterController.updateChapter); // Update a chapter
router.delete("/:id", chapterController.deleteChapter); // Delete a chapter

router.get("/:courseId/chapters", chapterController.getChaptersByCourseId); // Define the route to fetch chapters by course ID

// Update chapter by courseId and order
router.put("/:courseId/chapters/order/:order", chapterController.updateChapter);

router.delete(
  "/:courseId/chapters/order/:order",
  chapterController.deleteChapterByOrder
);

//to get by courseid and chapterid

router.get(
  "/:courseId/chapters/:chapterId",
  chapterController.getChapterByCourseIdAndChapterId
);

module.exports = router;
