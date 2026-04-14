import { DataTypes } from "sequelize";
import sequelize from "../db.js";
import Category from "./Category.js";

const Subcategory = sequelize.define("Subcategory", {
    name: { type: DataTypes.STRING, allowNull: false },
    category_id: { type: DataTypes.INTEGER, allowNull: false }
}, {
    tableName: "subcategories",
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ["category_id", "name"],
        },
    ],
});

Subcategory.belongsTo(Category, { foreignKey: "category_id" });
export default Subcategory;