const express = require("express");
const {
  signup,
  login,
  protectedRoute,
  getUserData,
} = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/protected-route", protectedRoute);
router.get("/user", getUserData);

module.exports = router;
