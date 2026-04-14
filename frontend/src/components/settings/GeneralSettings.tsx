import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import API from "../../api/api";
import { Settings, DEFAULTS } from "../../hooks/useSettings";

const GeneralSettings = () => {
    const navigate = useNavigate();
    const [s, setS] = useState<Settings>(DEFAULTS);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);

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

    const onChange = (key: keyof Settings, value: string) => {
        setS(prev => ({ ...prev, [key]: value }));
    };

    const save = async () => {
        try {
            await API.put("/settings", s);
            Object.entries(s).forEach(([key, value]) => {
                if (key === "social_links") {
                    localStorage.setItem(key, JSON.stringify(value));
                } else {
                    localStorage.setItem(key, String(value));
                }
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 1800);
        } catch (err: any) {
            alert("Error saving settings: " + (err?.response?.data?.message || err.message));
        }
    };

    if (loading) return <div style={{ color: "var(--current-text)" }}>Loading settings...</div>;

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
                            General Settings
                        </h1>
                        <p style={{ color: "var(--current-text-secondary)", fontSize: 14, margin: 0 }}>
                            Configure your store's basic information and preferences
                        </p>
                    </div>
                    <button onClick={save} className="btn-primary gap-2">
                        <Save size={18} /> Save Settings
                    </button>
                </div>
            </div>

            {saved && (
                <div className="mb-6 p-4 rounded-xl flex items-center gap-2 font-medium" style={{
                    background: "rgba(34,197,94,0.1)",
                    border: "1px solid rgba(34,197,94,0.3)",
                    color: "#22c55e"
                }}>
                    ✅ Settings saved successfully.
                </div>
            )}

            {/* Settings Form */}
            <div className="grid gap-6">
                <div className="card p-6" style={{ background: "var(--current-card-bg)", border: `1px solid var(--current-card-border)` }}>
                    <h3 className="m-0 text-lg font-semibold mb-6 pb-3 border-b border-[var(--current-card-border)]" style={{ color: "var(--current-text)" }}>Store Information</h3>
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold" style={{ color: "var(--current-text-secondary)" }}>Store Name</label>
                            <input
                                className="w-full px-4 py-3 rounded-xl border outline-none text-sm transition-colors"
                                style={{ background: "var(--current-input-bg)", borderColor: "var(--current-input-border)", color: "var(--current-input-text)" }}
                                value={s.store_name}
                                onChange={(e) => onChange("store_name", e.target.value)}
                                placeholder="Your Store Name"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold" style={{ color: "var(--current-text-secondary)" }}>Currency</label>
                            <select
                                className="w-full px-4 py-3 rounded-xl border outline-none text-sm cursor-pointer transition-colors"
                                style={{ background: "var(--current-input-bg)", borderColor: "var(--current-input-border)", color: "var(--current-input-text)" }}
                                value={s.currency}
                                onChange={(e) => onChange("currency", e.target.value)}
                            >
                                <option value="PKR">Pakistani Rupee (PKR)</option>
                                <option value="USD">US Dollar (USD)</option>
                                <option value="EUR">Euro (EUR)</option>
                                <option value="GBP">British Pound (GBP)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="card p-6" style={{ background: "var(--current-card-bg)", border: `1px solid var(--current-card-border)` }}>
                    <h3 className="m-0 text-lg font-semibold mb-6 pb-3 border-b border-[var(--current-card-border)]" style={{ color: "var(--current-text)" }}>Hero Section</h3>
                    <div className="grid gap-6">
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold" style={{ color: "var(--current-text-secondary)" }}>Hero Title</label>
                            <input
                                className="w-full px-4 py-3 rounded-xl border outline-none text-sm transition-colors"
                                style={{ background: "var(--current-input-bg)", borderColor: "var(--current-input-border)", color: "var(--current-input-text)" }}
                                value={s.hero_title}
                                onChange={(e) => onChange("hero_title", e.target.value)}
                                placeholder="Welcome to our store"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold" style={{ color: "var(--current-text-secondary)" }}>Hero Subtitle</label>
                            <textarea
                                className="w-full px-4 py-3 rounded-xl border outline-none text-sm transition-colors"
                                style={{ background: "var(--current-input-bg)", borderColor: "var(--current-input-border)", color: "var(--current-input-text)", minHeight: 100 }}
                                value={s.hero_subtitle}
                                onChange={(e) => onChange("hero_subtitle", e.target.value)}
                                placeholder="Describe your store in a few words"
                                rows={3}
                            />
                        </div>
                    </div>
                </div>

                <div className="card p-6" style={{ background: "var(--current-card-bg)", border: `1px solid var(--current-card-border)` }}>
                    <h3 className="m-0 text-lg font-semibold mb-6 pb-3 border-b border-[var(--current-card-border)]" style={{ color: "var(--current-text)" }}>Contact Information</h3>
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold" style={{ color: "var(--current-text-secondary)" }}>Contact Email</label>
                            <input
                                className="w-full px-4 py-3 rounded-xl border outline-none text-sm transition-colors"
                                style={{ background: "var(--current-input-bg)", borderColor: "var(--current-input-border)", color: "var(--current-input-text)" }}
                                type="email"
                                value={s.contact_email}
                                onChange={(e) => onChange("contact_email", e.target.value)}
                                placeholder="support@yourstore.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold" style={{ color: "var(--current-text-secondary)" }}>Contact Phone</label>
                            <input
                                className="w-full px-4 py-3 rounded-xl border outline-none text-sm transition-colors"
                                style={{ background: "var(--current-input-bg)", borderColor: "var(--current-input-border)", color: "var(--current-input-text)" }}
                                value={s.contact_phone}
                                onChange={(e) => onChange("contact_phone", e.target.value)}
                                placeholder="+92-300-1234567"
                            />
                        </div>
                    </div>
                </div>

                <div className="card p-6" style={{ background: "var(--current-card-bg)", border: `1px solid var(--current-card-border)` }}>
                    <h3 className="m-0 text-lg font-semibold mb-6 pb-3 border-b border-[var(--current-card-border)]" style={{ color: "var(--current-text)" }}>Display Text</h3>
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold" style={{ color: "var(--current-text-secondary)" }}>Support Text</label>
                            <input
                                className="w-full px-4 py-3 rounded-xl border outline-none text-sm transition-colors"
                                style={{ background: "var(--current-input-bg)", borderColor: "var(--current-input-border)", color: "var(--current-input-text)" }}
                                value={s.support_text}
                                onChange={(e) => onChange("support_text", e.target.value)}
                                placeholder="Support 24/7"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold" style={{ color: "var(--current-text-secondary)" }}>Announcement Bar Text</label>
                            <input
                                className="w-full px-4 py-3 rounded-xl border outline-none text-sm transition-colors"
                                style={{ background: "var(--current-input-bg)", borderColor: "var(--current-input-border)", color: "var(--current-input-text)" }}
                                value={s.announcement_text}
                                onChange={(e) => onChange("announcement_text", e.target.value)}
                                placeholder="Free delivery • Easy returns"
                            />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <label className="block text-xs font-semibold" style={{ color: "var(--current-text-secondary)" }}>Footer Tagline</label>
                            <input
                                className="w-full px-4 py-3 rounded-xl border outline-none text-sm transition-colors"
                                style={{ background: "var(--current-input-bg)", borderColor: "var(--current-input-border)", color: "var(--current-input-text)" }}
                                value={s.footer_tagline}
                                onChange={(e) => onChange("footer_tagline", e.target.value)}
                                placeholder="Premium essentials and modern fashion"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GeneralSettings;