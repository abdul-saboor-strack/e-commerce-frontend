import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const Product = sequelize.define("Product", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    price: { type: DataTypes.FLOAT, allowNull: false },
    image: { type: DataTypes.STRING }, // Keep for backwards compatibility
    images: { type: DataTypes.JSON }, // Array of image URLs
    // Backwards compatible (string) fields used by the existing frontend
    category: { type: DataTypes.STRING, allowNull: false },
    subcategory: { type: DataTypes.STRING },

    // Normalized references (optional)
    category_id: { type: DataTypes.INTEGER, allowNull: true },
    subcategory_id: { type: DataTypes.INTEGER, allowNull: true },

    stock: { type: DataTypes.INTEGER, defaultValue: 0 },
    status: {
        type: DataTypes.ENUM("active", "out_of_stock"),
        defaultValue: "active",
    },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

export default Product;