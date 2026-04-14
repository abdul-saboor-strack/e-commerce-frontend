import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";

import { Admin, User, Otp } from "../models/index.js";
import { sendMail } from "../utils/mailer.js";
import { recordLoginAttempt, clearLoginAttempts } from "../middleware/rateLimiter.js";

// Ensure JWT_SECRET is set in production
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable is required in production');
  }
  console.warn('⚠️ WARNING: Using default JWT_SECRET. Set JWT_SECRET environment variable in production!');
  return "dev_secret_change_me";
})();

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || (() => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_REFRESH_SECRET environment variable is required in production');
  }
  return "dev_refresh_secret_change_me";
})();

function signUser(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export const register = async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash, address: address || null });

    const token = signUser(user);
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, address: user.address },
    });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    let ok = false;
    try {
      ok = await bcrypt.compare(password, user.password);
    } catch {
      ok = false;
    }

    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signUser(user);
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, address: user.address },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress;

    // Input validation already done by middleware
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Normalize email
    const normalizedEmail = String(email).toLowerCase().trim();

    // Find admin - use constant time comparison to prevent timing attacks
    let admin = null;
    try {
      admin = await Admin.findOne({ where: { email: normalizedEmail } });
    } catch (err) {
      // Database error - don't expose details
      recordLoginAttempt(normalizedEmail, false, clientIp);
      return res.status(500).json({ message: "Authentication service temporarily unavailable" });
    }

    // Always perform bcrypt comparison to prevent timing attacks (even if user not found)
    let passwordMatches = false;
    try {
      if (admin) {
        passwordMatches = await bcrypt.compare(password, admin.password);
      } else {
        // Perform dummy comparison to maintain consistent timing
        await bcrypt.compare(password, "$2a$10$dummyhashtoavoidtimingattacks0000000000000000000000");
      }
    } catch (err) {
      console.error("Bcrypt error:", err);
      passwordMatches = false;
    }

    // Generic error message - don't reveal if user exists
    if (!admin || !passwordMatches) {
      recordLoginAttempt(normalizedEmail, false, clientIp);
      console.warn(`Failed login attempt for admin: ${normalizedEmail} from ${clientIp}`);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: "admin",
        type: "access"
      },
      JWT_SECRET,
      { expiresIn: "2h" } // Shorter expiry for security
    );

    const refreshToken = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: "admin",
        type: "refresh"
      },
      JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // Clear failed login attempts on successful login
    clearLoginAttempts(normalizedEmail, clientIp);

    console.log(`Successful admin login: ${normalizedEmail} from ${clientIp}`);

    // Return tokens - frontend should store refresh token in httpOnly cookie
    res.json({
      token: accessToken,
      refreshToken: refreshToken,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email
      }
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Authentication failed" });
  }
};

export const adminRefreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    // Verify token type
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ message: "Invalid token type" });
    }

    // Find admin
    const admin = await Admin.findByPk(decoded.id);
    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: "admin",
        type: "access"
      },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      token: newAccessToken,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email
      }
    });
  } catch (err) {
    console.error("Token refresh error:", err);
    res.status(500).json({ message: "Token refresh failed" });
  }
};

export const adminLogout = async (req, res) => {
  try {
    // In production, you'd invalidate the token in a blacklist/cache
    // For now, just return success - frontend should clear localStorage
    console.log(`Admin logout: ${req.admin?.email}`);
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: "Logout failed" });
  }
};

export const me = async (req, res) => {
  res.json({ user: req.user });
};

export const updateProfile = async (req, res) => {
  try {
    const { name, address, phone } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.update({
      name: name ?? user.name,
      address: address ?? user.address,
      phone: phone ?? user.phone,
    });

    res.json({
      user: { id: user.id, name: user.name, email: user.email, address: user.address, phone: user.phone },
    });
  } catch (err) {
    res.status(500).json({ message: "Profile update failed", error: err.message });
  }
};

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    // Check if user already exists
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: "Email already registered" });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP
    await Otp.upsert({
      email,
      otp,
      expiresAt,
    });

    // Send email
    const html = `
      <h2>Email Verification</h2>
      <p>Your OTP for account verification is: <strong>${otp}</strong></p>
      <p>This OTP will expire in 10 minutes.</p>
    `;

    await sendMail({ to: email, subject: "Email Verification OTP", html });

    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    res.status(500).json({ message: "Failed to send OTP", error: err.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp, name, password, address } = req.body;

    if (!email || !otp || !name || !password || !address) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find OTP
    const otpRecord = await Otp.findOne({
      where: {
        email,
        otp,
        expiresAt: { [Op.gt]: new Date() },
      },
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Create user
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash, address });

    // Delete OTP
    await otpRecord.destroy();

    // Generate token
    const token = signUser(user);

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, address: user.address },
    });
  } catch (err) {
    res.status(500).json({ message: "Verification failed", error: err.message });
  }
};
