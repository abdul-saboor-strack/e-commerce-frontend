import React, { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import API from "../../api/api"

const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const [isValidated, setIsValidated] = useState(false);
    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
        const validateAdmin = async () => {
            console.log("🔵 [AdminProtectedRoute] Starting validation...");

            try {
                const adminToken = sessionStorage.getItem("adminToken");
                const adminRefreshToken = sessionStorage.getItem("adminRefreshToken");

                console.log("📋 [AdminProtectedRoute] Token check:");
                console.log("   - adminToken (sessionStorage):", adminToken ? "EXISTS" : "❌ MISSING");
                console.log("   - adminRefreshToken (sessionStorage):", adminRefreshToken ? "EXISTS" : "❌ MISSING");

                // IMMEDIATE REJECTION IF NO TOKENS
                if (!adminToken || !adminRefreshToken) {
                    console.warn("🚫 [AdminProtectedRoute] NO TOKENS IN SESSION - IMMEDIATE REJECTION");
                    sessionStorage.removeItem("adminToken");
                    sessionStorage.removeItem("adminRefreshToken");
                    localStorage.removeItem("admin_name");
                    localStorage.removeItem("admin_email");
                    localStorage.removeItem("admin_login_time");
                    setIsValidated(true);
                    setIsValid(false);
                    return;
                }

                console.log("✅ [AdminProtectedRoute] Tokens found in session, validating with backend...");

                // Validate tokens with backend
                const response = await API.post("/auth/admin/refresh", {
                    refreshToken: adminRefreshToken,
                });

                console.log("📊 [AdminProtectedRoute] Backend response status:", response.status);

                if (response.status === 200 && response.data) {
                    console.log("✅ [AdminProtectedRoute] VALIDATION PASSED - tokens are valid");
                    if (response.data.token) {
                        sessionStorage.setItem("adminToken", response.data.token);
                    }
                    setIsValid(true);
                } else {
                    console.error("❌ [AdminProtectedRoute] VALIDATION FAILED - bad response");
                    sessionStorage.removeItem("adminToken");
                    sessionStorage.removeItem("adminRefreshToken");
                    setIsValid(false);
                }
            } catch (error: any) {
                console.error("❌ [AdminProtectedRoute] VALIDATION FAILED - exception");
                console.error("   Error:", error?.message);
                console.error("   Status:", error?.response?.status);
                sessionStorage.removeItem("adminToken");
                sessionStorage.removeItem("adminRefreshToken");
                localStorage.removeItem("admin_name");
                localStorage.removeItem("admin_email");
                localStorage.removeItem("admin_login_time");
                setIsValid(false);
            } finally {
                console.log("🔄 [AdminProtectedRoute] Marking as validated");
                setIsValidated(true);
            }
        };

        validateAdmin();
    }, []);

    const clearAdminSession = () => {
        console.log("🔴 [AdminProtectedRoute] Clearing ALL admin session data");
        sessionStorage.removeItem("adminToken");
        sessionStorage.removeItem("adminRefreshToken");
        localStorage.removeItem("admin_name");
        localStorage.removeItem("admin_email");
        localStorage.removeItem("admin_login_time");
    };

    // ============== RENDER LOGIC ==============
    // Priority: Loading > Unauthorized > Authorized

    // STEP 1: While validation is in progress, MUST show loading (never render children)
    if (!isValidated) {
        console.log("⏳ [AdminProtectedRoute] RENDERING: Loading screen (validation in progress)");
        return (
            <div style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "var(--current-bg)",
                color: "var(--current-text)"
            }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 18, marginBottom: 16 }}>Verifying admin credentials...</div>
                    <div style={{ fontSize: 14, opacity: 0.6 }}>Please wait...</div>
                </div>
            </div>
        );
    }

    // STEP 2: Validation complete but FAILED - MUST redirect to login (never render children)
    if (!isValid) {
        console.error("🚫 [AdminProtectedRoute] RENDERING: Redirect to /admin/login (validation failed)");
        return <Navigate to="/admin/login" replace />;
    }

    // STEP 3: Validation complete and PASSED - NOW safe to render children
    console.log("✅ [AdminProtectedRoute] RENDERING: Admin dashboard (validation passed)");
    return children;
}

export default AdminProtectedRoute