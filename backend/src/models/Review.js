import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const Review = sequelize.define(
  "Review",
  {
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: true },
    name: { type: DataTypes.STRING, allowNull: true },
    rating: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 5 },
    comment: { type: DataTypes.TEXT, allowNull: false },
  },
  {
    tableName: "reviews",
    timestamps: true,
  }
);

export default Review;
