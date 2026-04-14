import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const StoreSetting = sequelize.define(
  "store_settings",
  {
    key: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: true,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

export default StoreSetting;
