import Category from "../models/Category.js";

// Get all categories
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: "Error fetching categories", error: err });
    }
};

// Add new category
export const addCategory = async (req, res) => {
    try {
        const { name, subcategories } = req.body;
        const category = await Category.create({ name, subcategories });
        res.json(category);
    } catch (err) {
        res.status(500).json({ message: "Error adding category", error: err });
    }
};

// Update category
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, subcategories } = req.body;
        await Category.update({ name, subcategories }, { where: { id } });
        res.json({ message: "Category updated" });
    } catch (err) {
        res.status(500).json({ message: "Error updating category", error: err });
    }
};

// Delete category
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await Category.destroy({ where: { id } });
        res.json({ message: "Category deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting category", error: err });
    }
};