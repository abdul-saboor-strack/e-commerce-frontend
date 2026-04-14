import React, { useEffect } from "react"
import API from "./api/api"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Account from "./pages/Account"
import Home from "./pages/Home"
import Cart from "./pages/Cart"
import Wishlist from "./pages/Wishlist"
import Checkout from "./pages/Checkout"
import MyOrders from "./pages/MyOrder"
import OrderDetails from "./pages/admin/OrderDetails"
import AdminProfile from "./pages/admin/AdminProfile"
import AdminLayout from "./components/layout/AdminLayout"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminProducts from "./pages/admin/AdminProducts"
import AdminCategories from "./pages/admin/AdminCategories"
import AdminOrders from "./pages/admin/AdminOrders"
import AdminCustomers from "./pages/admin/AdminCustomers"
import AdminSettings from "./pages/admin/AdminSettings"
import AppearanceSettings from "./components/settings/AppearanceSettings"
import GeneralSettings from "./components/settings/GeneralSettings"
import AccountSettings from "./components/settings/AccountSettings"
import ContentSettings from "./components/settings/ContentSettings"
import SocialSettings from "./components/settings/SocialSettings"
import ServicesSettings from "./components/settings/ServicesSettings"
import NotificationSettings from "./components/settings/NotificationSettings"
import AdminAnalytics from "./pages/admin/AdminAnalytics"
import AdminLogin from "./pages/admin/AdminLogin"
import AdminProtectedRoute from "./pages/admin/AdminProtectedRoute"
import StoreLayout from "./components/layout/StoreLayout"
import { fetchAndCacheSettings } from "./hooks/useSettings"
import SettingsManager from "./components/SettingsManager"
import ProductDetail from "./pages/ProductDetail"
import "./index.css"

const applyStoreSettings = (s: any) => {
    const r = document.documentElement;
    if (!s) return;
    if (s.theme_primary) r.style.setProperty("--theme-primary", s.theme_primary);
    if (s.theme_accent) r.style.setProperty("--theme-accent", s.theme_accent);
    if (s.theme_bg) r.style.setProperty("--theme-bg", s.theme_bg);
    if (s.theme_surface) r.style.setProperty("--theme-surface", s.theme_surface);
    if (s.theme_text) r.style.setProperty("--theme-text", s.theme_text);
};

function App() {
    useEffect(() => {
        // CRITICAL: Check admin session validity on every app load
        const checkAdminSession = async () => {
            const adminToken = sessionStorage.getItem("adminToken");
            const adminRefreshToken = sessionStorage.getItem("adminRefreshToken");

            console.log("🔷 [App] Checking admin session on startup...");
            console.log("   Has adminToken (sessionStorage):", !!adminToken);
            console.log("   Has adminRefreshToken (sessionStorage):", !!adminRefreshToken);

            // If tokens exist in session, validate them
            if (adminToken && adminRefreshToken) {
                try {
                    const response = await API.post("/auth/admin/refresh", {
                        refreshToken: adminRefreshToken,
                    });
                    if (response.status === 200) {
                        console.log("✅ [App] Admin tokens are VALID");
                        if (response.data.token) {
                            sessionStorage.setItem("adminToken", response.data.token);
                        }
                    } else {
                        console.error("❌ [App] Admin tokens INVALID - clearing");
                        sessionStorage.removeItem("adminToken");
                        sessionStorage.removeItem("adminRefreshToken");
                        localStorage.removeItem("admin_name");
                        localStorage.removeItem("admin_email");
                        localStorage.removeItem("admin_login_time");
                    }
                } catch (error) {
                    console.error("❌ [App] Admin token validation FAILED - clearing all tokens");
                    sessionStorage.removeItem("adminToken");
                    sessionStorage.removeItem("adminRefreshToken");
                    localStorage.removeItem("admin_name");
                    localStorage.removeItem("admin_email");
                    localStorage.removeItem("admin_login_time");
                }
            }
        };

        checkAdminSession();

        // Apply store settings
        (async () => {
            const settings = await fetchAndCacheSettings();
            if (settings) {
                applyStoreSettings(settings);
                if (typeof window !== "undefined") {
                    window.dispatchEvent(new Event("settingsUpdated"));
                }
            }
        })();

        // Also listen for settings updates from admin panel
        const handleSettingsUpdated = () => {
            // Reload settings from localStorage
            const merged: any = {};
            ["theme_primary", "theme_accent", "theme_bg", "theme_surface", "theme_text"].forEach(key => {
                const val = localStorage.getItem(key);
                if (val) merged[key] = val;
            });
            if (Object.keys(merged).length > 0) {
                applyStoreSettings(merged);
            }
        };

        window.addEventListener("settingsUpdated", handleSettingsUpdated);
        return () => window.removeEventListener("settingsUpdated", handleSettingsUpdated);
    }, []);

    return (
        <BrowserRouter>
            <SettingsManager />
            <Routes>

                {/* ================= STORE ROUTES ================= */}

                <Route path="/" element={<StoreLayout />}>
                    <Route index element={<Home />} />
                    {/* alias route for "Shop" so users can always return */}
                    <Route path="shop" element={<Home />} />
                    <Route path="product/:id" element={<ProductDetail />} />
                    <Route path="cart" element={<Cart />} />
                    <Route path="wishlist" element={<Wishlist />} />
                    <Route path="checkout" element={<Checkout />} />
                    <Route path="account" element={<Account />} />
                    <Route path="my-orders" element={<MyOrders />} />
                </Route>

                {/* ================= ADMIN LOGIN ================= */}
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* ================= ADMIN ROUTES ================= */}

                <Route
                    path="/admin"
                    element={
                        <AdminProtectedRoute>
                            <AdminLayout cartItems={[]} wishlist={[]} />
                        </AdminProtectedRoute>
                    }
                >
                    <Route index element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="orders/:id" element={<OrderDetails />} />
                    <Route path="customers" element={<AdminCustomers />} />
                    <Route path="analytics" element={<AdminAnalytics />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="settings/appearance" element={<AppearanceSettings />} />
                    <Route path="settings/general" element={<GeneralSettings />} />
                    <Route path="settings/account" element={<AccountSettings />} />
                    <Route path="settings/content" element={<ContentSettings />} />
                    <Route path="settings/social" element={<SocialSettings />} />
                    <Route path="settings/services" element={<ServicesSettings />} />
                    <Route path="settings/notifications" element={<NotificationSettings />} />
                    <Route path="profile" element={<AdminProfile />} />
                </Route>

            </Routes>
        </BrowserRouter>
    )
}

export default App