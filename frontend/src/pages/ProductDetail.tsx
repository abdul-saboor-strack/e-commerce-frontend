import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/api";
import { useCart } from "../store/cartStore";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "../types/Product";

const statusLabels = {
    placed: "Placed",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
};

const ProductDetail = () => {
    const params = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentImage, setCurrentImage] = useState(0);
    const [qty, setQty] = useState(1);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    const images = useMemo(() => {
        if (!product) return ["https://images.unsplash.com/photo-1520975682031-a9ce0f55c35c?auto=format&fit=crop&w=1200&q=60"];
        const list = product.images?.length ? [...product.images] : [];
        if (product.image && list.length === 0) list.push(product.image);
        return list.length ? list : ["https://images.unsplash.com/photo-1520975682031-a9ce0f55c35c?auto=format&fit=crop&w=1200&q=60"];
    }, [product]);

    useEffect(() => {
        const id = params.id;
        if (!id) return;
        setLoading(true);
        API.get(`/products/${id}`)
            .then((res) => {
                setProduct(res.data);
                setCurrentImage(0);
            })
            .catch(() => setProduct(null))
            .finally(() => setLoading(false));
    }, [params.id]);

    const handleSwipeEnd = () => {
        if (touchStart === null || touchEnd === null) return;
        const delta = touchStart - touchEnd;
        if (Math.abs(delta) > 50) {
            if (delta > 0) {
                setCurrentImage((prev) => Math.min(prev + 1, images.length - 1));
            } else {
                setCurrentImage((prev) => Math.max(prev - 1, 0));
            }
        }
        setTouchStart(null);
        setTouchEnd(null);
    };

    const inStock = product ? Number(product.stock || 0) > 0 : false;

    const handleAddToCart = () => {
        if (!product) return;
        addToCart(product, qty);
    };

    if (loading) {
        return <div className="min-h-[70vh] p-8" style={{ color: 'var(--current-text)' }}>Loading product...</div>;
    }

    if (!product) {
        return (
            <div className="min-h-[70vh] p-8" style={{ color: 'var(--current-text)' }}>
                <button className="btn-ghost mb-4" onClick={() => navigate(-1)}>
                    <ArrowLeft size={18} /> Back
                </button>
                <div>Product not found.</div>
            </div>
        );
    }

    return (
        <div className="container-max py-10" style={{ color: 'var(--current-text)' }}>
            <button className="btn-ghost mb-6 inline-flex items-center gap-2" onClick={() => navigate(-1)}>
                <ArrowLeft size={18} /> Back to shop
            </button>

            <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
                <div className="rounded-[28px] p-4 shadow-soft" style={{ border: '1px solid var(--current-card-border)', background: 'var(--current-surface)' }}>
                    <div
                        className="relative overflow-hidden rounded-[28px] bg-black/10"
                        onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
                        onTouchMove={(e) => setTouchEnd(e.touches[0].clientX)}
                        onTouchEnd={handleSwipeEnd}
                    >
                        <img
                            src={images[currentImage]}
                            alt={product.name}
                            className="h-[520px] w-full object-cover transition duration-300"
                        />
                        {images.length > 1 && (
                            <>
                                <button
                                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full p-3 hover:bg-black/60"
                                    style={{ background: 'rgba(0, 0, 0, 0.4)', color: 'var(--current-text)' }}
                                    type="button"
                                    onClick={() => setCurrentImage((prev) => Math.max(prev - 1, 0))}
                                    aria-label="Previous image"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-3 hover:bg-black/60"
                                    style={{ background: 'rgba(0, 0, 0, 0.4)', color: 'var(--current-text)' }}
                                    type="button"
                                    onClick={() => setCurrentImage((prev) => Math.min(prev + 1, images.length - 1))}
                                    aria-label="Next image"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </>
                        )}
                    </div>

                    {images.length > 1 && (
                        <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-6">
                            {images.map((src, index) => (
                                <button
                                    key={index}
                                    className="overflow-hidden rounded-2xl border transition"
                                    style={{ borderColor: index === currentImage ? 'var(--current-text)' : 'var(--current-card-border)' }}
                                    type="button"
                                    onClick={() => setCurrentImage(index)}
                                >
                                    <img src={src} alt={`${product.name} ${index + 1}`} className="h-20 w-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="rounded-[28px] p-8 shadow-soft" style={{ border: '1px solid var(--current-card-border)', background: 'var(--current-surface)' }}>
                        <p className="text-sm uppercase tracking-[0.24em]" style={{ color: 'var(--current-text-secondary)' }}>{product.category || "Fashion"}</p>
                        <h1 className="mt-3 text-4xl font-semibold tracking-tight">{product.name}</h1>
                        <div className="mt-4 flex items-center gap-3">
                            <span className="text-3xl font-bold">Rs {product.price}</span>
                            <span className="rounded-full px-3 py-1 text-xs uppercase tracking-[0.24em]" style={{ backgroundColor: inStock ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: inStock ? 'var(--current-success)' : 'var(--current-error)' }}>
                                {inStock ? "In stock" : "Out of stock"}
                            </span>
                        </div>

                        <p className="mt-4 text-sm leading-7" style={{ color: 'var(--current-text-secondary)' }}>{product.description || "This product is designed to look premium on every screen with a comfortable fit and soft finish."}</p>

                        <div className="mt-6 grid gap-3 sm:grid-cols-[120px_1fr] sm:items-center">
                            <div className="flex items-center gap-3">
                                <label className="text-sm" style={{ color: 'var(--current-text-secondary)' }}>Qty</label>
                                <input
                                    type="number"
                                    min={1}
                                    value={qty}
                                    onChange={(e) => setQty(Math.max(1, Number(e.target.value || 1)))}
                                    className="input w-20"
                                />
                            </div>
                            <div className="flex gap-3 flex-wrap">
                                <button
                                    className="btn-primary"
                                    onClick={handleAddToCart}
                                    disabled={!inStock}
                                >
                                    Add to cart
                                </button>
                                <button
                                    className="btn-ghost"
                                    onClick={() => {
                                        if (product) {
                                            addToCart(product, qty);
                                        }
                                        navigate("/checkout");
                                    }}
                                    disabled={!inStock}
                                >
                                    Checkout now
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[28px] p-6 shadow-soft" style={{ border: '1px solid var(--current-card-border)', background: 'var(--current-surface)' }}>
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-sm uppercase tracking-[0.24em]" style={{ color: 'var(--current-text-secondary)' }}>Order tracking</p>
                            <span className="text-xs uppercase tracking-[0.24em]" style={{ color: 'var(--current-text-secondary)' }}>{statusLabels[(product.status || "placed") as keyof typeof statusLabels] || "Placed"}</span>
                        </div>
                        <div className="mt-4 space-y-3">
                            {Object.entries(statusLabels).map(([key, label]) => {
                                const idx = Object.keys(statusLabels).indexOf(key);
                                const current = Object.keys(statusLabels).indexOf(product.status || "placed");
                                return (
                                    <div key={key} className="flex items-center gap-3">
                                        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full border ${idx <= current ? "" : ""} text-xs font-semibold`} style={{ borderColor: 'var(--current-accent)', backgroundColor: idx <= current ? 'var(--current-accent)' : 'transparent', color: idx <= current ? 'white' : 'var(--current-text-secondary)' }}> {idx + 1} </span>
                                        <div>
                                            <div className="text-sm font-medium">{label}</div>
                                            {idx === current && <div className="text-xs" style={{ color: 'var(--current-text-secondary)' }}>Current status</div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-6 rounded-2xl p-4 text-sm" style={{ borderColor: 'var(--current-card-border)', backgroundColor: 'var(--current-surface)', color: 'var(--current-text-secondary)' }}>
                            <div><strong>Tracking ID</strong> {product.tracking_id || "Not assigned yet"}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
