const fetch = require("node-fetch");
const crypto = require("crypto");
const Payment = require("../models/Payment");
const Course = require("../models/Course");
const User = require("../models/User");
const Enrollment = require("../models/Enrollment");
const Earning = require("../models/Earning");
const Payout = require("../models/Payment");

exports.initializePayment = async (req, res) => {
  const {
    userId,
    courseId,
    amount,
    email,
    firstName,
    lastName,
    phoneNumber,
    txRef,
    callbackUrl,
    returnUrl,
  } = req.body;

  // Validate input and check which fields are missing
  const missingFields = [];

  if (!userId) missingFields.push("userId");
  if (!courseId) missingFields.push("courseId");
  if (!amount) missingFields.push("amount");
  if (!txRef) missingFields.push("txRef");
  if (!email) missingFields.push("email");

  if (missingFields.length > 0) {
    return res.status(400).json({
      error: "Missing required fields",
      missingFields, // Send which fields are missing
    });
  }

  const headers = {
    Authorization: `Bearer ${process.env.CHAPA_API_KEY}`,
    "Content-Type": "application/json",
  };

  const payload = {
    amount,
    currency: "ETB",
    email,
    first_name: firstName,
    last_name: lastName,
    phone_number: phoneNumber,
    tx_ref: txRef,
    callback_url: callbackUrl,
    return_url: returnUrl,
  };

  try {
    // Initialize payment with Chapa
    const response = await fetch(
      "https://api.chapa.co/v1/transaction/initialize",
      {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      }
    );
    const result = await response.json();

    if (result.status === "success") {
      // Store payment details in the database
      await Payment.create({
        userId,
        courseId,
        amount,
        paymentMethod: "Chapa", // Assuming "Chapa" is the payment method
        status: "pending", // Default status for new payments
        tx_ref: txRef,
      });

      // Send the checkout URL for the client to redirect
      res.status(200).json({ checkoutUrl: result.data.checkout_url });
    } else {
      res.status(400).json({
        error: "Payment initialization failed",
        details: result.message || "Unknown error",
      });
    }
  } catch (error) {
    console.error("Error initializing payment:", error.message);
    res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
};

exports.handlePaymentCallback = async (req, res) => {
  const { tx_ref, status } = req.body;

  try {
    // Find the payment record by tx_ref
    const payment = await Payment.findOne({ where: { tx_ref } });
    if (!payment) {
      return res.status(404).json({ error: "Payment not found." });
    }

    if (status === "success") {
      // Update payment status to completed
      payment.status = "completed";
      await payment.save();

      // Add an entry to the Enrollment table
      await Enrollment.create({
        userId: payment.userId,
        courseId: payment.courseId,
      });

      // Update or create an entry in the Earning table
      const course = await Course.findOne({ where: { id: payment.courseId } });
      if (!course) {
        return res.status(404).json({ error: "Course not found." });
      }

      const creatorId = course.creatorId; // Assuming Course model has a creatorId field
      const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-indexed
      const currentYear = new Date().getFullYear();

      const existingEarning = await Earning.findOne({
        where: {
          creatorId,
          courseId: payment.courseId,
          month: currentMonth,
          year: currentYear,
        },
      });

      if (existingEarning) {
        // Update totalEarnings if an entry exists
        existingEarning.totalEarnings += payment.amount;
        await existingEarning.save();
      } else {
        // Create a new Earning entry if none exists
        await Earning.create({
          creatorId,
          courseId: payment.courseId,
          totalEarnings: payment.amount,
          month: currentMonth,
          year: currentYear,
        });
      }

      return res
        .status(200)
        .json({ message: "Payment processed successfully." });
    } else {
      // Update payment status to failed if status is not success
      payment.status = "failed";
      await payment.save();
      return res.status(400).json({ message: "Payment failed." });
    }
  } catch (error) {
    console.error("Error handling payment callback:", error.message);
    return res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
};

exports.handlePaymentWebhook = async (req, res) => {
  const { tx_ref, status, amount, metadata } = req.body; // Extract metadata (userId, courseId) if available

  try {
    // Find the payment record by tx_ref
    const payment = await Payment.findOne({ where: { tx_ref } });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found." });
    }

    // If metadata is not included in the webhook payload, retrieve from payment record
    const userId = metadata?.userId || payment.userId;
    const courseId = metadata?.courseId || payment.courseId;

    // Ensure userId and courseId are present
    if (!userId || !courseId) {
      return res
        .status(400)
        .json({ error: "Missing userId or courseId in payment." });
    }

    // Handle the payment based on the status
    if (status === "success") {
      // Update payment status to completed
      payment.status = "completed";
      await payment.save();

      // Add an entry to the Enrollment table
      await Enrollment.create({ userId, courseId });

      // Handle creator earnings
      const course = await Course.findOne({ where: { id: courseId } });
      if (!course) return res.status(404).json({ error: "Course not found." });

      const currentMonth = new Date().getMonth() + 1; // Get current month
      const currentYear = new Date().getFullYear(); // Get current year

      // Check if there's an existing earnings entry for the creator
      const existingEarning = await Earning.findOne({
        where: {
          creatorId: course.creatorId,
          courseId,
          month: currentMonth,
          year: currentYear,
        },
      });

      if (existingEarning) {
        // Update the total earnings if an entry already exists
        existingEarning.totalEarnings += amount;
        await existingEarning.save();
      } else {
        // Create a new Earning entry if none exists
        await Earning.create({
          creatorId: course.creatorId,
          courseId,
          totalEarnings: amount,
          month: currentMonth,
          year: currentYear,
        });
      }

      return res
        .status(200)
        .json({ message: "Payment processed successfully." });
    } else {
      // If payment is not successful, mark it as failed
      payment.status = "failed";
      await payment.save();
      return res.status(400).json({ message: "Payment failed." });
    }
  } catch (error) {
    console.error("Error handling payment callback:", error.message);
    return res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
};

exports.createPayment = async (req, res) => {
  try {
    const { userId, courseId, amount, paymentMethod, status, tx_ref } =
      req.body;

    if (!userId || !courseId || !amount || !paymentMethod || !status) {
      return res.status(400).json({
        error:
          "User ID, Course ID, Amount, Payment Method, and Status are required.",
      });
    }

    const payment = await Payment.create({
      userId,
      courseId,
      amount,
      paymentMethod,
      status,
      tx_ref,
    });

    res.status(201).json(payment);
  } catch (error) {
    console.error("Error creating payment:", error.message);
    res
      .status(500)
      .json({ error: "Error creating payment", details: error.message });
  }
};

// List all payments
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [
        
        
      ],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error.message);
    res.status(500).json({ error: "Error fetching payments", details: error.message });
  }
};

// Delete a payment by ID
exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findByPk(id);

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    await payment.destroy();
    res.status(200).json({ message: "Payment deleted successfully" });
  } catch (error) {
    console.error("Error deleting payment:", error.message);
    res.status(500).json({ error: "Error deleting payment", details: error.message });
  }
};

