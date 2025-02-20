const express = require("express");
const router = express.Router();
const creatorController = require("../controllers/creatorController");
const multer = require("multer");
const path = require("path");
const authMiddleware = require("../middlewares/authMiddleware"); // Authentication
const roleMiddleware = require("../middlewares/roleMiddleware"); // Role restriction
const preventCreatorReReg = require("../middlewares/preventCreatorReReg"); // Role restriction

// Multer configuration for profile pictures
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/profile_pictures"); // Ensure this directory exists
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/; // Accept JPEG, JPG, PNG
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) cb(null, true);
    else cb(new Error("Only images are allowed!"));
  },
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
});

// Create a new creator with profile picture upload
router.post("/creators", creatorController.createCreator);

// Update creator profile picture
router.put(
  "/creators/:id/profile-picture",
  upload.single("profilePicture"), // Use the middleware for file upload
  creatorController.updateProfilePicture
);

// Route to get creator information by ID
router.get("/creators/:userId", creatorController.getCreatorByUserId);
router.put("/creators/:userId", creatorController.updateCreator);

module.exports = router;
