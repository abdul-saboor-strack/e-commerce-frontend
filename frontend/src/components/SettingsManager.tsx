import { useEffect } from "react";
import { useSettings, DEFAULTS } from "../hooks/useSettings";

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
 * Global Settings Manager
 * Ensures CSS variables are always in sync with settings
 * Renders nothing but manages theme application
 */
const SettingsManager = () => {
    const settings = useSettings();

    const applyCurrentTheme = () => {
        const root = document.documentElement;
        const homeSection = root.querySelector('[data-section="home"]');
        const adminSection = root.querySelector('[data-section="admin"]');

        // Apply home theme to home section
        if (homeSection) {
            (homeSection as HTMLElement).setAttribute('data-theme', 'home');
        }

        // Apply admin theme to admin section  
        if (adminSection) {
            (adminSection as HTMLElement).setAttribute('data-theme', 'admin');
        }

        // Set body theme based on current section
        const body = document.body;
        if (adminSection) {
            body.setAttribute('data-theme', 'admin');
        } else if (homeSection) {
            body.setAttribute('data-theme', 'home');
        } else {
            body.setAttribute('data-theme', 'home');
        }
    };

    useEffect(() => {
        // Apply CSS variables whenever settings change
        const root = document.documentElement;

        // Apply home theme variables to root (so CSS rules can access them)
        root.style.setProperty("--home-theme-primary", settings?.home_theme_primary || DEFAULTS.home_theme_primary);
        root.style.setProperty("--home-theme-accent", settings?.home_theme_accent || DEFAULTS.home_theme_accent);
        root.style.setProperty("--home-theme-bg", settings?.home_theme_bg || DEFAULTS.home_theme_bg);
        root.style.setProperty("--home-theme-surface", settings?.home_theme_surface || DEFAULTS.home_theme_surface);
        root.style.setProperty("--home-theme-text", settings?.home_theme_text || DEFAULTS.home_theme_text);
        root.style.setProperty("--home-theme-text-secondary", settings?.home_theme_text_secondary || DEFAULTS.home_theme_text_secondary);
        root.style.setProperty("--home-theme-input-bg", settings?.home_theme_input_bg || DEFAULTS.home_theme_input_bg);
        root.style.setProperty("--home-theme-input-border", settings?.home_theme_input_border || DEFAULTS.home_theme_input_border);
        root.style.setProperty("--home-theme-input-text", settings?.home_theme_input_text || DEFAULTS.home_theme_input_text);
        root.style.setProperty("--home-theme-button-primary", settings?.home_theme_button_primary || DEFAULTS.home_theme_button_primary);
        root.style.setProperty("--home-theme-button-secondary", settings?.home_theme_button_secondary || DEFAULTS.home_theme_button_secondary);
        root.style.setProperty("--home-theme-card-bg", settings?.home_theme_card_bg || DEFAULTS.home_theme_card_bg);
        root.style.setProperty("--home-theme-card-border", settings?.home_theme_card_border || DEFAULTS.home_theme_card_border);
        root.style.setProperty("--home-theme-header", settings?.home_theme_header || DEFAULTS.home_theme_header);
        root.style.setProperty("--home-theme-outer-bg", settings?.home_theme_outer_bg || DEFAULTS.home_theme_outer_bg);
        setThemeVariable(root, "--home-theme-success", settings?.home_theme_success || DEFAULTS.home_theme_success);
        setThemeVariable(root, "--home-theme-error", settings?.home_theme_error || DEFAULTS.home_theme_error);

        // Admin theme variables
        root.style.setProperty("--admin-theme-primary", settings?.admin_theme_primary || DEFAULTS.admin_theme_primary);
        root.style.setProperty("--admin-theme-accent", settings?.admin_theme_accent || DEFAULTS.admin_theme_accent);
        root.style.setProperty("--admin-theme-bg", settings?.admin_theme_bg || DEFAULTS.admin_theme_bg);
        root.style.setProperty("--admin-theme-surface", settings?.admin_theme_surface || DEFAULTS.admin_theme_surface);
        root.style.setProperty("--admin-theme-text", settings?.admin_theme_text || DEFAULTS.admin_theme_text);
        root.style.setProperty("--admin-theme-text-secondary", settings?.admin_theme_text_secondary || DEFAULTS.admin_theme_text_secondary);
        root.style.setProperty("--admin-theme-input-bg", settings?.admin_theme_input_bg || DEFAULTS.admin_theme_input_bg);
        root.style.setProperty("--admin-theme-input-border", settings?.admin_theme_input_border || DEFAULTS.admin_theme_input_border);
        root.style.setProperty("--admin-theme-input-text", settings?.admin_theme_input_text || DEFAULTS.admin_theme_input_text);
        root.style.setProperty("--admin-theme-button-primary", settings?.admin_theme_button_primary || DEFAULTS.admin_theme_button_primary);
        root.style.setProperty("--admin-theme-button-secondary", settings?.admin_theme_button_secondary || DEFAULTS.admin_theme_button_secondary);
        root.style.setProperty("--admin-theme-card-bg", settings?.admin_theme_card_bg || DEFAULTS.admin_theme_card_bg);
        root.style.setProperty("--admin-theme-card-border", settings?.admin_theme_card_border || DEFAULTS.admin_theme_card_border);
        root.style.setProperty("--admin-theme-header", settings?.admin_theme_header || DEFAULTS.admin_theme_header);
        root.style.setProperty("--admin-theme-outer-bg", settings?.admin_theme_outer_bg || DEFAULTS.admin_theme_outer_bg);
        setThemeVariable(root, "--admin-theme-success", settings?.admin_theme_success || DEFAULTS.admin_theme_success);
        setThemeVariable(root, "--admin-theme-error", settings?.admin_theme_error || DEFAULTS.admin_theme_error);

        applyCurrentTheme();
    }, [settings]);

    // Also apply theme when DOM changes (for dynamically added sections)
    useEffect(() => {
        const applyThemeOnDOMChange = () => {
            applyCurrentTheme();
        };

        // Apply immediately for sections already in DOM
        applyCurrentTheme();

        // Use a MutationObserver to watch for layout sections being added
        const observer = new MutationObserver(() => {
            applyCurrentTheme();
        });

        observer.observe(document.body, { childList: true, subtree: true });

        // Also listen for custom settings update event
        window.addEventListener("settingsUpdated", applyThemeOnDOMChange);

        return () => {
            observer.disconnect();
            window.removeEventListener("settingsUpdated", applyThemeOnDOMChange);
        };
    }, []);

    // Apply theme on initial mount
    useEffect(() => {
        applyCurrentTheme();
    }, []);

    return null; // This component renders nothing, only manages CSS variables
};

export default SettingsManager;
