import { useState, useEffect } from "react"
import { Product } from "../../types/Product"

interface Props {
    isOpen: boolean
    onClose: () => void
    onSave: (product: Product) => void
    editingProduct?: Product | null
}

export default function ProductModal({
    isOpen,
    onClose,
    onSave,
    editingProduct
}: Props) {

    const [form, setForm] = useState<Product>({
        id: 0,
        name: "",
        price: 0,
        stock: 0,
        quantity: 0,
        image: "",
        category: ""
    })

    useEffect(() => {
        if (editingProduct) setForm(editingProduct)
    }, [editingProduct])

    if (!isOpen) return null

    const handleSubmit = () => {
        onSave(form)
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-[var(--current-bg)] rounded-xl p-6 w-full max-w-md shadow-[var(--current-shadow)]">

                <h2 className="text-xl font-bold mb-4">
                    {editingProduct ? "Edit Product" : "Add Product"}
                </h2>

                <input
                    placeholder="Product Name"
                    className="w-full border p-2 mb-3"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                />

                <input
                    type="number"
                    placeholder="Price"
                    className="w-full border p-2 mb-3"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                />

                <input
                    type="number"
                    placeholder="Stock"
                    className="w-full border p-2 mb-3"
                    value={form.stock}
                    onChange={e => setForm({ ...form, stock: Number(e.target.value) })}
                />

                <input
                    placeholder="Image URL"
                    className="w-full border p-2 mb-3"
                    value={form.image}
                    onChange={e => setForm({ ...form, image: e.target.value })}
                />

                <input
                    placeholder="Category"
                    className="w-full border p-2 mb-4"
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                />

                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 border rounded">
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                    >
                        Save
                    </button>
                </div>

            </div>
        </div>
    )
}