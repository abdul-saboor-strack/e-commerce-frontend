import dotenv from "dotenv";
import { Admin, Product, Category, Order, OrderItem, User } from "../models/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";


// =============================
// 🔐 ADMIN AUTH
// =============================

// Admin login
export const loginAdmin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const admin = await Admin.findOne({ where: { email } });
        if (!admin) return res.status(401).json({ message: "Invalid credentials" });

        const match = await bcrypt.compare(password, admin.password);
        if (!match) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { id: admin.id, email: admin.email },
            JWT_SECRET,
            { expiresIn: "8h" }
        );

        res.json({
            token,
            admin: { id: admin.id, name: admin.name, email: admin.email }
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};


// Create Admin (initial setup)
export const createAdmin = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hash = await bcrypt.hash(password, 10);
        const admin = await Admin.create({ name, email, password: hash });
        res.json({ message: "Admin created", admin });
    } catch (err) {
        res.status(500).json({ message: "Error creating admin", error: err.message });
    }
};

// Get current admin info (for settings)
export const getAdmin = async (req, res) => {
    try {
        const adminId = req.admin.id; // from middleware
        const admin = await Admin.findByPk(adminId, { attributes: ['id', 'name', 'email'] });
        if (!admin) return res.status(404).json({ message: "Admin not found" });
        res.json(admin);
    } catch (err) {
        res.status(500).json({ message: "Error fetching admin", error: err.message });
    }
};

// Update admin (name, email, password)
export const updateAdmin = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const adminId = req.admin.id; // from middleware
        const admin = await Admin.findByPk(adminId);
        if (!admin) return res.status(404).json({ message: "Admin not found" });

        const updates = {};
        if (name) updates.name = name;
        if (email) updates.email = email;
        if (password) updates.password = await bcrypt.hash(password, 10);

        await admin.update(updates);
        res.json({ message: "Admin updated", admin: { id: admin.id, name: admin.name, email: admin.email } });
    } catch (err) {
        res.status(500).json({ message: "Error updating admin", error: err.message });
    }
};



// =============================
// 📦 PRODUCTS MANAGEMENT
// =============================

// Get all products
export const getAllProducts = async (req, res) => {
    try {
        const data = await Product.findAll();
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: "Error fetching products" });
    }
};

// Create product
export const createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.json({ message: "Product created", product });
    } catch (err) {
        res.status(500).json({ message: "Error creating product", error: err.message });
    }
};

// Update product
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await Product.update(req.body, { where: { id } });
        res.json({ message: "Product updated" });
    } catch (err) {
        res.status(500).json({ message: "Error updating product", error: err.message });
    }
};

// Delete product
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await Product.destroy({ where: { id } });
        res.json({ message: "Product deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting product", error: err.message });
    }
};



// =============================
// 🧾 ORDERS MANAGEMENT
// =============================

export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            order: [["id", "DESC"]],
            include: [
                {
                    model: OrderItem,
                    as: "items",
                    required: false,
                    include: [{ model: Product, as: "product", attributes: ["id", "name", "price"] }],
                },
            ],
        });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: "Error fetching orders", error: err.message });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        await Order.update({ status }, { where: { id } });
        res.json({ message: "Order status updated" });
    } catch (err) {
        res.status(500).json({ message: "Error updating order", error: err.message });
    }
};



// =============================
// 🧑 USERS / CUSTOMERS
// =============================

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ["password"] }
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Error fetching users", error: err.message });
    }
};



// =============================
// 🗂️ CATEGORIES MANAGEMENT
// =============================

export const getAllCategories = async (req, res) => {
    try {
        const data = await Category.findAll();
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: "Error fetching categories", error: err.message });
    }
};

export const createCategory = async (req, res) => {
    try {
        const category = await Category.create(req.body);
        res.json({ message: "Category created", category });
    } catch (err) {
        res.status(500).json({ message: "Error creating category", error: err.message });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await Category.destroy({ where: { id } });
        res.json({ message: "Category deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting category", error: err.message });
    }
};