import express from "express";
import { register, login, adminLogin, adminRefreshToken, adminLogout, me, updateProfile, sendOtp, verifyOtp } from "../controllers/authController.js";
import { requireUser, requireAdmin } from "../middleware/jwt.js";
import { validateLoginInput, validateAdminRegistration } from "../middleware/validation.js";
import { adminLoginRateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// Admin authentication with security middleware
router.post("/admin/login", adminLoginRateLimiter, validateLoginInput, adminLogin);
router.post("/admin/refresh", adminRefreshToken);
router.post("/admin/logout", requireAdmin, adminLogout);

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

router.get("/me", requireUser, me);
router.put("/profile", requireUser, updateProfile);

export default router;