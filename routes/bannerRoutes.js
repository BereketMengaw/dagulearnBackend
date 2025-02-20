const express = require("express");
const router = express.Router();
const courseController = require("../controllers/bannerController");
const multer = require("multer");
const path = require("path");

// Multer configuration for banners
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/banner");
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

// Upload a new banner
router.post(
  "/:id/banner",
  upload.single("banner"),
  courseController.uploadBanner
);

// Update an existing banner
router.put(
  "/:id/banner",
  upload.single("banner"),
  courseController.updateBanner
);

// Delete an existing banner
router.delete("/:id/banner", courseController.deleteBanner);

module.exports = router;
