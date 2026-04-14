import { useState, useEffect } from "react"
import axios from "axios"

interface SubCategory {
    id: number
    name: string
    categoryId: number
}

interface Category {
    id: number
    name: string
    subcategories?: SubCategory[]
}

const API = "http://localhost:5000/api/categories"

const AdminCategories = () => {
    const [categories, setCategories] = useState<Category[]>([])
    const [name, setName] = useState("")
    const [subName, setSubName] = useState("")
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)

    /* ================= LOAD FROM DATABASE ================= */
    const loadCategories = async () => {
        try {
            const res = await axios.get(API)
            setCategories(res.data || [])
        } catch {
            setCategories([])
        }
    }

    useEffect(() => {
        loadCategories()
    }, [])

    /* ================= ADD CATEGORY ================= */
    const addCategory = async () => {
        if (!name) return alert("Enter category name")

        try {
            await axios.post(API, { name })
            setName("")
            loadCategories()
        } catch {
            alert("Save failed")
        }
    }

    /* ================= DELETE CATEGORY ================= */
    const deleteCategory = async (id: number) => {
        await axios.delete(`${API}/${id}`)
        loadCategories()
    }

    /* ================= ADD SUBCATEGORY ================= */
    const addSubCategory = async () => {
        if (!subName || !selectedCategoryId) return alert("Select category")

        // Backend endpoint: POST /api/categories/:categoryId/subcategories
        await axios.post(`${API}/${selectedCategoryId}/subcategories`, {
            name: subName
        })

        setSubName("")
        loadCategories()
    }

    return (
        <>
            <h1 style={{ marginBottom: 20 }}>Categories</h1>

            {/* ADD CATEGORY */}
            <div style={card}>
                <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Category name"
                    style={input}
                />

                <button onClick={addCategory} style={btn}>
                    Add Category
                </button>
            </div>

            {/* ADD SUBCATEGORY */}
            <div style={card}>
                <select
                    value={selectedCategoryId || ""}
                    onChange={e => setSelectedCategoryId(Number(e.target.value))}
                    style={input}
                >
                    <option value="">Select Parent Category</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>

                <input
                    value={subName}
                    onChange={e => setSubName(e.target.value)}
                    placeholder="Subcategory name"
                    style={input}
                />

                <button onClick={addSubCategory} style={btn}>
                    Add Subcategory
                </button>
            </div>

            {/* LIST */}
            <div style={{ maxWidth: 500 }}>
                {categories.map(cat => (
                    <div key={cat.id} style={listItem}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <strong>{cat.name}</strong>

                            <button onClick={() => deleteCategory(cat.id)} style={deleteBtn}>
                                Delete
                            </button>
                        </div>

                        {/* SUBCATEGORIES */}
                        {cat.subcategories?.map(sub => (
                            <div
                                key={sub.id}
                                style={{ ...subItem, display: "flex", justifyContent: "space-between", gap: 10 }}
                            >
                                <span>└ {sub.name}</span>
                                <button
                                    onClick={async () => {
                                        if (!window.confirm("Delete this subcategory?")) return
                                        await axios.delete(`${API}/subcategories/${sub.id}`)
                                        loadCategories()
                                    }}
                                    style={{ ...deleteBtn, padding: "4px 8px", fontSize: 12 }}
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </>
    )
}

export default AdminCategories

/* ===== STYLES ===== */

const card: React.CSSProperties = {
    background: "var(--current-card-bg)",
    padding: 25,
    borderRadius: 14,
    color: "var(--current-text)",
    marginBottom: 20,
    maxWidth: 500,
    border: "1px solid var(--current-card-border)"
}

const input: React.CSSProperties = {
    width: "100%",
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    border: "1px solid var(--current-input-border)",
    background: "var(--current-input-bg)",
    color: "var(--current-input-text)"
}

const btn: React.CSSProperties = {
    padding: 10,
    background: "var(--current-button-primary)",
    border: "none",
    color: "var(--current-button-text)",
    borderRadius: 8,
    cursor: "pointer",
    width: "100%"
}

const listItem: React.CSSProperties = {
    background: "var(--current-surface)",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    color: "var(--current-text)",
    border: "1px solid var(--current-card-border)"
}

const subItem: React.CSSProperties = {
    marginTop: 6,
    marginLeft: 10,
    opacity: 0.8
}

const deleteBtn: React.CSSProperties = {
    background: "var(--current-error)",
    border: "none",
    color: "var(--current-button-text)",
    padding: "6px 12px",
    borderRadius: 6,
    cursor: "pointer"
}