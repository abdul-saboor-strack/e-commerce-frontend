import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} from "../controllers/productController.js";
import { upload, uploadMultiple } from "../middleware/upload.js";
import { requireAdmin } from "../middleware/jwt.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", requireAdmin, uploadMultiple, createProduct);
router.put("/:id", requireAdmin, uploadMultiple, updateProduct);
router.delete("/:id", requireAdmin, deleteProduct);

export default router;
