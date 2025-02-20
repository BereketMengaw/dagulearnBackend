// models/Payment.js
const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class Payment extends Model {}

Payment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      // If the field is 'studentId'
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Users", key: "id" },
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Courses", key: "id" },
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tx_ref: {
      type: DataTypes.STRING,
      allowNull: true, // or false, depending on your needs
    },
  },
  {
    sequelize,
    modelName: "Payment",
  }
);

// Export the model directly
module.exports = Payment;
