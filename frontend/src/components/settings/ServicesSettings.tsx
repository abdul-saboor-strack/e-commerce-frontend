import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import API from "../../api/api";
import { Settings, DEFAULTS } from "../../hooks/useSettings";

const ServicesSettings = () => {
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
                            Services & Policies
                        </h1>
                        <p style={{ color: "var(--current-text-secondary)", fontSize: 14, margin: 0 }}>
                            Manage shipping rules, return policies, and legal agreements.
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
                    <h3 className="m-0 text-lg font-semibold mb-6 pb-3 border-b border-[var(--current-card-border)]" style={{ color: "var(--current-text)" }}>Policy Statements</h3>
                    <div className="grid gap-6">
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold" style={{ color: "var(--current-text-secondary)" }}>Shipping Policy</label>
                            <textarea
                                className="w-full px-4 py-3 rounded-xl border outline-none text-sm transition-colors"
                                style={{ background: "var(--current-input-bg)", borderColor: "var(--current-input-border)", color: "var(--current-input-text)", minHeight: 120 }}
                                value={s.shipping_policy}
                                onChange={(e) => onChange("shipping_policy", e.target.value)}
                                placeholder="Describe shipping rules, pricing, and timelines."
                                rows={4}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold" style={{ color: "var(--current-text-secondary)" }}>Privacy Policy</label>
                            <textarea
                                className="w-full px-4 py-3 rounded-xl border outline-none text-sm transition-colors"
                                style={{ background: "var(--current-input-bg)", borderColor: "var(--current-input-border)", color: "var(--current-input-text)", minHeight: 120 }}
                                value={s.privacy_policy}
                                onChange={(e) => onChange("privacy_policy", e.target.value)}
                                placeholder="Detail how user data is handled."
                                rows={4}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold" style={{ color: "var(--current-text-secondary)" }}>Terms & Conditions</label>
                            <textarea
                                className="w-full px-4 py-3 rounded-xl border outline-none text-sm transition-colors"
                                style={{ background: "var(--current-input-bg)", borderColor: "var(--current-input-border)", color: "var(--current-input-text)", minHeight: 120 }}
                                value={s.terms_conditions}
                                onChange={(e) => onChange("terms_conditions", e.target.value)}
                                placeholder="Standard store terms and conditions."
                                rows={4}
                            />
                        </div>
                    </div>
                </div>

                <div className="card p-6" style={{ background: "var(--current-card-bg)", border: `1px solid var(--current-card-border)` }}>
                    <h3 className="m-0 text-lg font-semibold mb-6 pb-3 border-b border-[var(--current-card-border)]" style={{ color: "var(--current-text)" }}>Feature Snippets</h3>
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold" style={{ color: "var(--current-text-secondary)" }}>Delivery Bullet Point</label>
                            <input
                                className="w-full px-4 py-3 rounded-xl border outline-none text-sm transition-colors"
                                style={{ background: "var(--current-input-bg)", borderColor: "var(--current-input-border)", color: "var(--current-input-text)" }}
                                value={s.delivery_text}
                                onChange={(e) => onChange("delivery_text", e.target.value)}
                                placeholder="Dispatch in 24-48 hours where available."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold" style={{ color: "var(--current-text-secondary)" }}>Returns Bullet Point</label>
                            <input
                                className="w-full px-4 py-3 rounded-xl border outline-none text-sm transition-colors"
                                style={{ background: "var(--current-input-bg)", borderColor: "var(--current-input-border)", color: "var(--current-input-text)" }}
                                value={s.returns_text}
                                onChange={(e) => onChange("returns_text", e.target.value)}
                                placeholder="Simple return support within policy window."
                            />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <label className="block text-xs font-semibold" style={{ color: "var(--current-text-secondary)" }}>Payments Bullet Point</label>
                            <input
                                className="w-full px-4 py-3 rounded-xl border outline-none text-sm transition-colors"
                                style={{ background: "var(--current-input-bg)", borderColor: "var(--current-input-border)", color: "var(--current-input-text)" }}
                                value={s.payments_text}
                                onChange={(e) => onChange("payments_text", e.target.value)}
                                placeholder="Protected checkout experience."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServicesSettings;