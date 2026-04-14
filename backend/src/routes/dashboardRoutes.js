import express from "express"
import sequelize from "../db.js";

const router = express.Router()

router.get("/", async (req, res) => {
    const [[products]] = await db.query("SELECT COUNT(*) total FROM products")
    const [[orders]] = await db.query("SELECT COUNT(*) total FROM orders")
    const [[customers]] = await db.query("SELECT COUNT(*) total FROM customers")
    const [[revenue]] = await db.query("SELECT SUM(total) total FROM orders")

    res.json({
        products: products.total,
        orders: orders.total,
        customers: customers.total,
        revenue: revenue.total || 0
    })
})

export default router