import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Mail, Bell, MessageSquare } from "lucide-react";
import API from "../../api/api";
import { Settings, DEFAULTS } from "../../hooks/useSettings";

const NotificationSettings = () => {
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
            // Store common settings in localStorage
            Object.entries(s).forEach(([key, value]) => {
                if (key !== "social_links") {
                    localStorage.setItem(key, String(value));
                }
            });
            
            window.dispatchEvent(new Event('settingsUpdated'));
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err: any) {
            alert("Error saving notification settings: " + (err?.response?.data?.message || err.message));
        }
    };

    if (loading) return <div className="p-8 text-center" style={{ color: "var(--current-text)" }}>Loading notification settings...</div>;

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
                            Notifications
                        </h1>
                        <p style={{ color: "var(--current-text-secondary)", fontSize: 14, margin: 0 }}>
                            Configure email templates and store notification preferences.
                        </p>
                    </div>
                    <button onClick={save} className="btn-primary gap-2">
                        <Save size={18} /> Save Notifications
                    </button>
                </div>
            </div>

            {saved && (
                <div className="mb-6 p-4 rounded-xl flex items-center gap-2 font-medium animate-fade-in-up" style={{
                    background: "rgba(34,197,94,0.1)",
                    border: "1px solid rgba(34,197,94,0.3)",
                    color: "#22c55e"
                }}>
                    ✅ Notification settings updated successfully.
                </div>
            )}

            <div className="grid gap-8">
                {/* Admin Notifications */}
                <div className="card p-6" style={{ background: "var(--current-card-bg)", border: `1px solid var(--current-card-border)` }}>
                    <div className="flex items-center gap-3 mb-6 pb-3 border-b border-[var(--current-card-border)]">
                        <Bell size={20} color="var(--current-accent)" />
                        <h3 className="m-0 text-lg font-semibold" style={{ color: "var(--current-text)" }}>System Notifications</h3>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold" style={{ color: "var(--current-text-secondary)" }}>Admin Alert Recipient</label>
                            <input
                                className="w-full px-4 py-3 rounded-xl border outline-none text-sm transition-colors"
                                style={{ background: "var(--current-input-bg)", borderColor: "var(--current-input-border)", color: "var(--current-input-text)" }}
                                type="email"
                                value={s.notification_admin_email}
                                onChange={(e) => onChange("notification_admin_email", e.target.value)}
                                placeholder="admin@yourstore.com"
                            />
                            <p className="text-[10px]" style={{ color: "var(--current-text-secondary)" }}>This email will receive order alerts and system notifications.</p>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold" style={{ color: "var(--current-text-secondary)" }}>Feedback Email Subject</label>
                            <input
                                className="w-full px-4 py-3 rounded-xl border outline-none text-sm transition-colors"
                                style={{ background: "var(--current-input-bg)", borderColor: "var(--current-input-border)", color: "var(--current-input-text)" }}
                                value={s.feedback_email_subject}
                                onChange={(e) => onChange("feedback_email_subject", e.target.value)}
                                placeholder="New message from store"
                            />
                        </div>
                    </div>
                </div>

                {/* Order Confirmation Template */}
                <div className="card p-6" style={{ background: "var(--current-card-bg)", border: `1px solid var(--current-card-border)` }}>
                    <div className="flex items-center gap-3 mb-6 pb-3 border-b border-[var(--current-card-border)]">
                        <Mail size={20} color="var(--current-accent)" />
                        <h3 className="m-0 text-lg font-semibold" style={{ color: "var(--current-text)" }}>New Order Confirmation</h3>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold" style={{ color: "var(--current-text-secondary)" }}>Subject Line</label>
                            <input
                                className="w-full px-4 py-3 rounded-xl border outline-none text-sm transition-colors"
                                style={{ background: "var(--current-input-bg)", borderColor: "var(--current-input-border)", color: "var(--current-input-text)" }}
                                value={s.notification_order_subject}
                                onChange={(e) => onChange("notification_order_subject", e.target.value)}
                                placeholder="Order {order_id} confirmed"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold" style={{ color: "var(--current-text-secondary)" }}>Email Body Contents</label>
                            <textarea
                                className="w-full px-4 py-3 rounded-xl border outline-none text-sm transition-colors"
                                style={{ background: "var(--current-input-bg)", borderColor: "var(--current-input-border)", color: "var(--current-input-text)", minHeight: 120 }}
                                value={s.notification_order_body}
                                onChange={(e) => onChange("notification_order_body", e.target.value)}
                                placeholder="Thank you for shopping!"
                                rows={4}
                            />
                        </div>
                    </div>
                </div>

                {/* Welcome Email Template */}
                <div className="card p-6" style={{ background: "var(--current-card-bg)", border: `1px solid var(--current-card-border)` }}>
                    <div className="flex items-center gap-3 mb-6 pb-3 border-b border-[var(--current-card-border)]">
                        <MessageSquare size={20} color="var(--current-accent)" />
                        <h3 className="m-0 text-lg font-semibold" style={{ color: "var(--current-text)" }}>Welcome Message</h3>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold" style={{ color: "var(--current-text-secondary)" }}>Subject Line</label>
                            <input
                                className="w-full px-4 py-3 rounded-xl border outline-none text-sm transition-colors"
                                style={{ background: "var(--current-input-bg)", borderColor: "var(--current-input-border)", color: "var(--current-input-text)" }}
                                value={s.notification_welcome_subject}
                                onChange={(e) => onChange("notification_welcome_subject", e.target.value)}
                                placeholder="Welcome to our family!"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold" style={{ color: "var(--current-text-secondary)" }}>Email Body Contents</label>
                            <textarea
                                className="w-full px-4 py-3 rounded-xl border outline-none text-sm transition-colors"
                                style={{ background: "var(--current-input-bg)", borderColor: "var(--current-input-border)", color: "var(--current-input-text)", minHeight: 120 }}
                                value={s.notification_welcome_body}
                                onChange={(e) => onChange("notification_welcome_body", e.target.value)}
                                placeholder="We are so glad to have you sign up!"
                                rows={4}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationSettings;
