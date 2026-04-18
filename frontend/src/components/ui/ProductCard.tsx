import React, { useMemo, useState } from "react";
import { Eye, Heart, ShoppingBag } from "lucide-react";
import { Product } from "../../types/Product";
import { Link } from "react-router-dom";
import { FALLBACK_IMAGE, resolveImageSrc } from "../../utils/productImage";

interface Props {
  product: Product;
  onAddToCart: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  isInWishlist?: boolean;
}

const ProductCard: React.FC<Props> = ({ product, onAddToCart, onBuyNow, onQuickView, onAddToWishlist, isInWishlist }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>, action: () => void) => {
    event.preventDefault();
    event.stopPropagation();
    action();
  };

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

  const currentImage = images[currentImageIndex];

  return (
    <Link to={`/product/${product.id}`} className="block">
      <div className="card group flex h-full w-full flex-col overflow-hidden transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_25px_50px_rgba(0,0,0,0.22)]">
        <div className="relative">
          <div className="aspect-[4/5] overflow-hidden bg-[var(--current-input-bg)] p-3">
            <img
              src={currentImage}
              alt={product?.name}
              className={`h-full w-full object-contain transition-all duration-500 ease-out ${product.stock > 0 ? '' : 'opacity-60'}`}
              loading="lazy"
            />

            {/* SOLD OUT OVERLAY */}
            {product.stock <= 0 && (
              <div className="absolute inset-0 bg-[var(--current-bg)]/40 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-sm font-black text-[var(--current-text)] uppercase tracking-widest">Sold Out</div>
                  <div className="text-xs text-[var(--current-text-secondary)] mt-1">Check back soon</div>
                </div>
              </div>
            )}
          </div>

          {images.length > 1 && product.stock > 0 && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${index === currentImageIndex ? 'bg-[var(--current-text)]' : 'bg-[var(--current-text-secondary)]/40'
                    }`}
                />
              ))}
            </div>
          )}

          <div className="absolute top-3 left-3 flex gap-2">
            <span className="glass rounded-full px-3 py-1 text-[11px] text-[var(--current-text-secondary)] bg-[var(--current-surface)]/70">Premium</span>
            {product.stock <= 0 && (
              <span className="glass rounded-full px-3 py-1 text-[11px] text-red-300 bg-red-500/20">Sold Out</span>
            )}
          </div>

          <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-100 translate-y-0 md:opacity-0 md:translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition">
            <button
              onClick={(e) => handleButtonClick(e, () => onQuickView(product))}
              className="btn-ghost flex-1 gap-2"
              type="button"
            >
              <Eye size={16} /> Quick view
            </button>

            {onAddToWishlist && (
              <button
                onClick={(e) => handleButtonClick(e, () => onAddToWishlist(product))}
                className="btn-ghost px-3 transition-colors"
                title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                type="button"
                style={{ color: isInWishlist ? "#ef4444" : undefined }}
              >
                <Heart size={16} fill={isInWishlist ? "currentColor" : "none"} />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <div className="inline-flex items-center rounded-full bg-[var(--current-surface)]/10 px-3 py-1 text-sm text-[var(--current-text-secondary)]">{product?.category || "Fashion"}</div>
          <h3 className="mt-3 min-h-[3.5rem] text-base font-semibold leading-snug line-clamp-2">{product.name}</h3>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div>
              <div className={`text-lg font-bold ${product.stock <= 0 ? 'text-[var(--current-text-secondary)]' : 'text-[var(--current-text)]'}`}>Rs {product.price}</div>
              <div className={`text-xs ${product.stock > 0 ? 'text-[var(--current-text-secondary)]' : 'text-red-400/80 font-medium'}`}>
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </div>
            </div>
            <div className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em] font-semibold ${product.stock > 0
              ? 'bg-[var(--current-surface)]/10 text-[var(--current-text-secondary)]'
              : 'bg-red-500/20 text-red-300'
              }`}>
              {product.stock > 0 ? "Ready" : "Sold out"}
            </div>
          </div>

          <div className="grid gap-3 mt-5 sm:grid-cols-[1fr_auto]">
            <button
              className={`btn-primary w-full gap-2 ${product.stock <= 0 ? 'opacity-50 cursor-not-allowed bg-[var(--current-bg)]/10 text-[var(--current-text-secondary)]' : ''}`}
              onClick={(e) => handleButtonClick(e, () => onAddToCart(product))}
              type="button"
              disabled={product.stock <= 0}
            >
              <ShoppingBag size={16} /> {product.stock > 0 ? 'Add to cart' : 'Unavailable'}
            </button>
            <button
              className={`btn-ghost w-full sm:w-auto ${product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={(e) => handleButtonClick(e, () => (onBuyNow ? onBuyNow(product) : onAddToCart(product)))}
              type="button"
              disabled={product.stock <= 0}
            >
              Buy now
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
