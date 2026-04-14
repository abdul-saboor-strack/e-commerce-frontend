import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import AdminLayout from "../../components/layout/AdminLayout"

const API = "http://localhost:5000/api"

interface Item {
    id: number
    product_name: string
    price: number
    quantity: number
}

interface Order {
    id: number
    customer_name: string
    total: number
    status: string
    created_at: string
}

const AdminOrderDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const [order, setOrder] = useState<Order | null>(null)
    const [items, setItems] = useState<Item[]>([])

    useEffect(() => {
        fetchOrder()
    }, [])

    const fetchOrder = async () => {
        const res = await axios.get(`${API}/orders/${id}`)
        setOrder(res.data.order)
        setItems(res.data.items)
    }

    if (!order) return <AdminLayout title="Order Details">Loading...</AdminLayout>

    return (
        <AdminLayout title={`Order #${order.id}`}>

            <button onClick={() => navigate(-1)} style={btnBack}>
                ← Back
            </button>

            <div style={card}>
                <h2>Order Info</h2>
                <p><b>Customer:</b> {order.customer_name || "Guest"}</p>
                <p><b>Status:</b> {order.status}</p>
                <p><b>Total:</b> Rs {order.total}</p>
                <p><b>Date:</b> {new Date(order.created_at).toLocaleString()}</p>
            </div>

            <div style={card}>
                <h2>Items</h2>

                <table style={table}>
                    <thead>
                        <tr>
                            <th style={th}>Product</th>
                            <th style={th}>Price</th>
                            <th style={th}>Qty</th>
                            <th style={th}>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(i => (
                            <tr key={i.id}>
                                <td style={td}>{i.product_name}</td>
                                <td style={td}>Rs {i.price}</td>
                                <td style={td}>{i.quantity}</td>
                                <td style={td}>Rs {i.price * i.quantity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </AdminLayout>
    )
}

export default AdminOrderDetails


/* ===== styles ===== */

const card: React.CSSProperties = {
    background: "var(--current-surface)",
    padding: 20,
    borderRadius: 12,
    color: "var(--current-text)",
    marginBottom: 20
}

const table: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    color: "var(--current-text)"
}

const th: React.CSSProperties = {
    padding: 12,
    textAlign: "left",
    borderBottom: "1px solid var(--current-card-border)"
}

const td: React.CSSProperties = {
    padding: 12,
    borderBottom: "1px solid var(--current-card-border)"
}

const btnBack: React.CSSProperties = {
    marginBottom: 15,
    padding: "8px 14px",
    background: "var(--current-button-secondary)",
    color: "var(--current-button-text)",
    border: "none",
    borderRadius: 8,
    cursor: "pointer"
}