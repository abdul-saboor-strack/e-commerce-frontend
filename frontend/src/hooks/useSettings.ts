import { useEffect, useState } from "react";
import API from "../api/api";

export type SocialLink = {
    platform: string;
    url: string;
};

export type Settings = {
    store_name: string;
    currency: string;
    hero_title: string;
    hero_subtitle: string;
    support_text: string;
    announcement_text: string;
    footer_tagline: string;
    delivery_text: string;
    returns_text: string;
    payments_text: string;
    // Home page theme
    home_theme_primary: string;
    home_theme_accent: string;
    home_theme_bg: string;
    home_theme_surface: string;
    home_theme_text: string;
    home_theme_text_secondary: string;
    home_theme_input_bg: string;
    home_theme_input_border: string;
    home_theme_input_text: string;
    home_theme_button_primary: string;
    home_theme_button_secondary: string;
    home_theme_card_bg: string;
    home_theme_card_border: string;
    home_theme_header: string;
    home_theme_outer_bg: string;
    home_theme_success: string;
    home_theme_error: string;
    // Admin page theme
    admin_theme_primary: string;
    admin_theme_accent: string;
    admin_theme_bg: string;
    admin_theme_surface: string;
    admin_theme_text: string;
    admin_theme_text_secondary: string;
    admin_theme_input_bg: string;
    admin_theme_input_border: string;
    admin_theme_input_text: string;
    admin_theme_button_primary: string;
    admin_theme_button_secondary: string;
    admin_theme_card_bg: string;
    admin_theme_card_border: string;
    admin_theme_header: string;
    admin_theme_outer_bg: string;
    admin_theme_success: string;
    admin_theme_error: string;
    // Legacy (for backwards compatibility)
    theme_primary: string;
    theme_accent: string;
    theme_bg: string;
    theme_surface: string;
    theme_text: string;
    contact_email: string;
    contact_phone: string;
    social_links: SocialLink[];
    feedback_email_subject: string;
    seo_title: string;
    seo_description: string;
    about_text: string;
    shipping_policy: string;
    privacy_policy: string;
    terms_conditions: string;
    // Notification Settings
    notification_order_subject: string;
    notification_order_body: string;
    notification_welcome_subject: string;
    notification_welcome_body: string;
    notification_admin_email: string;
};

const DEFAULTS: Settings = {
    store_name: "FS 5 Collection",
    currency: "PKR",
    hero_title: "FS 5 Collection",
    hero_subtitle: "Clean premium storefront designed to feel polished on mobile, tablet, and desktop.",
    support_text: "Support 24/7",
    announcement_text: "Free delivery in selected areas • Easy returns • Secure checkout",
    footer_tagline: "Premium essentials and modern fashion drops.",
    delivery_text: "Dispatch in 24-48 hours where available.",
    returns_text: "Simple return support within policy window.",
    payments_text: "Protected checkout experience with trusted methods.",
    // Home page theme (Dark theme)
    home_theme_primary: "#427f10",
    home_theme_accent: "#6366f1",
    home_theme_bg: "#020617",
    home_theme_surface: "#0f172a",
    home_theme_text: "#ffffff",
    home_theme_text_secondary: "#94a3b8",
    home_theme_input_bg: "#232939",
    home_theme_input_border: "#4a6387",
    home_theme_input_text: "#ffffff",
    home_theme_button_primary: "#0f3334",
    home_theme_button_secondary: "#0f223e",
    home_theme_card_bg: "#11414b",
    home_theme_card_border: "#1c2e4a",
    home_theme_header: "#020617",
    home_theme_outer_bg: "#020617",
    home_theme_success: "#22c55e",
    home_theme_error: "#ef4444",
    // Admin page theme (Dark theme like home)
    admin_theme_primary: "#427f10",
    admin_theme_accent: "#6366f1",
    admin_theme_bg: "#020617",
    admin_theme_surface: "#0f172a",
    admin_theme_text: "#ffffff",
    admin_theme_text_secondary: "#94a3b8",
    admin_theme_input_bg: "#232939",
    admin_theme_input_border: "#4a6387",
    admin_theme_input_text: "#ffffff",
    admin_theme_button_primary: "#0f3334",
    admin_theme_button_secondary: "#0f223e",
    admin_theme_card_bg: "#11414b",
    admin_theme_card_border: "#1c2e4a",
    admin_theme_header: "#020617",
    admin_theme_outer_bg: "#020617",
    admin_theme_success: "#22c55e",
    admin_theme_error: "#ef4444",
    // Legacy (for backwards compatibility)
    theme_primary: "#111827",
    theme_accent: "#6366f1",
    theme_bg: "#020617",
    theme_surface: "#0f172a",
    theme_text: "#ffffff",
    contact_email: "support@fs5collection.com",
    contact_phone: "+92-300-1234567",
    social_links: [
        { platform: "Facebook", url: "https://facebook.com/fs5collection" },
        { platform: "Instagram", url: "https://instagram.com/fs5collection" },
    ],
    feedback_email_subject: "New Feedback from Customer",
    seo_title: "FS 5 Collection - Premium Fashion & Essentials",
    seo_description: "Discover premium fashion and modern essentials at FS 5 Collection. Quality products with fast delivery.",
    about_text: "FS 5 Collection offers premium fashion and lifestyle products with a focus on quality and style.",
    shipping_policy: "We offer free shipping on orders over Rs. 5000. Standard delivery takes 3-5 business days.",
    privacy_policy: "We respect your privacy and are committed to protecting your personal data.",
    terms_conditions: "By using our service, you agree to our terms and conditions.",
    // Notification Settings Default
    notification_order_subject: "Order Confirmation - {order_id}",
    notification_order_body: "Thank you for your order! We are processing it now.",
    notification_welcome_subject: "Welcome to FS 5 Collection",
    notification_welcome_body: "We're glad to have you with us!",
    notification_admin_email: "admin@fs5collection.com",
};

