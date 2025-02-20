// /backend/services/otpService.js

const nodemailer = require("nodemailer");
const otpStore = {}; // In-memory storage for OTPs (can be replaced with a database)

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER, // Your Gmail address (from .env file)
    pass: process.env.GMAIL_PASS, // Your Gmail password or App Password (from .env file)
  },
});

// Send OTP to the user's email
exports.sendOtp = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Your OTP Code for Astemari Authentication",
      text: `Your OTP code is: ${otp}`,
    };

    // Send email using Gmail SMTP
    await transporter.sendMail(mailOptions);
    console.log("OTP sent to email:", email);
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw new Error("Failed to send OTP");
  }
};

// Store OTP temporarily in memory
exports.storeOtp = (email, otp) => {
  otpStore[email] = { otp, timestamp: Date.now() };
};

// Verify OTP by checking the stored OTP for the user
exports.verifyOtp = (email, otp) => {
  const storedOtp = otpStore[email];
  if (!storedOtp) {
    return "OTP not found"; // OTP doesn't exist
  }

  // Check if OTP is expired (1 minute expiration time)
  const expired = Date.now() - storedOtp.timestamp > 60000; // 1 minute expiration
  if (expired) {
    delete otpStore[email]; // Remove expired OTP
    return "OTP expired";
  }

  // Verify OTP
  if (storedOtp.otp === otp) {
    delete otpStore[email]; // Clear OTP after verification
    return "OTP is valid";
  } else {
    return "Invalid OTP";
  }
};
