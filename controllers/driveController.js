const { uploadToGoogleDrive } = require("../services/googleDriveService");
const fs = require("fs");
const path = require("path");

async function uploadFile(req, res) {
  try {
    const {
      path: filePath,
      mimetype: fileType,
      originalname: fileName,
    } = req.file;

    // Upload to Google Drive via Apps Script
    const uploadResponse = await uploadToGoogleDrive(
      filePath,
      fileType,
      fileName
    );

    // Clean up local file after upload
    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      message: "File uploaded successfully!",
      link: uploadResponse.link,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Upload failed: ${error.message}`,
    });
  }
}

module.exports = { uploadFile };
