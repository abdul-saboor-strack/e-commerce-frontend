import React, { useState, useEffect } from "react"
import API from "../../api/api"
import { X, Edit2, Trash2, Users } from "lucide-react"

interface User {
    id: number
    name: string
    email: string
    createdAt: string
}

export default function AdminCustomers() {
    const [users, setUsers] = useState<User[]>([])
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [form, setForm] = useState({ name: "", email: "" })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const res = await API.get("/customers")
            setUsers(res.data || [])
        } catch (err) {
            console.error("Error fetching users:", err)
        } finally {
            setLoading(false)
        }
    }

    const handleEditClick = (user: User) => {
        setSelectedUser(user)
        setForm({ name: user.name, email: user.email })
        setModalOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (!window.confirm("Delete this customer? This action cannot be undone.")) return
        try {
            await API.delete(`/customers/${id}`)
            fetchUsers()
        } catch (err) {
            console.error("Delete error:", err)
            alert("Failed to delete customer")
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async () => {
        if (!selectedUser || !form.name || !form.email) {
            alert("Name and email are required")
            return
        }
        try {
            await API.put(`/customers/${selectedUser.id}`, form)
            setModalOpen(false)
            setSelectedUser(null)
            fetchUsers()
        } catch (err) {
            console.error("Update error:", err)
            alert("Failed to update customer")
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-[var(--current-text-secondary)]">Loading customers...</p>
        </div>
    )

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div>
                <h1 className="text-3xl font-bold mb-2">Customer Management</h1>
                <p className="text-[var(--current-text-secondary)]">View and manage all customers</p>
            </div>

            {/* CUSTOMERS TABLE */}
            <div className="rounded-2xl border border-[var(--current-card-border)] bg-[var(--current-surface)] overflow-hidden">
                {users.length === 0 ? (
                    <div className="p-12 text-center">
                        <Users className="mx-auto mb-3 text-[var(--current-text-secondary)]" size={32} />
                        <p className="text-[var(--current-text-secondary)]">No customers yet</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-[var(--current-card-border)] bg-[var(--current-bg)]/5">
                                <tr>
                                    <th className="px-4 sm:px-6 py-4 text-left font-semibold text-[var(--current-text)]">ID</th>
                                    <th className="px-4 sm:px-6 py-4 text-left font-semibold text-[var(--current-text)]">Name</th>
                                    <th className="px-4 sm:px-6 py-4 text-left font-semibold text-[var(--current-text)] hidden sm:table-cell">Email</th>
                                    <th className="px-4 sm:px-6 py-4 text-left font-semibold text-[var(--current-text)] hidden lg:table-cell">Joined</th>
                                    <th className="px-4 sm:px-6 py-4 text-center font-semibold text-[var(--current-text)]">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id} className="border-b border-[var(--current-card-border)] hover:bg-[var(--current-bg)]/60 transition">
                                        <td className="px-4 sm:px-6 py-4 font-mono text-[var(--current-accent)]">#{user.id}</td>
                                        <td className="px-4 sm:px-6 py-4 text-[var(--current-text)]">{user.name}</td>
                                        <td className="px-4 sm:px-6 py-4 hidden sm:table-cell text-[var(--current-text-secondary)] truncate max-w-[200px]">{user.email}</td>
                                        <td className="px-4 sm:px-6 py-4 hidden lg:table-cell text-[var(--current-text-secondary)] text-xs">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 text-center flex gap-2 justify-center">
                                            <button
                                                onClick={() => handleEditClick(user)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition text-xs font-medium"
                                            >
                                                <Edit2 size={14} />
                                                <span className="hidden sm:inline">Edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition text-xs font-medium"
                                            >
                                                <Trash2 size={14} />
                                                <span className="hidden sm:inline">Delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* EDIT MODAL */}
            {modalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-[var(--current-surface)] border border-[var(--current-card-border)] rounded-2xl max-w-md w-full">
                        {/* HEADER */}
                        <div className="border-b border-[var(--current-card-border)] px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-[var(--current-text)]">Edit Customer</h2>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="p-1 hover:bg-[var(--current-bg)]/10 rounded-lg transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* CONTENT */}
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-[var(--current-text-secondary)] mb-2">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-lg bg-[var(--current-bg)]/5 border border-[var(--current-card-border)] text-[var(--current-text)] placeholder-[var(--current-text-secondary)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Enter customer name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-[var(--current-text-secondary)] mb-2">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-lg bg-[var(--current-bg)]/5 border border-[var(--current-card-border)] text-[var(--current-text)] placeholder-[var(--current-text-secondary)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Enter customer email"
                                />
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="border-t border-[var(--current-card-border)] px-6 py-4 flex gap-3">
                            <button
                                onClick={() => setModalOpen(false)}
                                className="flex-1 px-4 py-2 rounded-lg bg-[var(--current-bg)]/10 hover:bg-[var(--current-bg)]/20 transition font-medium text-[var(--current-text)]"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="flex-1 px-4 py-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 font-medium transition"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}