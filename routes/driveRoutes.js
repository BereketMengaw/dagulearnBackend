const express = require("express");
const multer = require("multer");
const { uploadFile } = require("../controllers/driveController");

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // Temporary storage for uploads

// POST route for file upload
router.post("/upload", upload.single("file"), uploadFile);

module.exports = router;
