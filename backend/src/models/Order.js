import { DataTypes } from "sequelize"
import sequelize from "../db.js"

const Order = sequelize.define("Order", {
    // Nullable in case you support guest/legacy orders, but FK will use
    // ON DELETE CASCADE (not SET NULL) to avoid MySQL constraint errors.
    user_id: { type: DataTypes.INTEGER, allowNull: true },
    customer_name: DataTypes.STRING,
    customer_email: DataTypes.STRING,
    total: DataTypes.FLOAT,
    shipping_address: { type: DataTypes.TEXT, allowNull: true },
    city: { type: DataTypes.STRING, allowNull: true },
    country: { type: DataTypes.STRING, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
    tracking_id: { type: DataTypes.STRING, allowNull: true },
    status: {
        type: DataTypes.ENUM("placed", "processing", "shipped", "delivered", "cancelled"),
        defaultValue: "placed",
    },
}, {
    tableName: "orders",
    timestamps: true
})

export default Order