import { DataTypes } from "sequelize"
import sequelize from "../db.js"

const OrderItem = sequelize.define("OrderItem", {
    order_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    price: DataTypes.FLOAT
}, {
    tableName: "order_items",
    timestamps: false
})

export default OrderItem