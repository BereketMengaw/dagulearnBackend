require("dotenv").config(); // Load environment variables

const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME, // railway
  process.env.DB_USER, // root
  process.env.DB_PASSWORD, // your password from Railway
  {
    host: process.env.DB_HOST, // shinkansen.proxy.rlwy.net
    port: process.env.DB_PORT, // 28004
    dialect: "mysql",
    logging: false,
  }
);

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to Railway MySQL successfully!");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
  }
}

testConnection();

module.exports = sequelize;
