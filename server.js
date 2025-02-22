const express = require("express");
const session = require("express-session");
const sequelize = require("./config/database"); // Database configuration
const path = require("path");
const cors = require("cors");

// Import routes
const otpRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const courseRoutes = require("./routes/courseRoutes");
const chapterRoutes = require("./routes/chapterRoutes");
const videoRoutes = require("./routes/videoRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const earningRoutes = require("./routes/earningRoutes");
const linkRoutes = require("./routes/linkRoutes");
const bannerRoutes = require("./routes/bannerRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const authRoutes = require("./routes/authRoutes");
const creatorRoutes = require("./routes/creatorRoutes");

// Import models (to ensure they are registered with Sequelize)
const User = require("./models/User");
const Course = require("./models/Course");
const Chapter = require("./models/Chapter");
const Video = require("./models/Video");
const Payment = require("./models/Payment");
const Enrollment = require("./models/Enrollment");
const Earning = require("./models/Earning");
const Link = require("./models/Link");
const Creator = require("./models/Creator");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON and handle CORS
app.use(express.json());
app.use(
  cors({
    origin: "https://dagulearn.vercel.app/", // Change this to your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Session configuration
app.use(
  session({
    secret: "your_secret_key", // Replace with a secure secret
    resave: false,
    saveUninitialized: false,
  })
);

// Serve static files for uploaded content
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

// Define API routes
app.use("/api/auth", otpRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/chapters", chapterRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/earnings", earningRoutes);
app.use("/api/link", linkRoutes);
app.use("/api/banner", bannerRoutes);
app.use("/api/category", categoryRoutes);
app.use("/auth", authRoutes);
app.use("/api/creator", creatorRoutes);

// Sync database and start HTTP server
sequelize
  .sync()
  .then(() => {
    console.log("Database & tables created!");
    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error syncing database:", err);
  });
