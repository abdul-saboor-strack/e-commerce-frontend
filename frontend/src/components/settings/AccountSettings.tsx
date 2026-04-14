import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Lock, Mail, User } from "lucide-react";
import API from "../../api/api";

const AccountSettings = () => {
    const navigate = useNavigate();
    
    // Form states
    const [email, setEmail] = useState(localStorage.getItem("admin_email") || "");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    // UI states
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const updateAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        
        if (newPassword && newPassword !== confirmPassword) {
            return setError("New passwords do not match.");
        }
        
        if (!currentPassword) {
            return setError("Current password is required to make changes.");
        }

        setLoading(true);
        try {
            const { data } = await API.put("/admin/account", {
                email,
                currentPassword,
                newPassword: newPassword || undefined
            });
            
            setSuccess("Account updated successfully!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            
            // Update token if server replaced it
            if (data.token) {
                sessionStorage.setItem("adminToken", data.token);
                localStorage.setItem("admin_email", email);
            }
            
            setTimeout(() => setSuccess(""), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to update account.");
        } finally {
            setLoading(false);
        }
    };

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
                            Admin Account
                        </h1>
                        <p style={{ color: "var(--current-text-secondary)", fontSize: 14, margin: 0 }}>
                            Update your login credentials and security details.
                        </p>
                    </div>
                </div>
            </div>

            {success && (
                <div className="mb-6 p-4 rounded-xl flex items-center gap-2 font-medium" style={{
                    background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e"
                }}>
                    ✅ {success}
                </div>
            )}
            
            {error && (
                <div className="mb-6 p-4 rounded-xl flex items-center gap-2 font-medium" style={{
                    background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444"
                }}>
                    ❌ {error}
                </div>
            )}

            <form onSubmit={updateAccount} className="grid gap-6 max-w-2xl">
                
                {/* Profile Card */}
                <div className="card p-6" style={{ background: "var(--current-card-bg)", border: `1px solid var(--current-card-border)` }}>
                    <div className="flex items-center gap-3 mb-6 pb-3 border-b border-[var(--current-card-border)]">
                        <User size={20} color="var(--current-accent)" />
                        <h3 className="m-0 text-lg font-semibold" style={{ color: "var(--current-text)" }}>Profile Information</h3>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold" style={{ color: "var(--current-text-secondary)" }}>Administrator Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border outline-none text-sm transition-colors"
                                    style={{ background: "var(--current-input-bg)", borderColor: "var(--current-input-border)", color: "var(--current-input-text)" }}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Card */}
                <div className="card p-6" style={{ background: "var(--current-card-bg)", border: `1px solid var(--current-card-border)` }}>
                    <div className="flex items-center gap-3 mb-6 pb-3 border-b border-[var(--current-card-border)]">
                        <Lock size={20} color="var(--current-error)" />
                        <h3 className="m-0 text-lg font-semibold" style={{ color: "var(--current-text)" }}>Security & Password</h3>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold" style={{ color: "var(--current-text-secondary)" }}>Current Password (Required)</label>
                            <input
                                type="password"
                                className="w-full px-4 py-3 rounded-xl border outline-none text-sm transition-colors"
                                style={{ background: "var(--current-input-bg)", borderColor: "var(--current-input-border)", color: "var(--current-input-text)" }}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Verify your current password"
                                required
                            />
                        </div>
                        
                        <div className="grid sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-[var(--current-card-border)]/50">
                            <div className="space-y-2">
                                <label className="block text-xs font-semibold" style={{ color: "var(--current-text-secondary)" }}>New Password</label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-3 rounded-xl border outline-none text-sm transition-colors"
                                    style={{ background: "var(--current-input-bg)", borderColor: "var(--current-input-border)", color: "var(--current-input-text)" }}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Leave blank to keep current"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-semibold" style={{ color: "var(--current-text-secondary)" }}>Confirm New Password</label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-3 rounded-xl border outline-none text-sm transition-colors"
                                    style={{ background: "var(--current-input-bg)", borderColor: "var(--current-input-border)", color: "var(--current-input-text)" }}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Verify new password"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-end pt-4">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="btn-primary gap-2 w-full sm:w-auto"
                    >
                        <Save size={18} /> {loading ? "Updating..." : "Update Security"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AccountSettings;