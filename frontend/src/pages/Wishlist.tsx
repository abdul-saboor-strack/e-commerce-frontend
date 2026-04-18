import React from "react";
import { useCart } from "../store/cartStore";
import { Trash2, ShoppingBag, HeartOff } from "lucide-react";
import { getProductImage } from "../utils/productImage";

const WishlistPage = () => {
    const { wishlist, addToCart, removeFromWishlist } = useCart();

    return (
        <div style={page}>
            <h1 style={title}>❤️ My Wishlist</h1>

            {wishlist.length === 0 ? (
                <div style={emptyBox}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>💔</div>
                    <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Your wishlist is empty</h3>
                    <p style={{ color: "var(--current-text-secondary)" }}>Save products you love and they'll appear here</p>
                </div>
            ) : (
                <div style={grid}>
                    {wishlist.map(item => (
                        <div key={item.id} style={card}>
                            <img src={getProductImage(item)} alt={item.name} style={image} />

                            <div style={info}>
                                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{item.name}</h3>
                                {item.category && (
                                    <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--current-text-secondary)" }}>
                                        {item.category}
                                    </span>
                                )}
                                <p style={price}>Rs {item.price}</p>

                                <div style={buttonRow}>
                                    <button
                                        style={btnPrimary}
                                        onClick={() => addToCart(item)}
                                    >
                                        <ShoppingBag size={14} style={{ marginRight: 6 }} />
                                        Add to Cart
                                    </button>

                                    <button
                                        style={btnRemove}
                                        onClick={() => removeFromWishlist(item.id)}
                                        title="Remove from wishlist"
                                    >
                                        <Trash2 size={14} style={{ marginRight: 6 }} />
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WishlistPage;

/* ===== STYLES ===== */

const page: React.CSSProperties = {
    maxWidth: 1100,
    margin: "0 auto"
};

const title: React.CSSProperties = {
    fontSize: 30,
    fontWeight: 700,
    marginBottom: 25
};

const emptyBox: React.CSSProperties = {
    background: "var(--current-card-bg)",
    padding: 50,
    borderRadius: 18,
    textAlign: "center" as const,
    border: "1px solid var(--current-card-border)",
    color: "var(--current-text)"
};

const grid: React.CSSProperties = {
    display: "grid",
    gap: 16
};

const card: React.CSSProperties = {
    display: "flex",
    gap: 20,
    background: "var(--current-card-bg)",
    border: "1px solid var(--current-card-border)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    color: "var(--current-text)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease"
};

const image: React.CSSProperties = {
    width: 110,
    height: 110,
    objectFit: "contain",
    objectPosition: "center",
    borderRadius: 12,
    padding: 8,
    background: "var(--current-input-bg)"
};

const info: React.CSSProperties = {
    flex: 1
};

const price: React.CSSProperties = {
    color: "var(--current-accent)",
    marginTop: 6,
    fontSize: 18,
    fontWeight: 700
};

const buttonRow: React.CSSProperties = {
    display: "flex",
    gap: 10,
    marginTop: 12,
    flexWrap: "wrap"
};

const btnPrimary: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    background: "var(--current-button-primary)",
    border: "none",
    padding: "10px 18px",
    borderRadius: 12,
    color: "var(--current-button-text, #fff)",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
    transition: "opacity 0.2s ease"
};

const btnRemove: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    background: "rgba(239, 68, 68, 0.15)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    padding: "10px 18px",
    borderRadius: 12,
    color: "#ef4444",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
    transition: "all 0.2s ease"
};
