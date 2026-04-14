import express from "express";
import { getPublicSettings, upsertSettings } from "../controllers/settingsController.js";
import { requireAdmin } from "../middleware/jwt.js";

const router = express.Router();

// Public settings for frontend theme/store texts
router.get("/", getPublicSettings);
router.put("/", requireAdmin, upsertSettings);

export default router;
