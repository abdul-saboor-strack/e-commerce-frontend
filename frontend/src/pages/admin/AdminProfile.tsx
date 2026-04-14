import React, { useState, useEffect } from "react"

const AdminProfile = () => {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        setName(localStorage.getItem("admin_name") || "Admin")
        setEmail(localStorage.getItem("admin_email") || "admin@store.com")
    }, [])

    const save = () => {
        localStorage.setItem("admin_name", name)
        localStorage.setItem("admin_email", email)
        if (password) localStorage.setItem("admin_password", password)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    return (
        <div style={card}>
            <h2>Admin Profile</h2>

            <input
                style={input}
                placeholder="Name"
                value={name}
                onChange={e => setName(e.target.value)}
            />

            <input
                style={input}
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
            />

            <input
                style={input}
                type="password"
                placeholder="New Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
            />

            <button style={btn} onClick={save}>Save</button>

            {saved && <div style={success}>Saved ✓</div>}
        </div>
    )
}

export default AdminProfile

const card: React.CSSProperties = {
    background: "var(--current-surface)",
    padding: 30,
    borderRadius: 14,
    width: 400,
    color: "var(--current-text)"
}

const input: React.CSSProperties = {
    width: "100%",
    padding: 10,
    marginTop: 10,
    borderRadius: 8,
    border: "1px solid var(--current-input-border)",
    background: "var(--current-input-bg)",
    color: "var(--current-input-text)"
}

const btn: React.CSSProperties = {
    marginTop: 15,
    padding: 10,
    background: "var(--current-button-primary)",
    border: "none",
    borderRadius: 8,
    color: "var(--current-button-text)"
}

const success: React.CSSProperties = {
    marginTop: 10,
    color: "var(--current-success)"
}