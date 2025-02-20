// models/creator.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User"); // Import the User model

const Creator = sequelize.define(
  "Creator",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    profilePicture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    educationLevel: {
      type: DataTypes.ENUM("High School", "Bachelor", "Master", "PhD", "Other"),
      allowNull: true,
    },
    experience: {
      type: DataTypes.STRING, // Years of experience
      allowNull: true,
    },
    skills: {
      type: DataTypes.STRING, // Comma-separated list of skills
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    socialLinks: {
      type: DataTypes.STRING, // A JSON object to store social media links
      allowNull: true,
    },
    bankAccount: {
      type: DataTypes.STRING, // Bank account details
      allowNull: true,
    },
    bankType: {
      type: DataTypes.STRING, // New field
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE", // Delete the creator if the user is deleted
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

// Define the one-to-one relationship between User and Creator
Creator.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });
User.hasOne(Creator, { foreignKey: "userId" });

module.exports = Creator;
