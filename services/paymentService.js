const User = require("../models/User");
const axios = require("axios");
require("dotenv").config(); // Load environment variables

exports.initiatePayment = async (payment, tx_ref) => {
  try {
    const chapaResponse = await axios.post(
      `${process.env.CHAPA_API_BASE_URL}/transaction/initialize`,
      {
        amount: payment.amount,
        currency: "ETB",
        email: payment.userEmail, // Ensure you pass the correct field
        tx_ref: tx_ref, // Unique reference for the transaction
        callback_url: "https://your-app.com/payment-callback",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return chapaResponse.data;
  } catch (error) {
    console.error(
      "Error initializing payment:",
      error.response?.data || error.message
    );
    throw new Error("Failed to initialize payment");
  }
};
