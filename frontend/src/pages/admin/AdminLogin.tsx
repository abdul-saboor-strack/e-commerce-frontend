import React, { useState } from "react";
import API from "../../api/api";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const saveSession = (token: string, refreshToken: string, name: string, adminEmail: string) => {
    // Store tokens in sessionStorage (NOT localStorage) - will expire when browser/tab closes
    // This ensures user must login again when they come back
    sessionStorage.setItem("adminToken", token);
    sessionStorage.setItem("adminRefreshToken", refreshToken);
    localStorage.setItem("admin_name", name);
    localStorage.setItem("admin_email", adminEmail);
    localStorage.setItem("admin_login_time", new Date().getTime().toString());

    console.log("✅ Admin session tokens saved to sessionStorage (will expire on browser close)");

    // Redirect after a brief delay
    setSuccess("Login successful! Redirecting...");
    setTimeout(() => {
      window.location.href = "/admin";
    }, 1000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Client-side validation
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!password || password.length < 1) {
      setError("Password is required");
      return;
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const res = await API.post("/auth/admin/login", {
        email: email.toLowerCase().trim(),
        password
      });

      const { token, refreshToken, admin } = res.data;

      if (!token || !admin) {
        throw new Error("Invalid response from server");
      }

      saveSession(token, refreshToken, admin?.name || "Admin", admin?.email || email);
    } catch (e: any) {
      const errorMessage = e?.response?.data?.message || "Login failed. Please try again.";
      const retryAfter = e?.response?.data?.retryAfter;

      if (retryAfter) {
        setError(`${errorMessage} Please wait ${retryAfter} seconds before trying again.`);
      } else {
        setError(errorMessage);
      }

      console.error("Login error:", e);
    } finally {
      setLoading(false);
    }
  };

  const buttonStyle: React.CSSProperties = {
    width: "100%",
    marginTop: 22,
    padding: 14,
    borderRadius: 14,
    border: "none",
    background: loading ? "rgba(255,255,255,0.3)" : "var(--current-accent)",
    color: "var(--current-text)",
    fontWeight: 700,
    cursor: loading ? "not-allowed" : "pointer",
    pointerEvents: loading ? "none" : "auto",
  };

  return (
    <div style={wrapper}>
      <form
        style={card}
        onSubmit={handleLogin}
        autoComplete="off"
      >
        <div style={{ display: "none" }}>
          <input name="fakeusernameremembered" type="text" autoComplete="username" />
          <input name="fakepasswordremembered" type="password" autoComplete="current-password" />
        </div>
        <h1 style={title}>Admin Sign In</h1>
        <p style={sub}>Enter your admin credentials to access the dashboard.</p>

        {error && <div style={errorBox}>{error}</div>}
        {success && <div style={successBox}>{success}</div>}

        <label style={label}>Email Address</label>
        <input
          name="email"
          autoComplete="off"
          style={input}
          placeholder="Enter the email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          disabled={loading}
          required
          type="email"
        />

        <label style={label}>Password</label>
        <input
          name="password"
          autoComplete="current-password"
          type="password"
          style={input}
          placeholder="••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          disabled={loading}
          required
        />

        <button
          style={buttonStyle}
          disabled={loading || !email || !password}
          type="submit"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;

const wrapper: React.CSSProperties = {
  minHeight: "100vh",
  background: "var(--current-bg)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "24px",
  pointerEvents: "auto",
  position: "relative",
};



const card: React.CSSProperties = {
  background: "var(--current-surface)",
  border: "1px solid var(--current-card-border)",
  borderRadius: 24,
  padding: 32,
  width: "100%",
  maxWidth: 400,
  color: "var(--current-text)",
  boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  pointerEvents: "auto",
  position: "relative",
};

const title: React.CSSProperties = {
  margin: 0,
  fontSize: 28,
  textAlign: "left",
  color: "var(--current-text)",
  fontWeight: 700
};

const sub: React.CSSProperties = {
  margin: "8px 0 24px",
  color: "var(--current-text-secondary)",
  fontSize: 14,
  lineHeight: 1.5
};

const label: React.CSSProperties = {
  fontSize: 13,
  color: "var(--current-text-secondary)",
  marginTop: 16,
  display: "block",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.5px"
};

const input: React.CSSProperties = {
  width: "100%",
  padding: 12,
  marginTop: 8,
  borderRadius: 10,
  border: "1px solid var(--current-input-border)",
  background: "var(--current-input-bg)",
  color: "var(--current-text)",
  outline: "none",
  fontSize: 14,
  pointerEvents: "auto",
  cursor: "text",
  boxSizing: "border-box",
  transition: "border-color 200ms ease",
};

const errorBox: React.CSSProperties = {
  background: "rgba(239, 68, 68, 0.15)",
  border: "1px solid rgba(239, 68, 68, 0.3)",
  color: "var(--current-error)",
  padding: 12,
  borderRadius: 10,
  marginBottom: 16,
  fontSize: 13,
  lineHeight: 1.5,
};

const successBox: React.CSSProperties = {
  background: "rgba(34, 197, 94, 0.15)",
  border: "1px solid rgba(34, 197, 94, 0.3)",
  color: "var(--current-success)",
  padding: 12,
  borderRadius: 10,
  marginBottom: 16,
  fontSize: 13,
  lineHeight: 1.5,
};
