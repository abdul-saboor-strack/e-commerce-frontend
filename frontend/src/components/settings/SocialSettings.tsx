import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import API from "../../api/api";
import { Settings, DEFAULTS, SocialLink } from "../../hooks/useSettings";

const SocialSettings = () => {
    const navigate = useNavigate();
    const [s, setS] = useState<Settings>(DEFAULTS);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await API.get("/settings");
                const merged: any = { ...DEFAULTS, ...(res.data || {}) };
                if (typeof merged.social_links === 'string') {
                    merged.social_links = JSON.parse(merged.social_links);
                }
                setS(merged);
            } catch {
                setS(DEFAULTS);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const save = async () => {
        try {
            const dataToSave = {
                ...s,
                social_links: JSON.stringify(s.social_links)
            };
            await API.put("/settings", dataToSave);
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

    const addSocialLink = () => {
        setS(prev => ({
            ...prev,
            social_links: [...prev.social_links, { platform: "", url: "" }]
        }));
    };

    const updateSocialLink = (index: number, field: keyof SocialLink, value: string) => {
        setS(prev => {
            const newLinks = [...prev.social_links];
            newLinks[index] = { ...newLinks[index], [field]: value };
            return { ...prev, social_links: newLinks };
        });
    };

    const removeSocialLink = (index: number) => {
        setS(prev => ({
            ...prev,
            social_links: prev.social_links.filter((_, i) => i !== index)
        }));
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
                            Social Media
                        </h1>
                        <p style={{ color: "var(--current-text-secondary)", fontSize: 14, margin: 0 }}>
                            Manage the social media links displayed in your footer.
                        </p>
                    </div>
                    <button onClick={save} className="btn-primary gap-2">
                        <Save size={18} /> Save Outlets
                    </button>
                </div>
            </div>

            {saved && (
                <div className="mb-6 p-4 rounded-xl flex items-center gap-2 font-medium" style={{
                    background: "rgba(34,197,94,0.1)",
                    border: "1px solid rgba(34,197,94,0.3)",
                    color: "#22c55e"
                }}>
                    ✅ Social links saved successfully.
                </div>
            )}

            {/* Content */}
            <div className="card p-6" style={{ background: "var(--current-card-bg)", border: `1px solid var(--current-card-border)` }}>
                <div className="flex justify-between items-center mb-6 pb-3 border-b border-[var(--current-card-border)]">
                    <h3 className="m-0 text-lg font-semibold" style={{ color: "var(--current-text)" }}>Connected Platforms</h3>
                    <button
                        onClick={addSocialLink}
                        className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border hover:bg-[var(--current-surface)] transition"
                        style={{ color: "var(--current-text)", borderColor: "var(--current-card-border)" }}
                    >
                        <Plus size={16} /> Add Link
                    </button>
                </div>

                <div className="space-y-4">
                    {s.social_links.map((link, index) => (
                        <div key={index} className="flex gap-4 items-start">
                            <div className="flex-1 space-y-2">
                                <label className="block text-xs font-semibold" style={{ color: "var(--current-text-secondary)" }}>Platform Name</label>
                                <input
                                    className="w-full px-4 py-3 rounded-xl border outline-none text-sm transition-colors"
                                    style={{ background: "var(--current-input-bg)", borderColor: "var(--current-input-border)", color: "var(--current-input-text)" }}
                                    value={link.platform}
                                    onChange={(e) => updateSocialLink(index, "platform", e.target.value)}
                                    placeholder="e.g., Instagram"
                                />
                            </div>
                            <div className="flex-[2] space-y-2">
                                <label className="block text-xs font-semibold" style={{ color: "var(--current-text-secondary)" }}>URL</label>
                                <div className="flex gap-2">
                                    <input
                                        className="w-full px-4 py-3 rounded-xl border outline-none text-sm transition-colors"
                                        style={{ background: "var(--current-input-bg)", borderColor: "var(--current-input-border)", color: "var(--current-input-text)" }}
                                        value={link.url}
                                        onChange={(e) => updateSocialLink(index, "url", e.target.value)}
                                        placeholder="https://..."
                                    />
                                    <button
                                        onClick={() => removeSocialLink(index)}
                                        className="flex items-center justify-center w-12 rounded-xl border transition-colors hover:bg-red-50"
                                        style={{ borderColor: "var(--current-input-border)", color: "var(--current-error)" }}
                                        title="Remove Platform"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {s.social_links.length === 0 && (
                        <div className="text-center py-8" style={{ color: "var(--current-text-secondary)" }}>
                            No social links added yet. Click "Add Link" to get started.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SocialSettings;