// backend/app.js
const express = require("express");
const cors = require("cors");
const dotenv = require("./config/env");
const db = require("./config/database");

const app = express();

app.use(cors());
app.use(express.json());

// Test DB connection
db.authenticate()
  .then(() => console.log("Database connected..."))
  .catch((err) => console.log("Error: " + err));

// Routes go here
app.get("/", (req, res) => res.send("API Running"));

module.exports = app;
