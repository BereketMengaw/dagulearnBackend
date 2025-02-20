const express = require("express");
const router = express.Router();
const linkController = require("../controllers/linkController");

// link CRUD routes
router.post("/", linkController.createlink); // Create a new link
router.get("/", linkController.getAlllinks); // Get all links
router.get("/:id", linkController.getlinkById); // Get a specific link by ID
router.put("/:id", linkController.updatelink); // Update a link
router.delete("/:id", linkController.deletelink); // Delete a link
router.get("/links/chapter/:chapterId", linkController.getLinksByChapterId);

module.exports = router;
