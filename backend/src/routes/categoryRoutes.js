import express from "express";
import { Category, Subcategory } from "../models/index.js";
import { requireAdmin } from "../middleware/jwt.js";

const router = express.Router();

// Get categories with subcategories (for dropdowns / filters)
router.get("/", async (_req, res) => {
  try {
    const categories = await Category.findAll({
      order: [["name", "ASC"]],
      include: [{ model: Subcategory, as: "subcategories", order: [["name", "ASC"]], required: false }],
    });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Error fetching categories", error: err.message });
  }
});

// Create category
router.post("/", requireAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Category name required" });
    const category = await Category.create({ name });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: "Error adding category", error: err.message });
  }
});

// Delete category
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await Subcategory.destroy({ where: { category_id: req.params.id } });
    await Category.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Error deleting category", error: err.message });
  }
});

// Create subcategory
router.post("/:categoryId/subcategories", requireAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Subcategory name required" });
    const sub = await Subcategory.create({ name, category_id: Number(req.params.categoryId) });
    res.json(sub);
  } catch (err) {
    res.status(500).json({ message: "Error adding subcategory", error: err.message });
  }
});

// Delete subcategory
router.delete("/subcategories/:id", requireAdmin, async (req, res) => {
  try {
    await Subcategory.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Error deleting subcategory", error: err.message });
  }
});

export default router;
