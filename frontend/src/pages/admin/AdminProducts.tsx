import React, { useEffect, useState } from "react"
import API from "../../api/api"
import { getProductImage, resolveImageSrc } from "../../utils/productImage"

interface Product {
    id: number
    name: string
    price: number
    image: string | null
    imageUrl?: string | null
    images?: string[] | null
    category_id: number | null
    subcategory_id?: number | null
    category_name?: string
    stock?: number
    status?: "active" | "out_of_stock"
}

interface Category {
    id: number
    name: string
    subcategories?: { id: number; name: string }[]
}

const AdminProducts = () => {
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])

    const [formOpen, setFormOpen] = useState(false)
    const [editing, setEditing] = useState<Product | null>(null)

    const [name, setName] = useState("")
    const [price, setPrice] = useState("")
    const [categoryId, setCategoryId] = useState<number | "">("")
    const [subcategoryId, setSubcategoryId] = useState<number | "">("")
    const [customCategory, setCustomCategory] = useState("")
    const [customSubcategory, setCustomSubcategory] = useState("")
    const [stock, setStock] = useState("0")
    const [status, setStatus] = useState<"active" | "out_of_stock">("active")

    const [images, setImages] = useState<File[]>([])
    const [previews, setPreviews] = useState<string[]>([])

    const [search, setSearch] = useState("")
    const [filterCategory, setFilterCategory] = useState<number | "">("")
    const [page, setPage] = useState(1)
    const perPage = 6

    useEffect(() => {
        fetchProducts()
        fetchCategories()
    }, [])

    const fetchProducts = async () => {
        const res = await API.get("/products")
        setProducts(res.data)
    }

    const fetchCategories = async () => {
        const res = await API.get("/categories")
        setCategories(res.data)
    }

    const openAdd = () => {
        setEditing(null)
        setName("")
        setPrice("")
        setCategoryId("")
        setSubcategoryId("")
        setCustomCategory("")
        setCustomSubcategory("")
        setStock("0")
        setStatus("active")
        setImages([])
        setPreviews([])
        setFormOpen(true)
    }

    const openEdit = (p: Product) => {
        setEditing(p)
        setName(p.name)
        setPrice(String(p.price))
        setCategoryId(p.category_id || "")
        setSubcategoryId(p.subcategory_id || "")
        setCustomCategory("")
        setCustomSubcategory("")
        setStock(String(p.stock ?? 0))
        setStatus(p.status === "active" ? "active" : "out_of_stock")
        // Handle existing images - now images contains full URLs
        if (p.images && p.images.length > 0) {
            setPreviews(p.images.map((img) => resolveImageSrc(img)))
        } else if (p.imageUrl) {
            setPreviews([resolveImageSrc(p.imageUrl)])
        } else if (p.image) {
            setPreviews([resolveImageSrc(p.image)])
        } else {
            setPreviews([])
        }
        setImages([])
        setFormOpen(true)
    }

    const handleImages = (files: FileList | null) => {
        if (!files) return
        const fileArray = Array.from(files)
        setImages(fileArray)
        const newPreviews = fileArray.map(file => URL.createObjectURL(file))
        setPreviews(prev => [...prev, ...newPreviews])
    }

    const removePreview = (index: number) => {
        setPreviews(prev => prev.filter((_, i) => i !== index))
        setImages(prev => prev.filter((_, i) => i !== index))
    }

    /* ✅ FIXED SUBMIT */
    const submit = async () => {
        if (!name || !price) {
            alert("Name and price required")
            return
        }

        const data = new FormData()
        data.append("name", name)
        data.append("price", price)
        data.append("stock", stock)
        data.append("status", status)

        // Optional: allow creating category/subcategory by name
        if (customCategory.trim()) data.append("category", customCategory.trim())
        if (customSubcategory.trim()) data.append("subcategory", customSubcategory.trim())

        if (categoryId !== "") {
            data.append("category_id", String(categoryId))
        }

        if (subcategoryId !== "") {
            data.append("subcategory_id", String(subcategoryId))
        }

        if (images.length > 0) {
            images.forEach(img => data.append("images", img))
        }

        try {
            if (editing) {
                await API.put(`/products/${editing.id}`, data, {
                    headers: { "Content-Type": "multipart/form-data" }
                })
            } else {
                await API.post("/products", data, {
                    headers: { "Content-Type": "multipart/form-data" }
                })
            }

            setFormOpen(false)
            fetchProducts()
            alert("Product saved successfully")
        } catch (err: any) {
            console.log(err?.response?.data || err)
            alert("Product save failed")
        }
    }

    const remove = async (id: number) => {
        if (!window.confirm("Delete this product?")) return
        await API.delete(`/products/${id}`)
        fetchProducts()
    }

    /* ✅ FILTER FIXED */
    const filtered = products.filter(p => {
        const matchName = p.name.toLowerCase().includes(search.toLowerCase())
        const matchCategory = filterCategory ? p.category_id === filterCategory : true
        return matchName && matchCategory
    })

    const paginated = filtered.slice((page - 1) * perPage, page * perPage)
    const totalPages = Math.ceil(filtered.length / perPage)

    return (
        <>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                <h1>Products</h1>
                <button onClick={openAdd} style={btnPrimary}>+ Add Product</button>
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                <input
                    placeholder="Search..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={input}
                />

                <select
                    value={filterCategory}
                    onChange={e => {
                        const val = e.target.value
                        setFilterCategory(val === "" ? "" : Number(val))
                    }}
                    style={input}
                >
                    <option value="">All Categories</option>
                    {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            <div style={card}>
                <table style={table}>
                    <thead>
                        <tr>
                            <th style={th}>Image</th>
                            <th style={th}>Name</th>
                            <th style={th}>Price</th>
                            <th style={th}>Stock</th>
                            <th style={th}>Status</th>
                            <th style={th}>Category</th>
                            <th style={th}>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {paginated.map(p => (
                            <tr key={p.id}>
                                <td style={td}>
                                    {(p.image || p.imageUrl || (p.images && p.images.length > 0)) && (
                                        <img
                                            src={getProductImage(p)}
                                            width={50}
                                            height={50}
                                            style={{ objectFit: 'contain', borderRadius: 8, background: 'var(--current-input-bg)', padding: 4 }}
                                        />
                                    )}
                                </td>

                                <td style={td}>{p.name}</td>
                                <td style={td}>Rs {p.price}</td>
                                <td style={td}>{p.stock ?? 0}</td>
                                <td style={td}>{p.status === "active" ? "Active" : "Out of stock"}</td>

                                {/* ✅ CATEGORY SHOW FIXED */}
                                <td style={td}>
                                    {p.category_name ||
                                        categories.find(c => c.id === p.category_id)?.name ||
                                        "-"}
                                </td>

                                <td style={td}>
                                    <button onClick={() => openEdit(p)} style={btnEdit}>Edit</button>
                                    <button onClick={() => remove(p.id)} style={btnDelete}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: 20 }}>
                <button disabled={page === 1} onClick={() => setPage(page - 1)} style={btnPrimary}>Prev</button>
                <span style={{ margin: "0 10px" }}>Page {page} / {totalPages || 1}</span>
                <button disabled={page === totalPages} onClick={() => setPage(page + 1)} style={btnPrimary}>Next</button>
            </div>

            {formOpen && (
                <div style={modalBg}>
                    <div style={modal}>
                        <h2>{editing ? "Edit Product" : "Add Product"}</h2>

                        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={input} />
                        <input placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} style={input} />
                        <input placeholder="Stock" value={stock} onChange={e => setStock(e.target.value)} style={input} />

                        <select value={status} onChange={e => setStatus(e.target.value as any)} style={input}>
                            <option value="active">Active</option>
                            <option value="out_of_stock">Out of Stock</option>
                        </select>

                        {/* ✅ CATEGORY DROPDOWN FIXED */}
                        <select
                            value={categoryId}
                            onChange={e => {
                                const val = e.target.value
                                setCategoryId(val === "" ? "" : Number(val))
                                setSubcategoryId("")
                            }}
                            style={input}
                        >
                            <option value="">Select Category</option>
                            {categories.length === 0 && (
                                <option disabled>Loading...</option>
                            )}
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>

                        <input
                            placeholder="Or type new category (auto-create)"
                            value={customCategory}
                            onChange={e => setCustomCategory(e.target.value)}
                            style={input}
                        />

                        <select
                            value={subcategoryId}
                            onChange={e => {
                                const val = e.target.value
                                setSubcategoryId(val === "" ? "" : Number(val))
                            }}
                            style={input}
                            disabled={categoryId === ""}
                        >
                            <option value="">Select Subcategory</option>
                            {(categories.find(c => c.id === Number(categoryId))?.subcategories || []).map(sc => (
                                <option key={sc.id} value={sc.id}>{sc.name}</option>
                            ))}
                        </select>

                        <input
                            placeholder="Or type new subcategory (auto-create)"
                            value={customSubcategory}
                            onChange={e => setCustomSubcategory(e.target.value)}
                            style={input}
                            disabled={categoryId === "" && !customCategory.trim()}
                        />

                        <input type="file" multiple onChange={e => handleImages(e.target.files)} />

                        <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                            {previews.map((preview, index) => (
                                <div key={index} style={{ position: 'relative' }}>
                                    <img
                                        src={preview}
                                        width={80}
                                        height={80}
                                        style={{ objectFit: 'contain', borderRadius: 4, background: 'var(--current-input-bg)', padding: 4 }}
                                    />
                                    <button
                                        onClick={() => removePreview(index)}
                                        style={{
                                            position: 'absolute',
                                            top: -5,
                                            right: -5,
                                            background: 'red',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: 20,
                                            height: 20,
                                            cursor: 'pointer',
                                            fontSize: 12
                                        }}
                                    >
                                        x
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: 15 }}>
                            <button onClick={submit} style={btnPrimary}>Save</button>
                            <button onClick={() => setFormOpen(false)} style={btnCancel}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default AdminProducts

/* styles same */

const card = { background: "var(--current-surface)", padding: 20, borderRadius: 12, color: "var(--current-text)", border: "1px solid var(--current-card-border)" }

const modalBg: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
}

const table: React.CSSProperties = {
    width: "100%",
    color: "white",
    borderCollapse: "collapse"
}

const th: React.CSSProperties = {
    padding: 12,
    textAlign: "left",
    borderBottom: "1px solid var(--current-card-border)"
}

const td: React.CSSProperties = {
    padding: 12,
    borderBottom: "1px solid var(--current-card-border)"
}

const input = {
    width: "100%",
    padding: 10,
    marginTop: 10,
    borderRadius: 8,
    border: "1px solid var(--current-input-border)",
    background: "var(--current-bg)",
    color: "var(--current-text)"
}

const modal = {
    background: "var(--current-surface)",
    padding: 25,
    borderRadius: 12,
    width: 400,
    color: "var(--current-text)"
}

const btnPrimary = {
    padding: "10px 16px",
    background: "var(--current-accent)",
    color: "var(--current-button-text)",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    marginRight: 10
}

const btnEdit = {
    marginRight: 10,
    padding: "6px 12px",
    background: "var(--current-accent)",
    border: "none",
    borderRadius: 6,
    color: "var(--current-button-text)"
}

const btnDelete = {
    padding: "6px 12px",
    background: "var(--current-error)",
    color: "var(--current-button-text)",
    border: "none",
    borderRadius: 6
}

const btnCancel = {
    padding: "10px 16px",
    background: "var(--current-button-secondary)",
    color: "var(--current-button-text)",
    border: "none",
    borderRadius: 8
}

