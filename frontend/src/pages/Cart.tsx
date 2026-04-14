import { Link } from "react-router-dom"
import { Minus, Plus, Trash2 } from "lucide-react"
import { useCart } from "../store/cartStore"

const Cart = () => {
    const { cartItems, clearCart, removeFromCart, updateQuantity } = useCart()
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

    return (
        <div className="w-full">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-3xl font-semibold">Shopping Cart</h1>
                    <p className="mt-2 text-sm" style={{ color: 'var(--current-text-secondary)' }}>Clean cart controls with proper contrast on all devices.</p>
                </div>
                {cartItems.length > 0 && (
                    <button
                        className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition" style={{ borderColor: 'var(--current-card-border)', backgroundColor: 'var(--current-surface)', color: 'var(--current-text)' }}
                        onClick={clearCart}
                        type="button"
                    >
                        Clear cart
                    </button>
                )}
            </div>

            {cartItems.length === 0 ? (
                <div className="card p-10 text-center" style={{ color: 'var(--current-text-secondary)' }}>Your cart is empty.</div>
            ) : (
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="grid gap-4">
                        {cartItems.map(item => (
                            <div key={item.id} className="card p-4 sm:p-5">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="h-28 w-full rounded-2xl object-cover sm:w-28"
                                    />

                                    <div className="flex-1">
                                        <div className="text-xs uppercase tracking-[0.18em]" style={{ color: 'var(--current-text-secondary)' }}>{item.category || "Fashion"}</div>
                                        <h3 className="mt-1 text-lg font-semibold">{item.name}</h3>
                                        <p className="mt-2 text-sm" style={{ color: 'var(--current-text-secondary)' }}>Rs {item.price} each</p>

                                        <div className="mt-4 flex flex-wrap items-center gap-3">
                                            <div className="inline-flex items-center rounded-2xl p-1" style={{ border: '1px solid var(--current-input-border)', background: 'var(--current-input-bg)' }}>
                                                <button
                                                    className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-white/10"
                                                    style={{ color: 'var(--current-text)' }}
                                                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                    type="button"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="min-w-[48px] text-center text-sm font-semibold" style={{ color: 'var(--current-text)' }}>{item.quantity}</span>
                                                <button
                                                    className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-white/10"
                                                    style={{ color: 'var(--current-text)' }}
                                                    onClick={() => updateQuantity(item.id, Math.min(item.stock || item.quantity + 1, item.quantity + 1))}
                                                    type="button"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>

                                            <button
                                                className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition"
                                                style={{
                                                    border: '1px solid var(--current-input-border)',
                                                    background: 'var(--current-input-bg)',
                                                    color: 'var(--current-text)'
                                                }}
                                                onClick={() => removeFromCart(item.id)}
                                                type="button"
                                            >
                                                <Trash2 size={16} /> Remove
                                            </button>
                                        </div>
                                    </div>

                                    <div className="text-lg font-semibold sm:text-right" style={{ color: 'var(--current-text)' }}>
                                        Rs {item.price * item.quantity}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <aside className="card p-6 h-fit">
                        <div className="text-sm uppercase tracking-[0.24em]" style={{ color: 'var(--current-text-secondary)' }}>Order summary</div>
                        <div className="mt-6 flex items-center justify-between text-sm" style={{ color: 'var(--current-text-secondary)' }}>
                            <span>Items</span>
                            <span>{cartItems.length}</span>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-sm" style={{ color: 'var(--current-text-secondary)' }}>
                            <span>Estimated total</span>
                            <span>Rs {total}</span>
                        </div>
                        <div className="mt-6 border-t border-white/10 pt-6 flex items-center justify-between text-lg font-semibold">
                            <span>Total</span>
                            <span>Rs {total}</span>
                        </div>

                        <Link to="/checkout" className="mt-6 block">
                            <button className="btn-primary w-full py-3 text-base" type="button">Proceed to checkout</button>
                        </Link>
                    </aside>
                </div>
            )}
        </div>
    )
}

export default Cart
