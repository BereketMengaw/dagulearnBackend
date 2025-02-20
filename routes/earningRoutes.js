// backend/routes/earningsRoutes.js
const express = require("express");
const router = express.Router();
const earningController = require("../controllers/earningController"); // Adjust the path as needed

// Create a new earning
router.post("/", earningController.createEarning);

// Get all earnings
router.get("/", earningController.getAllEarnings);

// Get earnings by creator ID
router.get("/creator/:creatorId", earningController.getEarningsByCreatorId);

// Get an earning by ID
router.get("/:id", earningController.getEarningById);

// Update an earning by ID
router.put("/:id", earningController.updateEarning);

// Delete an earning by ID
router.delete("/:id", earningController.deleteEarning);

//Get it by course
router.get("/course/:courseId", earningController.getEarningsByCourseId);

module.exports = router;
