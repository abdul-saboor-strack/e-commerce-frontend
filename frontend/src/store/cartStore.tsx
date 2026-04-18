import { createContext, useContext, useState, ReactNode } from "react"
import { Product } from "../types/Product"
import { getProductImage } from "../utils/productImage"

interface StoreState {
    cartItems: Product[]
    wishlist: Product[]

    addToCart: (product: Product, qty?: number) => void
    removeFromCart: (id: number) => void
    updateQuantity: (id: number, quantity: number) => void
    clearCart: () => void
    addToWishlist: (product: Product) => void
    removeFromWishlist: (id: number) => void
}

const CartContext = createContext < StoreState | null > (null)

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartItems, setCartItems] = useState < Product[] > ([])
    const [wishlist, setWishlist] = useState < Product[] > ([])

    const normalizeProductForStore = (product: Product): Product => {
        const resolvedImage = getProductImage(product as Product & { imageUrl?: string })
        const images = product.images?.length ? [...product.images] : [resolvedImage]
        return {
            ...product,
            image: resolvedImage,
            images,
        }
    }

    const addToCart = (product: Product, qty: number = 1) => {
        const normalizedProduct = normalizeProductForStore(product)
        setCartItems(prev => {
            const existing = prev.find(p => p.id === normalizedProduct.id)
            if (existing) {
                return prev.map(p =>
                    p.id === normalizedProduct.id
                        ? { ...p, quantity: Math.min(p.quantity + Math.max(1, Number(qty || 1)), p.stock) }
                        : p
                )
            }
            const safeQty = Math.max(1, Number(qty || 1))
            return [...prev, { ...normalizedProduct, quantity: Math.min(safeQty, normalizedProduct.stock || safeQty) }]
        })
    }

    const removeFromCart = (id: number) => {
        setCartItems(prev => prev.filter(p => p.id !== id))
    }

    const updateQuantity = (id: number, quantity: number) => {
        setCartItems(prev =>
            prev.map(p =>
                p.id === id ? { ...p, quantity: Math.min(quantity, p.stock) } : p
            )
        )
    }

    const clearCart = () => setCartItems([])

    const addToWishlist = (product: Product) => {
        const normalizedProduct = normalizeProductForStore(product)
        setWishlist(prev =>
            prev.find(p => p.id === normalizedProduct.id) ? prev : [...prev, normalizedProduct]
        )
    }

    const removeFromWishlist = (id: number) => {
        setWishlist(prev => prev.filter(p => p.id !== id))
    }

    return (
        <CartContext.Provider
            value={{
                cartItems,
                wishlist,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                addToWishlist,
                removeFromWishlist
            }}
        >
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (!context) throw new Error("useCart must be used inside CartProvider")
    return context
}
