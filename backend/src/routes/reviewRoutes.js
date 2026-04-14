import express from "express";
import { Review, User } from "../models/index.js";
import { requireUser } from "../middleware/jwt.js";

const router = express.Router();

// List reviews for a product
router.get("/", async (req, res) => {
  try {
    const { product_id } = req.query;
    if (!product_id) return res.json([]);

    const rows = await Review.findAll({
      where: { product_id: Number(product_id) },
      order: [["id", "DESC"]],
      include: [{ model: User, as: "user", attributes: ["id", "name"] }],
    });

    const mapped = rows.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      name: r.user?.name || r.name || "Customer",
    }));

    res.json(mapped);
  } catch (e) {
    res.status(500).json({ message: "Failed to load reviews" });
  }
});

// Create review
router.post("/", requireUser, async (req, res) => {
  try {
    const { product_id, rating, comment } = req.body;
    if (!product_id || !comment) {
      return res.status(400).json({ message: "product_id and comment are required" });
    }
    const cleanRating = Math.min(5, Math.max(1, Number(rating || 5)));
    const row = await Review.create({
      product_id: Number(product_id),
      user_id: req.user.id,
      name: req.user.name,
      rating: cleanRating,
      comment: String(comment).trim(),
    });
    res.json({ success: true, id: row.id });
  } catch (e) {
    res.status(500).json({ message: "Failed to create review" });
  }
});

export default router;
