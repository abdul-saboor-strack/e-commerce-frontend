import React, { useState, useRef, useEffect } from "react"
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom"
import { Menu, X, LogOut, Settings, LayoutDashboard, Package, Layers, ShoppingCart, Users, BarChart3, Cog } from "lucide-react"

type Props = {
    title?: string
    cartItems?: any[]
    wishlist?: any[]
}

const AdminLayout: React.FC<Props> = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [openProfile, setOpenProfile] = useState(false)
    const profileDropdownRef = useRef<HTMLDivElement>(null)

    const adminName = localStorage.getItem("admin_name") || "Admin"
    const adminEmail = localStorage.getItem("admin_email") || "admin@mail.com"

    // Handle click outside dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
                setOpenProfile(false)
            }
        }

        if (openProfile) {
            document.addEventListener("mousedown", handleClickOutside)
            return () => document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [openProfile])

    const logout = () => {
        console.log("🚪 [AdminLayout] Logging out - clearing sessionStorage");
        sessionStorage.removeItem("adminToken")
        sessionStorage.removeItem("adminRefreshToken")
        localStorage.removeItem("admin_name")
        localStorage.removeItem("admin_email")
        localStorage.removeItem("admin_login_time")
        navigate("/admin/login", { replace: true })
    }

    const isActive = (path: string) => location.pathname === path

    const navItems = [
        { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { path: "/admin/products", label: "Products", icon: Package },
        { path: "/admin/categories", label: "Categories", icon: Layers },
        { path: "/admin/orders", label: "Orders", icon: ShoppingCart },
        { path: "/admin/customers", label: "Customers", icon: Users },
        { path: "/admin/analytics", label: "Analytics", icon: BarChart3 },
        { path: "/admin/settings", label: "Settings", icon: Cog },
    ]

    return (
        <div className="flex h-screen bg-[var(--current-outer-bg)] text-[var(--current-text)]" data-section="admin" data-theme="admin">
            {/* SIDEBAR OVERLAY (Mobile) */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside className={`
                fixed inset-y-0 left-0 w-64 bg-[var(--current-surface)] border-r border-[var(--current-card-border)] z-40
                transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:z-0
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                flex flex-col overflow-y-auto shadow-sm
            `}>
                {/* SIDEBAR HEADER */}
                <div className="flex items-center justify-between p-5 border-b border-[var(--current-card-border)]">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--current-accent) 20%, transparent 80%)' }}>
                            <span className="font-bold" style={{ color: 'var(--current-accent)' }}>A</span>
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-[var(--current-text)]">Admin Panel</div>
                            <div className="text-xs text-[var(--current-text-secondary)]">Store Management</div>
                        </div>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-1 hover:bg-[var(--current-bg)]/10 rounded text-[var(--current-text-secondary)]"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* NAVIGATION */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map(({ path, label, icon: Icon }) => (
                        <Link
                            key={path}
                            to={path}
                            onClick={() => setSidebarOpen(false)}
                            className={`
                                flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                                ${isActive(path)
                                    ? "bg-[var(--current-accent)]/20 text-[var(--current-accent)] border-l-2 border-[var(--current-accent)]"
                                    : "text-[var(--current-text-secondary)] hover:text-[var(--current-text)] hover:bg-[var(--current-accent)]/10"
                                }
                            `}
                        >
                            <Icon size={18} className="shrink-0" />
                            <span className="text-sm font-medium">{label}</span>
                        </Link>
                    ))}
                </nav>

                {/* SIDEBAR FOOTER */}
                <div className="border-t border-[var(--current-card-border)] p-4">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--current-text-secondary)] hover:text-red-400 hover:bg-red-500/10 transition"
                    >
                        <LogOut size={18} />
                        <span className="text-sm font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* TOP BAR */}
                <header className="bg-[var(--current-surface)] border-b border-[var(--current-card-border)] px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-20">
                    {/* LEFT SECTION */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 hover:bg-[var(--current-bg)]/10 rounded-lg text-[var(--current-text-secondary)]"
                        >
                            <Menu size={24} />
                        </button>
                        <div>
                            <h1 className="text-xl font-semibold hidden sm:block">Admin Dashboard</h1>
                            <h1 className="text-lg font-semibold sm:hidden">Dashboard</h1>
                        </div>
                    </div>

                    {/* RIGHT SECTION */}
                    <div className="relative" ref={profileDropdownRef}>
                        <button
                            onClick={() => setOpenProfile(!openProfile)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--current-bg)]/10 transition"
                        >
                            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--current-accent) 20%, transparent 80%)' }}>
                                <span className="text-xs font-bold" style={{ color: 'var(--current-accent)' }}>
                                    {adminName.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="text-sm font-medium hidden sm:block truncate max-w-[200px]">
                                {adminName}
                            </div>
                        </button>

                        {/* DROPDOWN */}
                        {openProfile && (
                            <div className="absolute right-0 mt-2 w-72 bg-[var(--current-surface)] border border-[var(--current-card-border)] rounded-lg shadow-xl overflow-hidden z-50">
                                {/* PROFILE HEADER */}
                                <div className="p-4 border-b border-[var(--current-card-border)] bg-[var(--current-accent)]/5">
                                    <div className="w-12 h-12 rounded-full bg-[var(--current-accent)]/20 flex items-center justify-center mx-auto mb-3">
                                        <span className="text-lg font-bold text-[var(--current-accent)]">
                                            {adminName.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="text-center text-sm">
                                        <div className="font-semibold text-[var(--current-text)]">{adminName}</div>
                                        <div className="text-xs text-[var(--current-text-secondary)] break-all">{adminEmail}</div>
                                    </div>
                                </div>

                                {/* DROPDOWN ITEMS */}
                                <div className="p-2">
                                    <button
                                        onClick={() => {
                                            navigate("/admin/profile")
                                            setOpenProfile(false)
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg hover:bg-[var(--current-bg)]/10 transition text-[var(--current-text-secondary)] hover:text-[var(--current-text)]"
                                    >
                                        <Settings size={16} />
                                        Profile Settings
                                    </button>

                                    <button
                                        onClick={() => {
                                            logout()
                                            setOpenProfile(false)
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg hover:bg-red-500/10 transition text-red-400 hover:text-red-300"
                                    >
                                        <LogOut size={16} />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                {/* PAGE CONTENT */}
                <main className="flex-1 overflow-y-auto">
                    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}

export default AdminLayout