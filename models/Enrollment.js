const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");
const Course = require("./Course");

class Enrollment extends Model {}

Enrollment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Users", key: "id" }, // References the User model
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Courses", key: "id" },
      // References the Course model
    },
  },
  {
    sequelize,
    modelName: "Enrollment",
    timestamps: true,
  }
);

// Define the relationships
Enrollment.belongsTo(User, {
  foreignKey: "userId",
  as: "user", // Alias for the associated User
});

Enrollment.belongsTo(Course, {
  foreignKey: "courseId",
  as: "course", // Alias for the associated Course
});

module.exports = Enrollment;
