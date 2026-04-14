import { useState, useEffect } from "react";
import ProductCard from "../components/ui/ProductCard";
import { Product } from "../types/Product";
import API from "../api/api";
import { useCart } from "../store/cartStore";
import { ArrowRight, Sparkles, Truck, RotateCcw, Lock, Phone, Zap } from "lucide-react";
import QuickViewModal from "../components/ui/QuickViewModal";
import { useLocation, useNavigate } from "react-router-dom";
import { useSettings } from "../hooks/useSettings";

const Home = () => {
  const { addToCart, addToWishlist, removeFromWishlist, cartItems, wishlist } = useCart();
  const settings = useSettings();
  const navigate = useNavigate();

  const handleBuyNow = (product: Product) => {
    addToCart(product, 1);
    navigate("/checkout");
  };

  const handleWishlistToggle = (product: Product) => {
    if (wishlist.some(w => w.id === product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [quick, setQuick] = useState<Product | null>(null);
  const location = useLocation();

  useEffect(() => {
    const q = new URLSearchParams(location.search).get("q") || "";
    setSearch(q);
  }, [location.search]);

  useEffect(() => {
    API
      .get("/products")
      .then((res) => setProducts(res.data || []))
      .catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    API
      .get("/categories")
      .then((res) => setCategories(res.data || []))
      .catch(() => setCategories([]));
  }, []);

  let filtered = products.filter((p) => selectedCategory === "All" || p.category === selectedCategory);
  filtered = filtered.filter(
    (p) => selectedSubcategory === "All" || (p as any).subcategory === selectedSubcategory
  );
  filtered = filtered.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const min = minPrice ? Number(minPrice) : null;
  const max = maxPrice ? Number(maxPrice) : null;
  filtered = filtered.filter((p) => {
    const priceVal = Number(p.price || 0);
    if (min !== null && priceVal < min) return false;
    if (max !== null && priceVal > max) return false;
    return true;
  });

  if (sort === "price_low") filtered.sort((a, b) => a.price - b.price);
  if (sort === "price_high") filtered.sort((a, b) => b.price - a.price);

  return (
    <>
      {quick && (
        <QuickViewModal
          product={quick}
          onClose={() => setQuick(null)}
          onAddToCart={(p, qty) => addToCart(p, qty)}
        />
      )}

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-0 top-24 h-80 w-80 rounded-full" style={{ background: 'color-mix(in srgb, var(--current-accent) 10%, transparent 90%)' }} />
        <div className="pointer-events-none absolute right-0 top-28 h-72 w-72 rounded-full" style={{ background: 'color-mix(in srgb, var(--current-primary) 10%, transparent 90%)' }} />
        <div className="container-max py-8 relative z-10">
          {/* ANNOUNCEMENT BAR */}
          {settings.announcement_text && (
            <div className="mb-8 rounded-3xl border px-6 py-4 text-sm sm:px-8" style={{ borderColor: 'color-mix(in srgb, var(--current-text) 10%, transparent 90%)', background: 'color-mix(in srgb, var(--current-text) 5%, transparent 95%)', color: 'var(--current-text-secondary)' }}>
              {settings.announcement_text}
            </div>
          )}

          {/* HERO SECTION */}
          <section className="relative overflow-hidden rounded-[28px] mb-16" style={{ border: '1px solid color-mix(in srgb, var(--current-text) 10%, transparent 90%)' }}>
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--current-accent) 20%, transparent 80%) 0%, color-mix(in srgb, var(--current-primary) 10%, transparent 90%) 100%)' }} />
            <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full blur-3xl" style={{ background: 'color-mix(in srgb, var(--current-accent) 10%, transparent 90%)' }} />
            <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full blur-3xl" style={{ background: 'color-mix(in srgb, var(--current-primary) 10%, transparent 90%)' }} />

            <div className="relative grid gap-8 px-5 py-12 sm:px-8 lg:grid-cols-2 lg:px-12 lg:py-16 items-center">
              <div className="space-y-6 animate-fade-in-up">
                <div className="inline-block">
                  <span className="glass px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 w-fit" style={{ background: 'color-mix(in srgb, var(--current-text) 5%, transparent 95%)', border: '1px solid color-mix(in srgb, var(--current-text) 10%, transparent 90%)', color: 'var(--current-accent)' }}>
                    <Sparkles size={16} /> {settings.store_name || "Premium Fashion Collection"}
                  </span>
                </div>

                <div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4" style={{ color: 'var(--current-text)' }}>
                    {settings.hero_title || "Elevate Your Style Game"}
                  </h1>
                  <p className="text-lg leading-relaxed max-w-xl" style={{ color: 'var(--current-text-secondary)' }}>
                    {settings.hero_subtitle || "Discover our curated collection of premium fashion pieces designed to make you stand out. From timeless classics to trending styles, find everything you need to express yourself."}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <a href="/#featured-products" className="btn-primary gap-2 w-fit">
                    Shop Now <ArrowRight size={18} />
                  </a>
                  <a href="/" className="btn-ghost gap-2 w-fit" style={{ color: 'var(--current-text)', borderColor: 'color-mix(in srgb, var(--current-text) 10%, transparent 90%)' }}>
                    Explore Collections
                  </a>
                </div>

                <div className="flex gap-6 pt-8 text-sm" style={{ color: 'var(--current-text-secondary)' }}>
                  <div className="flex gap-2 items-center">
                    <Zap size={18} style={{ color: 'var(--current-accent)' }} />
                    <span>{settings.support_text || "Support 24/7"}</span>
                  </div>
                </div>
              </div>

              <div className="relative h-96 hidden lg:block animate-float">
                <div className="absolute inset-0 rounded-[24px] overflow-hidden">
                  <img
                    src="/hero-bg.svg"
                    alt="Fashion Collection"
                    className="h-full w-full object-cover rounded-[24px] shadow-soft"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* COLLECTION HIGHLIGHTS */}
          <section className="mt-16">
            <h2 className="text-2xl font-semibold sm:text-3xl mb-8" style={{ color: 'var(--current-text)' }}>Shop by Collection</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.slice(0, 3).map((cat: any, idx: number) => (
                <div
                  key={cat.id}
                  className="group relative overflow-hidden rounded-2xl cursor-pointer transition"
                  style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--current-surface) 80%, transparent 20%) 0%, color-mix(in srgb, var(--current-surface) 20%, transparent 80%) 100%)', border: '1px solid color-mix(in srgb, var(--current-text) 10%, transparent 90%)' }}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setSelectedSubcategory("All");
                    document.getElementById("featured-products")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition" style={{ background: 'linear-gradient(90deg, color-mix(in srgb, var(--current-accent) 20%, transparent 80%) 0%, transparent 100%)' }} />
                  <div className="relative p-6">
                    <div className="text-4xl font-bold mb-2 transition group-hover:text-white/40" style={{ color: 'color-mix(in srgb, var(--current-text) 20%, transparent 80%)' }}>
                      {cat.subcategories?.length || 0}
                    </div>
                    <h3 className="text-xl font-semibold mb-1" style={{ color: 'var(--current-text)' }}>{cat.name}</h3>
                    <p className="text-sm" style={{ color: 'var(--current-text-secondary)' }}>
                      {cat.subcategories?.length || 0} styles available
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-sm opacity-0 group-hover:opacity-100 transition" style={{ color: 'var(--current-accent)' }}>
                      Explore <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FEATURED PRODUCTS */}
          <section id="featured-products" className="mt-20">
            <div className="mb-12 max-w-3xl">
              <p className="text-sm uppercase tracking-[0.35em] mb-2" style={{ color: 'var(--current-text-secondary)' }}>Explore</p>
              <h2 className="text-3xl font-bold sm:text-4xl" style={{ color: 'var(--current-text)' }}>Products</h2>
            </div>

            {/* FILTERS */}
            <div className="mb-12 card glass border p-6 sm:p-8 rounded-2xl" style={{ borderColor: 'color-mix(in srgb, var(--current-text) 10%, transparent 90%)', background: 'var(--current-card-bg)' }}>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--current-text-secondary)' }}>Search</label>
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--current-text-secondary)' }}>Sort by</label>
                  <select className="select w-full" value={sort} onChange={(e) => setSort(e.target.value)}>
                    <option value="latest">Latest</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--current-text-secondary)' }}>Category</label>
                  <select
                    className="select w-full"
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setSelectedSubcategory("All");
                    }}
                  >
                    <option value="All">All Categories</option>
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--current-text-secondary)' }}>Collection</label>
                  <select
                    className="select w-full"
                    value={selectedSubcategory}
                    onChange={(e) => setSelectedSubcategory(e.target.value)}
                    disabled={selectedCategory === "All"}
                  >
                    <option value="All">All Collections</option>
                    {(categories.find((c: any) => c.name === selectedCategory)?.subcategories || []).map((sc: any) => (
                      <option key={sc.id} value={sc.name}>
                        {sc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--current-text-secondary)' }}>Min Price</label>
                  <input
                    className="input w-full"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    inputMode="numeric"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--current-text-secondary)' }}>Max Price</label>
                  <input
                    className="input w-full"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    inputMode="numeric"
                  />
                </div>
              </div>
            </div>

            {/* PRODUCTS GRID */}
            {filtered.length > 0 ? (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={addToCart}
                    onBuyNow={handleBuyNow}
                    onQuickView={(product) => setQuick(product)}
                    onAddToWishlist={handleWishlistToggle}
                    isInWishlist={wishlist.some(w => w.id === product.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-10 card p-12 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="mb-6" style={{ color: 'var(--current-text-secondary)' }}>Try adjusting your filters or search terms</p>
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setSelectedSubcategory("All");
                    setMinPrice("");
                    setMaxPrice("");
                  }}
                  className="btn-primary"
                >
                  Clear filters
                </button>
              </div>
            )}
          </section>

          <section className="mt-20 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card glass p-6 rounded-3xl text-center hover:scale-105 transition-transform duration-300" style={{ border: '1px solid var(--current-input-border)' }}>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl animate-pulse-soft" style={{ background: 'color-mix(in srgb, var(--current-accent) 20%, transparent 80%)' }}>
                <Truck size={24} style={{ color: 'var(--current-accent)' }} />
              </div>
              <h3 className="font-semibold mb-2">Fast Shipping</h3>
              <p className="text-sm" style={{ color: 'var(--current-text-secondary)' }}>{settings.delivery_text || "Delivered to your door in 3-5 business days"}</p>
            </div>

            <div className="card glass p-6 rounded-3xl text-center hover:scale-105 transition-transform duration-300" style={{ border: '1px solid var(--current-input-border)' }}>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl animate-pulse-soft" style={{ background: 'color-mix(in srgb, var(--current-accent) 20%, transparent 80%)' }}>
                <RotateCcw size={24} style={{ color: 'var(--current-accent)' }} />
              </div>
              <h3 className="font-semibold mb-2">Easy Returns</h3>
              <p className="text-sm" style={{ color: 'var(--current-text-secondary)' }}>{settings.returns_text || "30-day return policy with no questions asked"}</p>
            </div>

            <div className="card glass p-6 rounded-3xl text-center hover:scale-105 transition-transform duration-300" style={{ border: '1px solid var(--current-input-border)' }}>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl animate-pulse-soft" style={{ background: 'color-mix(in srgb, var(--current-surface) 50%, transparent 50%)' }}>
                <Lock size={24} style={{ color: 'var(--current-text)' }} />
              </div>
              <h3 className="font-semibold mb-2">100% Secure</h3>
              <p className="text-sm" style={{ color: 'var(--current-text-secondary)' }}>{settings.payments_text || "Your payment data is fully encrypted and protected"}</p>
            </div>

            <div className="card glass p-6 rounded-3xl text-center hover:scale-105 transition-transform duration-300" style={{ border: '1px solid var(--current-input-border)' }}>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl animate-pulse-soft" style={{ background: 'color-mix(in srgb, var(--current-accent) 15%, transparent 85%)' }}>
                <Phone size={24} style={{ color: 'var(--current-accent)' }} />
              </div>
              <h3 className="font-semibold mb-2">24/7 Support</h3>
              <p className="text-sm" style={{ color: 'var(--current-text-secondary)' }}>{settings.support_text || "Our customer service team is always here to help"}</p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default Home;
