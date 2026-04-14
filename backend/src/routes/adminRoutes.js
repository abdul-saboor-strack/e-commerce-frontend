import express from "express";
import sequelize from "../db.js";
import { QueryTypes } from "sequelize";   // ⭐ ADD THIS

import {
    loginAdmin,
    createAdmin,
    getAdmin,
    updateAdmin,

    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,

    getAllOrders,
    updateOrderStatus,

    getAllUsers,

    getAllCategories,
    createCategory,
    deleteCategory
} from "../controllers/adminController.js";

import { upsertSettings, getPublicSettings } from "../controllers/settingsController.js";
import { requireAdmin } from "../middleware/jwt.js";

const router = express.Router();

/* ================= AUTH ================= */
// Keep existing path for backward compatibility
router.post("/admin/login", loginAdmin);
// Preferred simpler path used by the frontend
router.post("/login", loginAdmin);
router.post("/create", requireAdmin, createAdmin);
router.get("/me", requireAdmin, getAdmin);
router.put("/me", requireAdmin, updateAdmin);

/* ================= PRODUCTS ================= */
router.get("/products", requireAdmin, getAllProducts);
router.post("/products", requireAdmin, createProduct);
router.put("/products/:id", requireAdmin, updateProduct);
router.delete("/products/:id", requireAdmin, deleteProduct);

/* ================= ORDERS ================= */
router.get("/orders", requireAdmin, getAllOrders);
router.put("/orders/:id", requireAdmin, updateOrderStatus);

/* ================= USERS ================= */
router.get("/users", requireAdmin, getAllUsers);

/* ================= CATEGORIES ================= */
router.get("/categories", requireAdmin, getAllCategories);
router.post("/categories", requireAdmin, createCategory);
router.delete("/categories/:id", requireAdmin, deleteCategory);

/* ================= SETTINGS ================= */
router.get("/settings", getPublicSettings);
router.put("/settings", requireAdmin, upsertSettings);

/* ================= DASHBOARD ================= */
/* ⭐ REAL DATA + ZERO SAFE */
router.get("/stats", requireAdmin, async (req, res) => {
    try {
        const ordersResult = await sequelize.query(
            "SELECT COUNT(*) AS count FROM orders",
            { type: QueryTypes.SELECT }
        );

        const customersResult = await sequelize.query(
            "SELECT COUNT(*) AS count FROM users",
            { type: QueryTypes.SELECT }
        );

        const productsResult = await sequelize.query(
            "SELECT COUNT(*) AS count FROM products",
            { type: QueryTypes.SELECT }
        );

        const revenueResult = await sequelize.query(
            "SELECT COALESCE(SUM(total), 0) AS total FROM orders",
            { type: QueryTypes.SELECT }
        );

        const stats = {
            revenue: revenueResult[0]?.total || 0,
            orders: ordersResult[0]?.count || 0,
            customers: customersResult[0]?.count || 0,
            products: productsResult[0]?.count || 0
        };

        res.json(stats);

    } catch (err) {
        console.error("STATS ERROR:", err);
        res.status(500).json({
            revenue: 0,
            orders: 0,
            customers: 0,
            products: 0
        });
    }
});

router.get("/recent-orders", requireAdmin, async (req, res) => {
    try {
        const rows = await sequelize.query(`
            SELECT id,
                   COALESCE(customer_name, customer_email) AS customer,
                   total AS total,
                   status AS status
             FROM orders
            ORDER BY id DESC
            LIMIT 5
        `, { type: QueryTypes.SELECT });

        res.json(rows || []);
    } catch (err) {
        console.error("Recent orders error:", err);
        res.json([]);
    }
});

export default router;