import express from "express";
import { Order, Product, User } from "../models/index.js";
import { requireAdmin } from "../middleware/jwt.js";

const router = express.Router();

router.get("/", requireAdmin, async (_req, res) => {
  try {
    const [totalOrders, totalProducts, totalCustomers] = await Promise.all([
      Order.count(),
      Product.count(),
      User.count(),
    ]);

    // Revenue = sum(order.total)
    const orders = await Order.findAll({ attributes: ["total"] });
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);

    res.json({ totalOrders, totalRevenue, totalProducts, totalCustomers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Analytics error" });
  }
});

export default router;
