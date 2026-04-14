import React, { useEffect, useState } from "react"
import API from "../../api/api"
import { X, Eye, CheckCircle, Truck, Clock } from "lucide-react"

interface OrderItem {
    product_name?: string
    product?: { id: number; name: string; price: number }
    quantity: number
    price: number
}

interface Order {
    id: number
    customer_name?: string
    customer_email?: string
    total: number
    status: "placed" | "processing" | "shipped" | "delivered" | "cancelled"
    createdAt: string
    shipping_address?: string
    city?: string
    country?: string
    phone?: string
    notes?: string
    items?: OrderItem[]
}

const AdminOrders = () => {
    const [orders, setOrders] = useState<Order[]>([])
    const [selected, setSelected] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            const res = await API.get(`/admin/orders`)
            setOrders(res.data || [])
        } finally {
            setLoading(false)
        }
    }

    const updateStatus = async (id: number, status: string) => {
        await API.put(`/orders/${id}/status`, { status })
        fetchOrders()
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'placed': return 'bg-yellow-500/20 text-yellow-400'
            case 'processing': return 'bg-blue-500/20 text-blue-400'
            case 'shipped': return 'bg-purple-500/20 text-purple-400'
            case 'delivered': return 'bg-green-500/20 text-green-400'
            case 'cancelled': return 'bg-red-500/20 text-red-400'
            default: return 'bg-gray-500/20 text-gray-400'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'delivered': return <CheckCircle size={16} />
            case 'shipped': return <Truck size={16} />
            case 'processing': return <Clock size={16} />
            default: return null
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-[var(--current-text-secondary)]">Loading orders...</p>
        </div>
    )

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div>
                <h1 className="text-3xl font-bold mb-2">Orders Management</h1>
                <p className="text-[var(--current-text-secondary)]">Manage and track all customer orders</p>
            </div>

            {/* ORDERS TABLE */}
            <div className="rounded-2xl border border-[var(--current-card-border)] bg-[var(--current-surface)] overflow-hidden">
                {orders.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-[var(--current-text-secondary)] mb-2">No orders found</p>
                        <p className="text-sm text-[var(--current-text-secondary)]">Start selling to see orders here</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-[var(--current-card-border)] bg-[var(--current-bg)]/5">
                                <tr>
                                    <th className="px-4 sm:px-6 py-4 text-left font-semibold text-[var(--current-text)]">ID</th>
                                    <th className="px-4 sm:px-6 py-4 text-left font-semibold text-[var(--current-text)] hidden sm:table-cell">Customer</th>
                                    <th className="px-4 sm:px-6 py-4 text-left font-semibold text-[var(--current-text)]">Amount</th>
                                    <th className="px-4 sm:px-6 py-4 text-left font-semibold text-[var(--current-text)]">Status</th>
                                    <th className="px-4 sm:px-6 py-4 text-left font-semibold text-[var(--current-text)] hidden lg:table-cell">Date</th>
                                    <th className="px-4 sm:px-6 py-4 text-center font-semibold text-[var(--current-text)]">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order, idx) => (
                                    <tr key={order.id} className="border-b border-[var(--current-card-border)] hover:bg-[var(--current-bg)]/60 transition">
                                        <td className="px-4 sm:px-6 py-4">
                                            <span className="font-mono text-[var(--current-accent)]">#{order.id}</span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 hidden sm:table-cell text-[var(--current-text)]">
                                            <div className="truncate max-w-[200px]">{order.customer_name}</div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 font-semibold text-[var(--current-text)]">
                                            Rs {order.total}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4">
                                            <select
                                                value={order.status}
                                                onChange={e => updateStatus(order.id, e.target.value)}
                                                className={`px-2 py-1 rounded-lg text-xs font-medium border border-[var(--current-card-border)] bg-[var(--current-surface)] text-[var(--current-text)] transition hover:bg-[var(--current-bg)]/10 cursor-pointer ${getStatusColor(order.status)}`}
                                            >
                                                <option value="placed">Placed</option>
                                                <option value="processing">Processing</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 hidden lg:table-cell text-[var(--current-text-secondary)] text-xs">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 text-center">
                                            <button
                                                onClick={() => setSelected(order)}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 transition text-sm font-medium"
                                            >
                                                <Eye size={14} />
                                                <span className="hidden sm:inline">View</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* DETAIL MODAL */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-[var(--current-surface)] border border-[var(--current-card-border)] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* HEADER */}
                        <div className="sticky top-0 border-b border-[var(--current-card-border)] bg-[var(--current-bg)]/5 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-[var(--current-text)]">Order #{selected.id}</h2>
                            <button
                                onClick={() => setSelected(null)}
                                className="p-1 hover:bg-[var(--current-bg)]/10 rounded-lg transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* CONTENT */}
                        <div className="p-6 space-y-6">
                            {/* CUSTOMER INFO */}
                            <div className="space-y-3">
                                <h3 className="font-semibold text-[var(--current-text)]">Customer Information</h3>
                                <div className="grid gap-3 text-sm">
                                    <div className="flex items-center justify-between border-b border-[var(--current-card-border)] pb-2">
                                        <span className="text-[var(--current-text-secondary)]">Name:</span>
                                        <span className="text-[var(--current-text)]">{selected.customer_name}</span>
                                    </div>
                                    <div className="flex items-center justify-between border-b border-[var(--current-card-border)] pb-2">
                                        <span className="text-[var(--current-text-secondary)]">Email:</span>
                                        <span className="break-all text-[var(--current-text)]">{selected.customer_email}</span>
                                    </div>
                                    {selected.phone && (
                                        <div className="flex items-center justify-between border-b border-[var(--current-card-border)] pb-2">
                                            <span className="text-[var(--current-text-secondary)]">Phone:</span>
                                            <span className="text-[var(--current-text)]">{selected.phone}</span>
                                        </div>
                                    )}
                                    {selected.city && (
                                        <div className="flex items-center justify-between border-b border-[var(--current-card-border)] pb-2">
                                            <span className="text-[var(--current-text-secondary)]">City:</span>
                                            <span className="text-[var(--current-text)]">{selected.city}</span>
                                        </div>
                                    )}
                                    {selected.country && (
                                        <div className="flex items-center justify-between border-b border-[var(--current-card-border)] pb-2">
                                            <span className="text-[var(--current-text-secondary)]">Country:</span>
                                            <span className="text-[var(--current-text)]">{selected.country}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* SHIPPING ADDRESS */}
                            {selected.shipping_address && (
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-[var(--current-text)]">Shipping Address</h3>
                                    <p className="text-sm text-[var(--current-text-secondary)] bg-[var(--current-bg)]/5 rounded-lg p-3">
                                        {selected.shipping_address}
                                    </p>
                                </div>
                            )}

                            {/* ORDER ITEMS */}
                            <div className="space-y-3">
                                <h3 className="font-semibold text-[var(--current-text)]">Order Items</h3>
                                <div className="space-y-2">
                                    {selected.items?.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-[var(--current-bg)]/5 rounded-lg">
                                            <span className="text-sm text-[var(--current-text)]">{item.product_name || item.product?.name || "Item"}</span>
                                            <span className="text-sm font-mono text-[var(--current-text-secondary)]">
                                                {item.quantity} × Rs {item.price}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* NOTES */}
                            {selected.notes && (
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-[var(--current-text)]">Notes</h3>
                                    <p className="text-sm text-[var(--current-text-secondary)] bg-[var(--current-bg)]/5 rounded-lg p-3">
                                        {selected.notes}
                                    </p>
                                </div>
                            )}

                            {/* SUMMARY */}
                            <div className="border-t border-[var(--current-card-border)] pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-lg font-semibold text-[var(--current-text)]">Total Amount:</span>
                                    <span className="text-2xl font-bold text-indigo-400">Rs {selected.total}</span>
                                </div>
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="border-t border-[var(--current-card-border)] bg-[var(--current-bg)]/5 px-6 py-4">
                            <button
                                onClick={() => setSelected(null)}
                                className="w-full px-4 py-2 rounded-lg bg-[var(--current-bg)]/10 hover:bg-[var(--current-bg)]/20 transition font-medium text-[var(--current-text)]"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminOrders