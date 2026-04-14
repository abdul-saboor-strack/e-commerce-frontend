import express from "express";
import { getCart, addToCart, removeFromCart } from "../controllers/cartController.js";

const router = express.Router();

router.get("/:userId", getCart);
router.post("/:userId/add", addToCart);
router.delete("/:userId/remove/:productId", removeFromCart);

export default router;