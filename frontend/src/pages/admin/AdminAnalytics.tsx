import React, { useEffect, useState } from "react"
import API from "../../api/api"

interface Stats {
    totalProducts: number
    totalOrders: number
    totalRevenue: number
}

const AdminAnalytics = () => {
    const [stats, setStats] = useState<Stats>({
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0
    })

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        const res = await API.get(`/analytics`)
        setStats(res.data)
    }

    return (
        <div>
            <h1 style={title}>Dashboard Analytics</h1>

            <div style={grid}>
                <div style={card}>
                    Total Products
                    <div style={number}>{stats.totalProducts}</div>
                </div>

                <div style={card}>
                    Total Orders
                    <div style={number}>{stats.totalOrders}</div>
                </div>

                <div style={card}>
                    Total Revenue
                    <div style={number}>Rs {stats.totalRevenue}</div>
                </div>
            </div>

            <div style={chartBox}>
                Analytics Overview
            </div>
        </div>
    )
}

export default AdminAnalytics


/* ================= STYLES ================= */

const title: React.CSSProperties = {
    fontSize: 26,
    fontWeight: 700,
    marginBottom: 20
}

const grid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 20,
    marginBottom: 25
}

const card: React.CSSProperties = {
    background: "var(--current-surface)",
    padding: 20,
    borderRadius: 14,
    color: "var(--current-text)",
    border: "1px solid var(--current-card-border)"
}

const number: React.CSSProperties = {
    fontSize: 28,
    fontWeight: 700,
    marginTop: 8
}

const chartBox: React.CSSProperties = {
    background: "var(--current-surface)",
    padding: 20,
    borderRadius: 14,
    color: "var(--current-text)",
    border: "1px solid var(--current-card-border)"
}