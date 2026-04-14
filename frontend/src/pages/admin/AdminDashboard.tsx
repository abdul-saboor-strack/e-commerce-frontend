import React, { useEffect, useState, useMemo } from "react"
import API from "../../api/api"
import { TrendingUp, ShoppingCart, Users, Package, ArrowUpRight, Calendar } from "lucide-react"

const AdminDashboard = () => {

    const [stats, setStats] = useState<any>({
        revenue: 0,
        orders: 0,
        customers: 0,
        products: 0
    })

    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [startDate, setStartDate] = useState(() => {
        const date = new Date()
        date.setDate(date.getDate() - 30)
        return date.toISOString().split('T')[0]
    })
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0])

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const [statsRes, ordersRes] = await Promise.allSettled([
                    API.get(`/admin/stats`),
                    API.get(`/admin/recent-orders`)
                ])

                // ✅ STATS SAFE
                if (statsRes.status === "fulfilled" && statsRes.value?.data) {
                    setStats({
                        revenue: statsRes.value.data.revenue ?? 0,
                        orders: statsRes.value.data.orders ?? 0,
                        customers: statsRes.value.data.customers ?? 0,
                        products: statsRes.value.data.products ?? 0
                    })
                } else {
                    console.error("Stats fetch failed")
                    setStats({ revenue: 0, orders: 0, customers: 0, products: 0 })
                }

                // ✅ ORDERS SAFE
                if (ordersRes.status === "fulfilled" && Array.isArray(ordersRes.value?.data)) {
                    setOrders(ordersRes.value.data)
                } else {
                    console.error("Orders fetch failed")
                    setOrders([])
                }

            } catch (err) {
                console.error("Dashboard error:", err)
                setStats({ revenue: 0, orders: 0, customers: 0, products: 0 })
                setOrders([])
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [startDate, endDate])

    // Calculate advanced metrics
    const metrics = useMemo(() => {
        const filteredOrders = orders.filter(o => {
            const orderDate = new Date(o.createdAt || o.date).toISOString().split('T')[0]
            return orderDate >= startDate && orderDate <= endDate
        })

        const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0)
        const avgOrderValue = filteredOrders.length > 0 ? (totalRevenue / filteredOrders.length).toFixed(0) : 0

        const statusCounts = {
            completed: filteredOrders.filter(o => o.status === 'completed').length,
            pending: filteredOrders.filter(o => o.status === 'pending').length,
            shipped: filteredOrders.filter(o => o.status === 'shipped').length,
            cancelled: filteredOrders.filter(o => o.status === 'cancelled').length,
        }

        return {
            totalRevenue,
            avgOrderValue,
            totalOrders: filteredOrders.length,
            statusCounts
        }
    }, [orders, startDate, endDate])

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin mb-4" style={{ color: 'var(--current-accent)' }}>⚙️</div>
                <p style={{ color: 'var(--current-text-secondary)' }}>Loading dashboard...</p>
            </div>
        </div>
    )

    const statCards = [
        { label: "Total Revenue", value: `Rs ${stats.revenue}`, icon: TrendingUp, color: "from-green-500/20 to-transparent" },
        { label: "Total Orders", value: stats.orders, icon: ShoppingCart, color: "from-blue-500/20 to-transparent" },
        { label: "Customers", value: stats.customers, icon: Users, color: "from-purple-500/20 to-transparent" },
        { label: "Products", value: stats.products, icon: Package, color: "from-orange-500/20 to-transparent" },
    ]

    return (
        <div className="space-y-8">
            {/* PAGE HEADER */}
            <div className="animate-fade-in-up">
                <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--current-text)' }}>Welcome back!</h1>
                <p style={{ color: 'var(--current-text-secondary)' }}>Here's an overview of your store performance</p>
            </div>

            {/* STATS CARDS */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map(({ label, value, icon: Icon, color }, idx) => (
                    <div
                        key={idx}
                        className="relative overflow-hidden rounded-2xl p-6 group shadow-sm transition-transform duration-500 hover:-translate-y-1 hover:shadow-soft cursor-default"
                        style={{ background: 'var(--current-card-bg)', border: '1px solid var(--current-card-border)' }}
                    >
                        <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: 'linear-gradient(90deg, var(--current-accent), transparent)' }} />
                        <div className="relative space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--current-surface) 50%, transparent 50%)' }}>
                                    <Icon size={24} style={{ color: 'var(--current-text-secondary)' }} />
                                </div>
                                <ArrowUpRight size={18} className="transition" style={{ color: 'var(--current-text-secondary)' }} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium" style={{ color: 'var(--current-text-secondary)' }}>{label}</p>
                                <p className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--current-text)' }}>
                                    {typeof value === 'number' && value > 1000 ? (value / 1000).toFixed(1) + 'k' : value}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* DATE RANGE FILTER */}
            <div className="rounded-2xl p-6 shadow-sm" style={{ background: 'var(--current-card-bg)', border: '1px solid var(--current-card-border)' }}>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Calendar size={20} style={{ color: 'var(--current-text-secondary)' }} />
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--current-text-secondary)' }}>Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="input w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--current-text-secondary)' }}>End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="input w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ANALYTICS CARDS */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-2xl p-6 shadow-sm transition-transform duration-300 hover:scale-[1.02]" style={{ background: 'var(--current-card-bg)', border: '1px solid var(--current-card-border)' }}>
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium" style={{ color: 'var(--current-text-secondary)' }}>Period Revenue</p>
                        <TrendingUp size={18} style={{ color: 'var(--current-accent)' }} />
                    </div>
                    <p className="text-3xl font-bold" style={{ color: 'var(--current-text)' }}>Rs {metrics.totalRevenue.toLocaleString()}</p>
                    <p className="text-xs mt-2" style={{ color: 'var(--current-text-secondary)' }}>Based on selected date range</p>
                </div>

                <div className="rounded-2xl p-6 shadow-sm transition-transform duration-300 hover:scale-[1.02]" style={{ background: 'var(--current-card-bg)', border: '1px solid var(--current-card-border)' }}>
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium" style={{ color: 'var(--current-text-secondary)' }}>Avg Order Value</p>
                        <ShoppingCart size={18} style={{ color: 'var(--current-accent)' }} />
                    </div>
                    <p className="text-3xl font-bold" style={{ color: 'var(--current-text)' }}>Rs {metrics.avgOrderValue.toLocaleString()}</p>
                    <p className="text-xs mt-2" style={{ color: 'var(--current-text-secondary)' }}>{metrics.totalOrders} orders</p>
                </div>

                <div className="rounded-2xl p-6 shadow-sm transition-transform duration-300 hover:scale-[1.02]" style={{ background: 'var(--current-card-bg)', border: '1px solid var(--current-card-border)' }}>
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium" style={{ color: 'var(--current-text-secondary)' }}>Completion Rate</p>
                        <Package size={18} style={{ color: 'var(--current-accent)' }} />
                    </div>
                    <p className="text-3xl font-bold" style={{ color: 'var(--current-text)' }}>
                        {metrics.totalOrders > 0 ? ((metrics.statusCounts.completed / metrics.totalOrders) * 100).toFixed(0) : 0}%
                    </p>
                    <p className="text-xs mt-2" style={{ color: 'var(--current-text-secondary)' }}>{metrics.statusCounts.completed} completed</p>
                </div>
            </div>

            {/* ORDER STATUS BREAKDOWN */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl p-4 shadow-sm" style={{ background: 'var(--current-card-bg)', border: '1px solid var(--current-card-border)' }}>
                    <p className="text-xs font-semibold mb-2" style={{ color: 'var(--current-text-secondary)' }}>COMPLETED</p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--current-accent)' }}>{metrics.statusCounts.completed}</p>
                </div>
                <div className="rounded-2xl p-4" style={{ background: 'var(--current-card-bg)', border: '1px solid var(--current-card-border)' }}>
                    <p className="text-xs font-semibold mb-2" style={{ color: 'var(--current-text-secondary)' }}>PENDING</p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--current-accent)' }}>{metrics.statusCounts.pending}</p>
                </div>
                <div className="rounded-2xl p-4" style={{ background: 'var(--current-card-bg)', border: '1px solid var(--current-card-border)' }}>
                    <p className="text-xs font-semibold mb-2" style={{ color: 'var(--current-text-secondary)' }}>SHIPPED</p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--current-accent)' }}>{metrics.statusCounts.shipped}</p>
                </div>
                <div className="rounded-2xl p-4" style={{ background: 'var(--current-card-bg)', border: '1px solid var(--current-card-border)' }}>
                    <p className="text-xs font-semibold mb-2" style={{ color: 'var(--current-text-secondary)' }}>CANCELLED</p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--current-accent)' }}>{metrics.statusCounts.cancelled}</p>
                </div>
            </div>

            {/* RECENT ORDERS */}
            <div className="rounded-2xl border border-[var(--current-card-border)] bg-[var(--current-surface)] overflow-hidden shadow-sm">
                {/* HEADER */}
                <div className="border-b border-[var(--current-card-border)] px-6 py-4">
                    <h2 className="text-xl font-semibold" style={{ color: 'var(--current-text)' }}>Recent Orders</h2>
                </div>

                {/* TABLE */}
                {orders.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                        <ShoppingCart className="mx-auto mb-3 text-[var(--current-text-secondary)]" size={32} />
                        <p className="text-[var(--current-text-secondary)]">No orders yet. Start selling!</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[var(--current-card-border)] text-sm text-[var(--current-text-secondary)]">
                                    <th className="px-6 py-4 text-left font-semibold">Order ID</th>
                                    <th className="px-6 py-4 text-left font-semibold hidden sm:table-cell">Customer</th>
                                    <th className="px-6 py-4 text-left font-semibold">Amount</th>
                                    <th className="px-6 py-4 text-left font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.slice(0, 10).map((order, idx) => (
                                    <tr
                                        key={order.id}
                                        className="border-b border-[var(--current-card-border)] hover:bg-[var(--current-bg)]/60 transition text-sm"
                                    >
                                        <td className="px-6 py-4 font-mono text-[var(--current-accent)]">#{order.id}</td>
                                        <td className="px-6 py-4 hidden sm:table-cell text-[var(--current-text-secondary)]">{order.customer}</td>
                                        <td className="px-6 py-4 font-semibold text-[var(--current-text)]">Rs {order.total}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                                order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    order.status === 'shipped' ? 'bg-blue-500/20 text-blue-400' :
                                                        'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AdminDashboard