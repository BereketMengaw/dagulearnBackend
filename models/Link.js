const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class Video extends Model {}

Video.init(
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
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    chapterId: {
      type: DataTypes.INTEGER, // Changed to INTEGER
      references: { model: "Chapters", key: "id" }, // Updated to match the INTEGER type for the reference
      allowNull: false,
    },
    order: {
      type: DataTypes.INTEGER,
    },
  },
  {
    sequelize,
    modelName: "Links",
    timestamps: true,
  }
);

module.exports = Video;
