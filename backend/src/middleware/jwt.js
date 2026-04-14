import jwt from "jsonwebtoken";
import { Admin, User } from "../models/index.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

export const requireUser = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Missing auth token" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      attributes: ["id", "name", "email", "address", "phone"],
    });
    if (!user) return res.status(401).json({ message: "Invalid token" });

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export const requireAdmin = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Missing admin token" });

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded?.role !== "admin") return res.status(403).json({ message: "Admin access required" });

    const admin = await Admin.findByPk(decoded.id, { attributes: ["id", "name", "email"] });
    if (!admin) return res.status(401).json({ message: "Invalid admin token" });

    req.admin = admin;
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
