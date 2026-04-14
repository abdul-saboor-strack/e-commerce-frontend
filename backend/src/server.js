import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import path from "path"
import { fileURLToPath } from "url"
import dotenv from "dotenv"
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import analytics from "./routes/analytics.js";
import authRoutes from "./routes/authRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";

import bcrypt from "bcryptjs"
import { Admin, sequelize } from "./models/index.js";

const app = express()

dotenv.config()



/* ✅ PATH SETUP — SIRF EK BAAR */
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/* ✅ CORS — REACT KO ALLOW KARO */
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

/* ✅ MIDDLEWARE */
app.use(express.json({ limit: "2mb" }));
app.use(bodyParser.json({ limit: "2mb" }));
app.use("/uploads", express.static("uploads"));

/* ✅ API ROUTES — DUPLICATE HATA DIYE */
app.use("/api/admin", adminRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/customers", customerRoutes)
app.use("/api/analytics", analytics)
app.use("/api/cart", cartRoutes)
app.use("/api/reviews", reviewRoutes)
app.use("/api/settings", settingsRoutes)

// Health
app.get("/api/health", (_req, res) => res.json({ ok: true }))

/* ✅ SERVE FRONTEND GUI */
app.use(express.static(path.join(__dirname, "../public")))

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"))
})

/* ✅ ERROR HANDLER */
app.use((err, _req, res, _next) => {
    console.error("API ERROR:", err)
    res.status(500).json({ message: "Server error" })
})

/* ✅ SERVER START */
const PORT = Number(process.env.PORT || 5174)

async function ensureDefaultAdmin() {
    const defaults = [
        { name: "Admin", email: process.env.ADMIN_EMAIL || "admin@store.com", password: process.env.ADMIN_PASSWORD || "admin123" },
        { name: "Admin", email: "admin@example.com", password: process.env.ADMIN_PASSWORD || "admin123" },
    ];

    for (const item of defaults) {
        const existing = await Admin.findOne({ where: { email: item.email } });
        if (!existing) {
            const hash = await bcrypt.hash(item.password, 10);
            await Admin.create({ name: item.name, email: item.email, password: hash });
            console.log(`Default admin created: ${item.email}`)
        }
    }
}

async function start() {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        await ensureDefaultAdmin();
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`)
        })
    } catch (e) {
        console.error("Failed to start server:", e)
        process.exit(1)
    }
}

start();