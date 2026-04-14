import React from "react"
import { Link, useLocation } from "react-router-dom"

const AdminSidebar = () => {
    const { pathname } = useLocation()

    const menu = [
        { label: "Dashboard", path: "/admin" },
        { label: "Products", path: "/admin/products" },
        { label: "Categories", path: "/admin/categories" },
        { label: "Orders", path: "/admin/orders" },
        { label: "Customers", path: "/admin/customers" },
        { label: "Analytics", path: "/admin/analytics" },
        { label: "Settings", path: "/admin/settings" }
    ]

    return (
        <aside style={sidebar}>
            <h2 style={logo}>ADMIN</h2>

            <nav style={nav}>
                {menu.map(item => (
                    <Link
                        key={item.path}
                        to={item.path}
                        style={{
                            ...link,
                            background: pathname === item.path ? "var(--current-accent)" : "var(--current-surface)"
                        }}
                    >
                        {item.label}
                    </Link>
                ))}
            </nav>
        </aside>
    )
}

export default AdminSidebar

/* ===== STYLES ===== */

const sidebar: React.CSSProperties = {
    width: 260,
    background: "var(--current-bg)",
    padding: 20,
    borderRight: "1px solid var(--current-card-border)"
}

const logo: React.CSSProperties = {
    marginBottom: 30
}

const nav: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 10
}

const link: React.CSSProperties = {
    color: "var(--current-text)",
    textDecoration: "none",
    padding: 12,
    borderRadius: 10
}