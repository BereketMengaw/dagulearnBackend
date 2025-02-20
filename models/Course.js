const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");
const Category = require("./Category");

class Course extends Model {}

Course.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    thumbnail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    creatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Category,
        key: "id", // Foreign key to Category model
      },
    },
  },
  {
    sequelize,
    modelName: "Course",
    tableName: "Courses",
    timestamps: true,
  }
);

// Associations
Course.belongsTo(User, {
  foreignKey: "creatorId",
  as: "creator", // Alias to access the creator from Course
});

Course.belongsTo(Category, {
  foreignKey: "categoryId", // This makes categoryId the foreign key
  as: "category", // Alias to access the associated category from Course
});

module.exports = Course;
