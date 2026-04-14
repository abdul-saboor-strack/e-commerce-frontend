import express from "express";
import User from "../models/User.js";
import { requireAdmin } from "../middleware/jwt.js";

const router = express.Router();

// Get all users (Admin)
router.get("/", requireAdmin, async (req, res) => {
    try {
        const users = await User.findAll({ order: [["createdAt", "DESC"]] });
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching users", error: err });
    }
});

// Update user (Admin)
router.put("/:id", requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;

        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: "User not found" });

        await user.update({
            name: name ?? user.name,
            email: email ?? user.email,
        });

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error updating user" });
    }
});

// Delete user (Admin)
router.delete("/:id", requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: "User not found" });
        await user.destroy();
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error deleting user" });
    }
});

export default router;