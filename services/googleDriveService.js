const axios = require("axios");
const fs = require("fs");

async function uploadToGoogleDrive(filePath, fileType, fileName) {
  try {
    const formData = new FormData();
    formData.append("myFile", fs.createReadStream(filePath));
    formData.append("type", fileType);
    formData.append("name", fileName);

    const response = await axios.post(
      process.env.GOOGLE_DRIVE_UPLOAD_URL,
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

    return response.data; // Response from Google Apps Script
  } catch (error) {
    throw new Error(`Google Drive upload failed: ${error.message}`);
  }
}

module.exports = { uploadToGoogleDrive };
