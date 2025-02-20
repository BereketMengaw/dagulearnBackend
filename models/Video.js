const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class Video extends Model {}

Video.init(
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
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    chapterId: {
      type: DataTypes.INTEGER,
      references: { model: "Chapters", key: "id" },
      allowNull: false,
    },
    courseId: {
      type: DataTypes.INTEGER,
      references: { model: "Courses", key: "id" },
      allowNull: false,
    },
    order: {
      type: DataTypes.INTEGER,
    },
  },
  {
    sequelize,
    modelName: "Video",
    timestamps: true,
  }
);

module.exports = Video;
