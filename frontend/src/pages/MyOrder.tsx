import { useEffect, useState } from "react"
import API from "../api/api"

const MyOrders = () => {
    const [orders, setOrders] = useState<any[]>([])
    const email = localStorage.getItem("customer_email")
    const token = localStorage.getItem("token")

    useEffect(() => {
        if (!email) return
        API.get(`/orders`, {
            params: { email },
            headers: token ? { Authorization: `Bearer ${token}` } : undefined
        }).then(r => setOrders(r.data || [])).catch(() => setOrders([]))
    }, [])

    return (
        <div style={{ padding: 30 }}>
            <h2>My Orders</h2>

            {orders.length === 0 && (
                <div style={{ marginTop: 20, padding: 40, textAlign: "center", borderRadius: 14, background: "var(--current-card-bg)", border: "1px solid var(--current-card-border)", color: "var(--current-text-secondary)" }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
                    <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 6, color: "var(--current-text)" }}>No orders yet</h3>
                    <p>Your order history will appear here after you place an order.</p>
                </div>
            )}

            {orders.map(o => (
                <div key={o.id} style={{ marginBottom: 14, padding: 12, border: "1px solid var(--current-card-border)", borderRadius: 12, background: "var(--current-card-bg)", color: "var(--current-text)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <strong>Order #{o.id}</strong>
                        <span>Rs {o.total}</span>
                    </div>
                    <div style={{ color: "var(--current-text-secondary)", marginTop: 4 }}>Status: {o.status || "placed"}</div>
                    {o.tracking_id && (
                        <div style={{ color: "var(--current-text-secondary)", marginTop: 2 }}>Tracking ID: {o.tracking_id}</div>
                    )}

                    {Array.isArray(o.items) && o.items.length > 0 && (
                        <div style={{ marginTop: 10 }}>
                            {o.items.map((it: any) => (
                                <div key={it.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--current-card-border)" }}>
                                    <span>
                                        {it.product?.name || `Product #${it.product_id}`} × {it.quantity}
                                        {it.product?.category ? (
                                            <span style={{ color: "var(--current-text-secondary)" }}> — {it.product.category}</span>
                                        ) : null}
                                    </span>
                                    <span>Rs {Number(it.price || 0) * Number(it.quantity || 0)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

export default MyOrders