export { DEFAULTS };

const hexToRgbString = (hex: string) => {
    if (!hex) return "";
    let normalized = hex.trim().replace(/^#/, "");
    if (normalized.length === 3) {
        normalized = normalized.split("").map((c) => c + c).join("");
    }
    const match = normalized.match(/^([a-fA-F0-9]{6})$/);
    if (!match) return "";
    const intVal = parseInt(match[1], 16);
    const r = (intVal >> 16) & 255;
    const g = (intVal >> 8) & 255;
    const b = intVal & 255;
    return `${r}, ${g}, ${b}`;
};

const setThemeVariable = (root: HTMLElement, property: string, value: string) => {
    root.style.setProperty(property, value);
    if (!value) return;
    if (property.endsWith("-success") || property.endsWith("-error")) {
        const rgb = hexToRgbString(value);
        if (rgb) {
            root.style.setProperty(`${property}-rgb`, rgb);
        }
    }
};

/**
 * Custom hook to get settings from localStorage/API
 * Primary source: localStorage (synced from API)
 * Falls back to DEFAULTS if not found
 * Automatically applies CSS variables when settings change
 */
export const useSettings = (): Settings => {
    const [settings, setSettings] = useState<Settings>(DEFAULTS);

    // Apply CSS variables to document root
    const applyCSSVariables = (s: Settings) => {
        const root = document.documentElement;
        // Home theme variables
        if (s.home_theme_primary) root.style.setProperty("--home-theme-primary", s.home_theme_primary);
        if (s.home_theme_accent) root.style.setProperty("--home-theme-accent", s.home_theme_accent);
        if (s.home_theme_bg) root.style.setProperty("--home-theme-bg", s.home_theme_bg);
        if (s.home_theme_surface) root.style.setProperty("--home-theme-surface", s.home_theme_surface);
        if (s.home_theme_text) root.style.setProperty("--home-theme-text", s.home_theme_text);
        if (s.home_theme_text_secondary) root.style.setProperty("--home-theme-text-secondary", s.home_theme_text_secondary);
        if (s.home_theme_input_bg) root.style.setProperty("--home-theme-input-bg", s.home_theme_input_bg);
        if (s.home_theme_input_border) root.style.setProperty("--home-theme-input-border", s.home_theme_input_border);
        if (s.home_theme_input_text) root.style.setProperty("--home-theme-input-text", s.home_theme_input_text);
        if (s.home_theme_button_primary) root.style.setProperty("--home-theme-button-primary", s.home_theme_button_primary);
        if (s.home_theme_button_secondary) root.style.setProperty("--home-theme-button-secondary", s.home_theme_button_secondary);
        if (s.home_theme_card_bg) root.style.setProperty("--home-theme-card-bg", s.home_theme_card_bg);
        if (s.home_theme_card_border) root.style.setProperty("--home-theme-card-border", s.home_theme_card_border);
        if (s.home_theme_header) root.style.setProperty("--home-theme-header", s.home_theme_header);
        if (s.home_theme_outer_bg) root.style.setProperty("--home-theme-outer-bg", s.home_theme_outer_bg);
        if (s.home_theme_success) setThemeVariable(root, "--home-theme-success", s.home_theme_success);
        if (s.home_theme_error) setThemeVariable(root, "--home-theme-error", s.home_theme_error);

        // Admin theme variables
        if (s.admin_theme_primary) root.style.setProperty("--admin-theme-primary", s.admin_theme_primary);
        if (s.admin_theme_accent) root.style.setProperty("--admin-theme-accent", s.admin_theme_accent);
        if (s.admin_theme_bg) root.style.setProperty("--admin-theme-bg", s.admin_theme_bg);
        if (s.admin_theme_surface) root.style.setProperty("--admin-theme-surface", s.admin_theme_surface);
        if (s.admin_theme_text) root.style.setProperty("--admin-theme-text", s.admin_theme_text);
        if (s.admin_theme_text_secondary) root.style.setProperty("--admin-theme-text-secondary", s.admin_theme_text_secondary);
        if (s.admin_theme_input_bg) root.style.setProperty("--admin-theme-input-bg", s.admin_theme_input_bg);
        if (s.admin_theme_input_border) root.style.setProperty("--admin-theme-input-border", s.admin_theme_input_border);
        if (s.admin_theme_input_text) root.style.setProperty("--admin-theme-input-text", s.admin_theme_input_text);
        if (s.admin_theme_button_primary) root.style.setProperty("--admin-theme-button-primary", s.admin_theme_button_primary);
        if (s.admin_theme_button_secondary) root.style.setProperty("--admin-theme-button-secondary", s.admin_theme_button_secondary);
        if (s.admin_theme_card_bg) root.style.setProperty("--admin-theme-card-bg", s.admin_theme_card_bg);
        if (s.admin_theme_card_border) root.style.setProperty("--admin-theme-card-border", s.admin_theme_card_border);
        if (s.admin_theme_header) root.style.setProperty("--admin-theme-header", s.admin_theme_header);
        if (s.admin_theme_outer_bg) root.style.setProperty("--admin-theme-outer-bg", s.admin_theme_outer_bg);
        if (s.admin_theme_success) setThemeVariable(root, "--admin-theme-success", s.admin_theme_success);
        if (s.admin_theme_error) setThemeVariable(root, "--admin-theme-error", s.admin_theme_error);

        // Legacy variables (for backwards compatibility)
        if (s.theme_primary) root.style.setProperty("--theme-primary", s.theme_primary);
        if (s.theme_accent) root.style.setProperty("--theme-accent", s.theme_accent);
        if (s.theme_bg) root.style.setProperty("--theme-bg", s.theme_bg);
        if (s.theme_surface) root.style.setProperty("--theme-surface", s.theme_surface);
        if (s.theme_text) root.style.setProperty("--theme-text", s.theme_text);
    };

    useEffect(() => {
        // Load from localStorage first (faster)
        const loadSettings = () => {
            const merged: any = { ...DEFAULTS };
            Object.keys(DEFAULTS).forEach((key) => {
                const value = localStorage.getItem(key);
                if (value !== null) {
                    if (key === "social_links") {
                        try {
                            merged[key] = JSON.parse(value);
                        } catch {
                            merged[key] = DEFAULTS.social_links;
                        }
                    } else {
                        merged[key as keyof Settings] = value as any;
                    }
                }
            });
            // Force a new object reference to ensure re-renders
            setSettings({ ...merged });
        };

        loadSettings();

        // Listen for storage changes (from other tabs/settings saves)
        const handleStorageChange = () => {
            loadSettings();
        };

        // Listen for custom settingsUpdated event
        const handleSettingsUpdated = () => {
            loadSettings();
        };

        window.addEventListener("storage", handleStorageChange);
        window.addEventListener("settingsUpdated", handleSettingsUpdated);
        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("settingsUpdated", handleSettingsUpdated);
        };
    }, []);

    return settings;
};

