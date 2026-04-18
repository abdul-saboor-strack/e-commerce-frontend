import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";
import { Product } from "../../types/Product";
import { FALLBACK_IMAGE, resolveImageSrc } from "../../utils/productImage";

type Review = {
  id: number;
  name?: string;
  rating: number;
  comment: string;
  createdAt: string;
};

type Props = {
  product: Product;
  onClose: () => void;
  onAddToCart: (p: Product, qty?: number) => void;
};

export default function QuickViewModal({ product, onClose, onAddToCart }: Props) {
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [msg, setMsg] = useState<string>("");

  const images = useMemo(() => {
    const imgArray = [];
    if (product?.images && product.images.length > 0) {
      imgArray.push(...product.images.map((img) => resolveImageSrc(img)));
    } else if (product?.imageUrl) {
      imgArray.push(resolveImageSrc(product.imageUrl));
    } else if (product?.image) {
      imgArray.push(resolveImageSrc(product.image));
    } else {
      imgArray.push(FALLBACK_IMAGE);
    }
    return imgArray;
  }, [product]);

  const imageSrc = images[currentImageIndex];

  const inStock = Number((product as any)?.stock ?? 9999) > 0 && (product as any)?.status !== "out_of_stock";

  useEffect(() => {
    setQty(1);
    setCurrentImageIndex(0); // Reset to first image when product changes
    setMsg("");
    // Load reviews (non-breaking if endpoint not configured)
    API.get(`/reviews`, { params: { product_id: product.id } })
      .then((res) => setReviews(res.data || []))
      .catch(() => setReviews([]));
  }, [product.id]);

  const buyNow = () => {
    onAddToCart(product, qty);
    onClose();
    navigate("/checkout");
  };

  const submitReview = async () => {
    setMsg("");
    const token = localStorage.getItem("token");
    if (!token) {
      setMsg("Please login to leave a review.");
      navigate("/account");
      return;
    }
    if (!comment.trim()) {
      setMsg("Write a short comment first.");
      return;
    }
    try {
      await API.post(
        "/reviews",
        { product_id: product.id, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComment("");
      const res = await API.get(`/reviews`, { params: { product_id: product.id } });
      setReviews(res.data || []);
      setMsg("Thanks! Your review was posted.");
    } catch (e: any) {
      setMsg(e?.response?.data?.message || "Failed to post review");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onMouseDown={onClose}>
      <div
        className="w-full max-w-4xl rounded-2xl border border-white/10 shadow-soft overflow-hidden"
        style={{ backgroundColor: 'var(--current-bg)' }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--current-input-border)' }}>
          <div className="text-sm" style={{ color: 'var(--current-text-secondary)' }}>Quick View</div>
          <button className="btn-ghost px-3" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-0">
          <div className="bg-black/20 relative p-4 md:p-6">
            <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-[var(--current-input-bg)] p-3">
              <img src={imageSrc} alt={product.name} className="h-full w-full object-contain" />
            </div>
            {images.length > 1 && (
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-colors border-2 border-white/50 ${index === currentImageIndex ? 'bg-white' : 'bg-transparent'
                      }`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="p-5">
            <div className="text-xs" style={{ color: 'var(--current-text-secondary)' }}>{product?.category || "Fashion"}</div>
            <h2 className="mt-1 text-2xl font-semibold leading-tight">{product.name}</h2>
            <div className="mt-2 flex items-center justify-between">
              <div className="text-xl font-bold">Rs {product.price}</div>
              <div className={`text-xs ${inStock ? "text-emerald-400" : "text-rose-400"}`}>
                {inStock ? "In stock" : "Sold out"}
              </div>
            </div>

            <p className="mt-3 text-sm" style={{ color: 'var(--current-text-secondary)' }}>
              {(product as any)?.description || "Premium quality product with modern fit and comfort."}
            </p>

            {/* Quantity */}
            <div className="mt-4 flex items-center gap-3">
              <div className="text-sm" style={{ color: 'var(--current-text-secondary)' }}>Qty</div>
              <input
                className="input max-w-[120px]"
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value || 1)))}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                className="btn-primary"
                onClick={buyNow}
                disabled={!inStock}
              >
                Buy now
              </button>
              <button
                className="btn-ghost"
                onClick={() => onAddToCart(product, qty)}
                disabled={!inStock}
              >
                Add to cart
              </button>
            </div>

            {/* Reviews */}
            <div className="mt-6">
              <div className="text-sm font-semibold">Reviews</div>
              <div className="mt-2 space-y-3 max-h-40 overflow-auto pr-1">
                {reviews.length === 0 && <div className="text-sm" style={{ color: 'var(--current-text-secondary)' }}>No reviews yet.</div>}
                {reviews.map((r) => (
                  <div key={r.id} className="glass rounded-xl2 p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">{r.name || "Customer"}</div>
                      <div className="text-xs" style={{ color: 'var(--current-text-secondary)' }}>⭐ {r.rating}/5</div>
                    </div>
                    <div className="mt-1 text-sm" style={{ color: 'var(--current-text-secondary)' }}>{r.comment}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 glass rounded-xl2 p-3">
                <div className="text-sm font-medium">Leave a review</div>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <select className="select" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                    {[5, 4, 3, 2, 1].map((v) => (
                      <option key={v} value={v}>
                        {v} Star{v > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                  <button className="btn-primary" onClick={submitReview}>
                    Submit
                  </button>
                </div>
                <textarea
                  className="mt-3 w-full rounded-xl2 p-3 text-sm focus:outline-none focus:ring-2"
                  style={{
                    background: 'var(--current-input-bg)',
                    border: '1px solid var(--current-input-border)',
                    color: 'var(--current-input-text)',
                  }}
                  placeholder="Share your feedback..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                />
                {msg && <div className="mt-2 text-xs" style={{ color: 'var(--current-text-secondary)' }}>{msg}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
