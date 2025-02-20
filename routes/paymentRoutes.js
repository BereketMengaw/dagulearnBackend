const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const {
  initiatePayment,
  handlePaymentCallback,
} = require("../controllers/paymentController");

// Route for payment initialization
router.post("/initialize", paymentController.initializePayment);
router.post("/callback", paymentController.handlePaymentCallback);
// Payment webhook route for Chapa
router.post("/webhook", paymentController.handlePaymentWebhook);

module.exports = router;
