import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Palette, RefreshCcw } from "lucide-react";
import API from "../../api/api";
import { Settings, DEFAULTS } from "../../hooks/useSettings";

const COLOR_TYPES = [
    { key: 'primary', label: 'Primary Brand', default: '#427f10' },
    { key: 'accent', label: 'Accent / Links', default: '#6366f1' },
    { key: 'bg', label: 'Page Background', default: '#020617' },
    { key: 'surface', label: 'Surface (White)', default: '#0f172a' },
    { key: 'text', label: 'Primary Text', default: '#ffffff' },
    { key: 'text_secondary', label: 'Secondary Text', default: '#94a3b8' },
    { key: 'input_bg', label: 'Input Background', default: '#232939' },
    { key: 'input_border', label: 'Input Border', default: '#4a6387' },
    { key: 'input_text', label: 'Input Text', default: '#ffffff' },
    { key: 'button_primary', label: 'Primary Button', default: '#0f3334' },
    { key: 'button_secondary', label: 'Secondary Button', default: '#0f223e' },
    { key: 'card_bg', label: 'Card Background', default: '#11414b' },
    { key: 'card_border', label: 'Card Border', default: '#1c2e4a' },
    { key: 'header', label: 'Header & Footer', default: '#020617' },
    { key: 'outer_bg', label: 'Outer App Edge', default: '#020617' },
    { key: 'success', label: 'Success Green', default: '#22c55e' },
    { key: 'error', label: 'Error Critical', default: '#ef4444' }
];

const AppearanceSettings = () => {
    const navigate = useNavigate();
    const [s, setS] = useState<Settings>(DEFAULTS);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'home' | 'admin'>('home');

    useEffect(() => {
        (async () => {
            try {
                const res = await API.get("/settings");
                const merged: any = { ...DEFAULTS, ...(res.data || {}) };
                setS(merged);
            } catch {
                setS(DEFAULTS);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleChange = (key: string, value: string) => {
        setS((prev) => ({ ...prev, [key]: value }));
    };

    const handleReset = () => {
        const themeName = activeTab === 'home' ? 'Home Page' : 'Admin Dashboard';
        if (!window.confirm(`Reset ${themeName} theme to factory defaults?`)) return;

        const prefix = activeTab === 'home' ? 'home_theme_' : 'admin_theme_';
        const updatedSettings = { ...s };

        COLOR_TYPES.forEach(color => {
            const key = `${prefix}${color.key}` as keyof Settings;
            updatedSettings[key] = color.default as any;
        });

        setS(updatedSettings);
    };

    const handleSave = async () => {
        try {
            await API.put("/settings", s);
            
            // Immediately apply to DOM based on live config
            const r = document.documentElement;
            // Update the CSS variables dynamically
            const targetPrefix = "home_theme_";
            COLOR_TYPES.forEach(({ key }) => {
                const settingKey = `home_theme_${key}` as keyof Settings;
                r.style.setProperty(`--home-theme-${key.replace('_', '-')}`, s[settingKey] as string);
                
                const adminKey = `admin_theme_${key}` as keyof Settings;
                r.style.setProperty(`--admin-theme-${key.replace('_', '-')}`, s[adminKey] as string);
            });

            // Update localStorage
            Object.entries(s).forEach(([key, value]) => {
                if (key === "social_links") {
                    localStorage.setItem(key, JSON.stringify(value));
                } else {
                    localStorage.setItem(key, String(value));
                }
            });

            window.dispatchEvent(new Event('settingsUpdated'));

            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err: any) {
            alert("Error saving appearance: " + (err?.response?.data?.message || err.message));
        }
    };

    if (loading) return <div style={{ color: "var(--current-text)" }}>Loading settings...</div>;

    const prefix = activeTab === 'home' ? 'home_theme_' : 'admin_theme_';

    return (
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "20px" }}>
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <button
                    onClick={() => navigate("/admin/settings")}
                    className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl hover:bg-[var(--current-surface)] transition shadow-sm"
                    style={{
                        color: "var(--current-text-secondary)",
                        border: `1px solid var(--current-card-border)`
                    }}
                >
                    <ArrowLeft size={16} />
                    Back to Settings
                </button>
                <div className="flex justify-between items-center mt-6">
                    <div>
                        <h1 style={{ fontSize: 28, margin: "0 0 8px 0", fontWeight: 600, color: "var(--current-text)" }}>
                            Appearance & Colors
                        </h1>
                        <p style={{ color: "var(--current-text-secondary)", fontSize: 14, margin: 0 }}>
                            Customize the color palette individually for the customer storefront and the admin dashboard.
                        </p>
                    </div>
                    <button onClick={handleSave} className="btn-primary gap-2">
                        <Save size={18} /> Save Colors
                    </button>
                </div>
            </div>

            {saved && (
                <div className="mb-6 p-4 rounded-xl flex items-center gap-2 font-medium" style={{
                    background: "rgba(34,197,94,0.1)",
                    border: "1px solid rgba(34,197,94,0.3)",
                    color: "#22c55e"
                }}>
                    ✅ Appearance settings updated successfully.
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-[var(--current-card-border)] pb-2">
                <button 
                    onClick={() => setActiveTab('home')}
                    className={`px-4 py-2 font-semibold text-sm transition-colors ${activeTab === 'home' ? 'text-[var(--current-accent)] border-b-2 border-[var(--current-accent)]' : 'text-[var(--current-text-secondary)]'}`}
                >
                    Home Page Theme
                </button>
                <button 
                    onClick={() => setActiveTab('admin')}
                    className={`px-4 py-2 font-semibold text-sm transition-colors ${activeTab === 'admin' ? 'text-[var(--current-accent)] border-b-2 border-[var(--current-accent)]' : 'text-[var(--current-text-secondary)]'}`}
                >
                    Admin Dashboard Theme
                </button>
            </div>

            {/* Custom Color Editor */}
            <div className="card p-6" style={{ background: "var(--current-card-bg)", border: `1px solid var(--current-card-border)` }}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Palette size={20} color="var(--current-accent)" />
                        <h3 className="m-0 text-lg font-semibold" style={{ color: "var(--current-text)" }}>Color Editor</h3>
                    </div>
                    <button 
                        onClick={handleReset}
                        className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg border hover:bg-orange-50 hover:text-orange-600 transition-colors"
                        style={{ color: "var(--current-text-secondary)", borderColor: "var(--current-card-border)" }}
                    >
                        <RefreshCcw size={14} /> Reset {activeTab === 'home' ? 'Home' : 'Admin'} Defaults
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {COLOR_TYPES.map(colorInfo => {
                        const settingKey = `${prefix}${colorInfo.key}` as keyof Settings;
                        const value = s[settingKey] as string || colorInfo.default;
                        return (
                            <div key={settingKey} className="space-y-2">
                                <label className="block text-xs font-semibold" style={{ color: "var(--current-text-secondary)" }}>
                                    {colorInfo.label}
                                </label>
                                <div className="flex items-center gap-3 p-1 rounded-xl" style={{ border: "1px solid var(--current-input-border)", background: "var(--current-input-bg)" }}>
                                    <input 
                                        type="color" 
                                        value={value}
                                        onChange={(e) => handleChange(settingKey, e.target.value)}
                                        className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                                    />
                                    <input 
                                        type="text" 
                                        value={value}
                                        onChange={(e) => handleChange(settingKey, e.target.value)}
                                        className="bg-transparent border-0 outline-none text-sm font-mono flex-1 uppercase"
                                        style={{ color: "var(--current-input-text)" }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
    );
};

export default AppearanceSettings;
