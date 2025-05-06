const express = require("express");
const router = express.Router();
const creatorController = require("../controllers/creatorController");
const multer = require("multer");
const authMiddleware = require("../middlewares/authMiddleware"); // Authentication
const roleMiddleware = require("../middlewares/roleMiddleware"); // Role restriction
const preventCreatorReReg = require("../middlewares/preventCreatorReReg"); // Role restriction

// Multer configuration for handling file uploads to Cloudinary
const storage = multer.memoryStorage(); // Store file in memory, not locally
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/; // Accept JPEG, JPG, PNG
    const extname = filetypes.test(file.originalname.toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) cb(null, true);
    else cb(new Error("Only images are allowed!"));
  },
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
});

// Create a new creator
router.post(
  "/creators",
  upload.single("profilePicture"), // File upload to memory
  creatorController.createCreator
);

// Update creator profile picture (upload to Cloudinary)

// 


// Route to get creator information by userId
//router.get("/creators/:userId", creatorController.getCreatorByUserId);
router.get("/creators/:id", creatorController.getCreatorById);
//

// Update profile data (non-file fields)
router.put("/creators/:userId", creatorController.updateCreatorData);

// Update profile picture only
router.put(
  "/creators/:userId/picture",
  upload.single("profilePicture"),
  creatorController.updateProfilePicture
);




module.exports = router;
