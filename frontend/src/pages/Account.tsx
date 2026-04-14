import { useState } from "react"
import API from "../api/api"

const Account = () => {
  const [mode, setMode] = useState<"login" | "register" | "profile">(
    localStorage.getItem("token") ? "profile" : "login"
  )

  const [name, setName] = useState(localStorage.getItem("customer_name") || "")
  const [email, setEmail] = useState(localStorage.getItem("customer_email") || "")
  const [password, setPassword] = useState("")
  const [address, setAddress] = useState(localStorage.getItem("customer_address") || "")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [error, setError] = useState("")

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const register = async () => {
    setError("")

    if (!name) return setError("Enter your name")
    if (!validateEmail(email)) return setError("Invalid email format")
    if (password.length < 6) return setError("Password must be 6+ characters")
    if (!address) return setError("Enter address")

    if (!otpSent) {
      // Send OTP
      try {
        await API.post("/auth/send-otp", { email })
        setOtpSent(true)
        setError("")
      } catch (e: any) {
        setError(e?.response?.data?.message || "Failed to send OTP")
      }
    } else {
      // Verify OTP and register
      if (!otp) return setError("Enter the OTP sent to your email")

      try {
        const res = await API.post("/auth/verify-otp", { email, otp, name, password, address })
        const { token, user } = res.data
        localStorage.setItem("token", token)
        localStorage.setItem("customer_name", user.name)
        localStorage.setItem("customer_email", user.email)
        localStorage.setItem("customer_address", user.address || "")
        setMode("profile")
        setOtpSent(false)
        setOtp("")
      } catch (e: any) {
        setError(e?.response?.data?.message || "Registration failed")
      }
    }
  }

  const login = async () => {
    setError("")

    try {
      const res = await API.post("/auth/login", { email, password })
      const { token, user } = res.data
      localStorage.setItem("token", token)
      localStorage.setItem("customer_name", user.name)
      localStorage.setItem("customer_email", user.email)
      localStorage.setItem("customer_address", user.address || "")
      setName(user.name)
      setAddress(user.address || "")
      setMode("profile")
    } catch (e: any) {
      setError(e?.response?.data?.message || "Invalid email or password")
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setMode("login")
    //setPassword("")
  }

  const saveProfile = async () => {
    const token = localStorage.getItem("token")
    if (!token) return
    try {
      const res = await API.put(
        "/auth/profile",
        { name, address },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const user = res.data.user
      localStorage.setItem("customer_name", user.name)
      localStorage.setItem("customer_address", user.address || "")
      setError("")
    } catch (e: any) {
      setError(e?.response?.data?.message || "Profile update failed")
    }
  }

  return (
    <div style={page}>
      <div style={card}>

        {mode !== "profile" && (
          <h2 style={title}>
            {mode === "login" ? "Customer Login" : "Create Account"}
          </h2>
        )}

        {error && <div style={errorBox}>{error}</div>}

        {mode === "register" && (
          <input
            style={input}
            placeholder="Full Name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        )}

        {mode !== "profile" && (
          <>
            <input
              style={input}
              placeholder="Email Address"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />

            <input
              style={input}
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </>
        )}

        {mode === "register" && (
          <textarea
            style={textarea}
            placeholder="Full Address"
            value={address}
            onChange={e => setAddress(e.target.value)}
          />
        )}

        {mode === "login" && (
          <>
            <button style={button} onClick={login}>
              Login
            </button>

            <p style={switchText}>
              New customer?
              <span style={link} onClick={() => setMode("register")}>
                Create account
              </span>
            </p>
          </>
        )}

        {mode === "register" && (
          <>
            {otpSent && (
              <input
                style={input}
                placeholder="Enter OTP sent to your email"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                maxLength={6}
              />
            )}

            <button style={button} onClick={register}>
              {otpSent ? "Verify OTP & Create Account" : "Send OTP"}
            </button>

            <p style={switchText}>
              Already have account?
              <span style={link} onClick={() => { setMode("login"); setOtpSent(false); setOtp(""); }}>
                Login
              </span>
            </p>
          </>
        )}

        {mode === "profile" && (
          <>
            <h2 style={title}>My Profile</h2>

            <input
              style={input}
              placeholder="Full Name"
              value={name}
              onChange={e => setName(e.target.value)}
            />

            <input
              style={input}
              placeholder="Email Address"
              value={email}
              disabled
            />

            <textarea
              style={textarea}
              placeholder="Full Address"
              value={address}
              onChange={e => setAddress(e.target.value)}
            />

            <button style={button} onClick={saveProfile}>
              Save Profile
            </button>

            <button style={button} onClick={logout}>
              Logout
            </button>
          </>
        )}

      </div>
    </div>
  )
}

export default Account

/* ===== PREMIUM UI ===== */

const page: React.CSSProperties = {
  minHeight: "80vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "var(--current-bg)",
  padding: 20
}

const card: React.CSSProperties = {
  width: 420,
  background: "var(--current-surface)",
  border: "1px solid var(--current-card-border)",
  borderRadius: 18,
  padding: 30,
  boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
}

const title: React.CSSProperties = {
  color: "var(--current-text)",
  textAlign: "center",
  marginBottom: 20
}

const input: React.CSSProperties = {
  width: "100%",
  padding: 12,
  marginBottom: 12,
  borderRadius: 10,
  border: "1px solid var(--current-input-border)",
  background: "var(--current-input-bg)",
  color: "var(--current-input-text)"
}

const textarea: React.CSSProperties = {
  width: "100%",
  padding: 12,
  marginBottom: 12,
  borderRadius: 10,
  border: "1px solid var(--current-input-border)",
  background: "var(--current-input-bg)",
  color: "var(--current-input-text)",
  minHeight: 80
}

const button: React.CSSProperties = {
  width: "100%",
  padding: 12,
  borderRadius: 12,
  border: "none",
  background: "var(--current-button-primary)",
  color: "white",
  fontWeight: 600,
  cursor: "pointer",
  marginTop: 5
}

const errorBox: React.CSSProperties = {
  background: "var(--current-error)",
  padding: 10,
  borderRadius: 8,
  marginBottom: 12,
  color: "white",
  textAlign: "center"
}

const switchText: React.CSSProperties = {
  marginTop: 15,
  textAlign: "center",
  color: "var(--current-text-secondary)"
}

const link: React.CSSProperties = {
  marginLeft: 6,
  color: "var(--current-accent)",
  cursor: "pointer",
  fontWeight: 600
}

const profileItem: React.CSSProperties = {
  color: "var(--current-text)",
  marginBottom: 10
}