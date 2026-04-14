import express from "express";
import { Order, OrderItem, Product, User } from "../models/index.js";
import { sendMail } from "../utils/mailer.js";
import { renderTemplate, generateTrackingId } from "../utils/templateHelpers.js";
import { loadSettings } from "../utils/settings.js";
import { requireAdmin } from "../middleware/jwt.js";

const router = express.Router()

// CREATE ORDER
router.post("/", async (req, res) => {
    try {
        const { customer_name, customer_email, items, total, user_id, shipping_address, city, country, phone, notes } = req.body;

        if (!customer_email || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "Invalid order payload" });
        }

        // Try to associate with a registered user if possible
        let userId = user_id || null;
        if (!userId) {
            const u = await User.findOne({ where: { email: customer_email } });
            userId = u ? u.id : null;
        }

        const trackingId = generateTrackingId();

        const order = await Order.create({
            user_id: userId,
            customer_name,
            customer_email,
            total,
            shipping_address: shipping_address || null,
            city: city || null,
            country: country || null,
            phone: phone || null,
            notes: notes || null,
            tracking_id: trackingId,
        })

        const orderItems = items.map(item => ({
            order_id: order.id,
            product_id: item.id,
            quantity: item.quantity,
            price: item.price
        }))

        await OrderItem.bulkCreate(orderItems)

        // reduce stock
        await Promise.all(
            items.map(async (item) => {
                const p = await Product.findByPk(item.id);
                if (!p) return;
                const nextStock = Math.max(0, Number(p.stock || 0) - Number(item.quantity || 0));
                await p.update({
                    stock: nextStock,
                    status: nextStock > 0 ? "active" : "out_of_stock",
                });
            })
        );

        // Email notifications (optional; works only if SMTP env is configured)
        const settings = await loadSettings();
        const itemLines = items
            .map((it) => `<li>${it.name || "Item"} × ${it.quantity} — Rs ${it.price}</li>`)
            .join("");

        const customerTemplate = settings.order_confirmation_email || `
          <h2>Order Confirmed ✅</h2>
          <p>Thanks {{customer_name}} — your order #{{order_id}} has been placed.</p>
          <p><strong>Tracking ID:</strong> {{tracking_id}}</p>
          <ul>{{item_lines}}</ul>
          <p><b>Total:</b> Rs {{total}}</p>
          <p><b>Delivery:</b> {{shipping_address}} {{city}} {{country}}</p>
          <p><b>Phone:</b> {{phone}}</p>
        `;

        const adminTemplate = settings.order_notification_email || `
          <h2>New Order 📦</h2>
          <p><b>Order #:</b> {{order_id}}</p>
          <p><b>Tracking ID:</b> {{tracking_id}}</p>
          <p><b>Customer:</b> {{customer_name}} ({{customer_email}})</p>
          <p><b>Phone:</b> {{phone}}</p>
          <p><b>Delivery:</b> {{shipping_address}} {{city}} {{country}}</p>
          <ul>{{item_lines}}</ul>
          <p><b>Total:</b> Rs {{total}}</p>
          {{notes}}
        `;

        const customerHtml = renderTemplate(customerTemplate, {
            customer_name: customer_name || "Customer",
            order_id: order.id,
            tracking_id: trackingId,
            item_lines: itemLines,
            total,
            shipping_address: shipping_address || "-",
            city: city ? `(${city})` : "",
            country: country || "",
            phone: phone || "-",
        });

        const adminHtml = renderTemplate(adminTemplate, {
            order_id: order.id,
            tracking_id: trackingId,
            customer_name: customer_name || "-",
            customer_email,
            phone: phone || "-",
            shipping_address: shipping_address || "-",
            city: city ? `(${city})` : "",
            country: country || "",
            item_lines: itemLines,
            total,
            notes: notes ? `<p><b>Notes:</b> ${notes}</p>` : "",
        });

        await sendMail({ to: customer_email, subject: `Order #${order.id} confirmed`, html: customerHtml });
        if (process.env.ADMIN_NOTIFY_EMAIL) {
            await sendMail({ to: process.env.ADMIN_NOTIFY_EMAIL, subject: `New order #${order.id}`, html: adminHtml });
        }

        res.json({ success: true, orderId: order.id })
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "Order save failed" })
    }
})


// GET MY ORDERS
router.get("/", async (req, res) => {
    try {
        const { email } = req.query

        const orders = await Order.findAll({
            where: { customer_email: email },
            order: [["id", "DESC"]],
            include: [
                {
                    model: OrderItem,
                    as: "items",
                    include: [
                        {
                            model: Product,
                            as: "product",
                            attributes: ["id", "name", "category", "subcategory", "image", "price"],
                        },
                    ],
                }
            ]
        })

        res.json(orders)
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch orders" })
    }
})

// UPDATE ORDER STATUS (Admin only)
router.put("/:id/status", requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await Order.findByPk(id);
        if (!order) return res.status(404).json({ error: "Order not found" });

        const oldStatus = order.status;
        await order.update({ status });

        // Send status update email if status changed
        if (oldStatus !== status) {
            const settings = await loadSettings();
            const statusTemplate = settings.order_status_email || `
                <h2>Order Status Update</h2>
                <p>Hi {{customer_name}},</p>
                <p>Your order #{{order_id}} status has been updated to: <strong>{{status}}</strong></p>
                <p><strong>Tracking ID:</strong> {{tracking_id}}</p>
                <p>Thank you for shopping with us!</p>
            `;

            const html = renderTemplate(statusTemplate, {
                customer_name: order.customer_name || "Customer",
                order_id: order.id,
                status: status.charAt(0).toUpperCase() + status.slice(1),
                tracking_id: order.tracking_id || "Not assigned",
            });

            await sendMail({
                to: order.customer_email,
                subject: `Order #${order.id} Status Update`,
                html
            });
        }

        res.json({ success: true, order });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update order status" });
    }
})

export default router