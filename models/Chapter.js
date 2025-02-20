const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class Chapter extends Model {}

Chapter.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true, // Enable auto-increment
      primaryKey: true, // Set as primary key
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    courseId: {
      type: DataTypes.INTEGER, // Match the type of the primary key in the Courses table
      references: { model: "Courses", key: "id" }, // Reference the primary key of the Courses table
      allowNull: false, // Ensure the field is mandatory
      onDelete: "CASCADE", // Optional: Define behavior when the associated Course is deleted
      onUpdate: "CASCADE", // Optional: Define behavior on updates
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: false,
    },
  },
  {
    sequelize,
    modelName: "Chapter",
    timestamps: true,
  }
);

module.exports = Chapter;
