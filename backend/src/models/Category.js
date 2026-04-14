import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const Category = sequelize.define("Category", {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
}, {
    tableName: "categories",
    timestamps: true,
});

export default Category;