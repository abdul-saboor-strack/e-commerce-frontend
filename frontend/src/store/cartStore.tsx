import { createContext, useContext, useState, ReactNode } from "react"
import { Product } from "../types/Product"

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

    const addToCart = (product: Product, qty: number = 1) => {
        setCartItems(prev => {
            const existing = prev.find(p => p.id === product.id)
            if (existing) {
                return prev.map(p =>
                    p.id === product.id
                        ? { ...p, quantity: Math.min(p.quantity + Math.max(1, Number(qty || 1)), p.stock) }
                        : p
                )
            }
            const safeQty = Math.max(1, Number(qty || 1))
            return [...prev, { ...product, quantity: Math.min(safeQty, product.stock || safeQty) }]
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
        setWishlist(prev =>
            prev.find(p => p.id === product.id) ? prev : [...prev, product]
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