/**
 * Load and cache settings from API, store in localStorage
 */
export const fetchAndCacheSettings = async () => {
    try {
        const res = await API.get("/settings");
        const settings = res.data || {};
        // Store each setting in localStorage
        Object.entries(settings).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (key === "social_links") {
                    localStorage.setItem(key, JSON.stringify(value));
                } else {
                    localStorage.setItem(key, String(value));
                }
            }
        });

        // Notify the app to reload theme variables from localStorage
        if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("settingsUpdated"));
        }

        return settings;
    } catch (err) {
        console.error("Failed to fetch settings:", err);
        // Even on error, apply defaults from localStorage or DEFAULTS
        const merged: any = { ...DEFAULTS };
        Object.keys(DEFAULTS).forEach((key) => {
            const value = localStorage.getItem(key);
            if (value !== null) {
                merged[key] = value;
            }
        });
        // Removed applyThemeVariables call - SettingsManager handles this now
        return null;
    }
};

/**
 * Helper function to apply theme CSS variables
 */
const applyThemeVariables = (settings: any) => {
    const root = document.documentElement;
    if (!settings) return;

    // Home theme variables
    if (settings.home_theme_primary) root.style.setProperty("--home-theme-primary", settings.home_theme_primary);
    if (settings.home_theme_accent) root.style.setProperty("--home-theme-accent", settings.home_theme_accent);
    if (settings.home_theme_bg) root.style.setProperty("--home-theme-bg", settings.home_theme_bg);
    if (settings.home_theme_surface) root.style.setProperty("--home-theme-surface", settings.home_theme_surface);
    if (settings.home_theme_text) root.style.setProperty("--home-theme-text", settings.home_theme_text);
    if (settings.home_theme_text_secondary) root.style.setProperty("--home-theme-text-secondary", settings.home_theme_text_secondary);
    if (settings.home_theme_input_bg) root.style.setProperty("--home-theme-input-bg", settings.home_theme_input_bg);
    if (settings.home_theme_input_border) root.style.setProperty("--home-theme-input-border", settings.home_theme_input_border);
    if (settings.home_theme_input_text) root.style.setProperty("--home-theme-input-text", settings.home_theme_input_text);
    if (settings.home_theme_button_primary) root.style.setProperty("--home-theme-button-primary", settings.home_theme_button_primary);
    if (settings.home_theme_button_secondary) root.style.setProperty("--home-theme-button-secondary", settings.home_theme_button_secondary);
    if (settings.home_theme_card_bg) root.style.setProperty("--home-theme-card-bg", settings.home_theme_card_bg);
    if (settings.home_theme_card_border) root.style.setProperty("--home-theme-card-border", settings.home_theme_card_border);

    // Admin theme variables
    if (settings.admin_theme_primary) root.style.setProperty("--admin-theme-primary", settings.admin_theme_primary);
    if (settings.admin_theme_accent) root.style.setProperty("--admin-theme-accent", settings.admin_theme_accent);
    if (settings.admin_theme_bg) root.style.setProperty("--admin-theme-bg", settings.admin_theme_bg);
    if (settings.admin_theme_surface) root.style.setProperty("--admin-theme-surface", settings.admin_theme_surface);
    if (settings.admin_theme_text) root.style.setProperty("--admin-theme-text", settings.admin_theme_text);
    if (settings.admin_theme_text_secondary) root.style.setProperty("--admin-theme-text-secondary", settings.admin_theme_text_secondary);
    if (settings.admin_theme_input_bg) root.style.setProperty("--admin-theme-input-bg", settings.admin_theme_input_bg);
    if (settings.admin_theme_input_border) root.style.setProperty("--admin-theme-input-border", settings.admin_theme_input_border);
    if (settings.admin_theme_input_text) root.style.setProperty("--admin-theme-input-text", settings.admin_theme_input_text);
    if (settings.admin_theme_button_primary) root.style.setProperty("--admin-theme-button-primary", settings.admin_theme_button_primary);
    if (settings.admin_theme_button_secondary) root.style.setProperty("--admin-theme-button-secondary", settings.admin_theme_button_secondary);
    if (settings.admin_theme_card_bg) root.style.setProperty("--admin-theme-card-bg", settings.admin_theme_card_bg);
    if (settings.admin_theme_card_border) root.style.setProperty("--admin-theme-card-border", settings.admin_theme_card_border);

    // Legacy variables (for backwards compatibility)
    if (settings.theme_primary) root.style.setProperty("--theme-primary", settings.theme_primary);
    if (settings.theme_accent) root.style.setProperty("--theme-accent", settings.theme_accent);
    if (settings.theme_bg) root.style.setProperty("--theme-bg", settings.theme_bg);
    if (settings.theme_surface) root.style.setProperty("--theme-surface", settings.theme_surface);
    if (settings.theme_text) root.style.setProperty("--theme-text", settings.theme_text);
};
