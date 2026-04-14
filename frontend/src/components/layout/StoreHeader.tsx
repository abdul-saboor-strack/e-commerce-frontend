import { useEffect, useMemo, useState, useRef } from "react";
import { Heart, Menu, Package, Search, ShoppingBag, User2, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSettings } from "../../hooks/useSettings";
import API from "../../api/api";

const navLinkBase =
  "inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition hover:bg-[color-mix(in_srgb,var(--current-accent)_10%,transparent_90%)] hover:text-[var(--current-text)]";

export default function StoreHeader({ cartItems = [], wishlist = [] }: { cartItems?: any[]; wishlist?: any[] }) {
  const navigate = useNavigate();
  const location = useLocation();
  const settings = useSettings();
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load all products for autocomplete
  useEffect(() => {
    API.get("/products")
      .then((res) => setAllProducts(res.data || []))
      .catch(() => setAllProducts([]));
  }, []);

  useEffect(() => {
    const q = new URLSearchParams(location.search).get("q") || "";
    setSearchTerm(q);
  }, [location.search]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Handle click outside suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) &&
        searchInputRef.current && !searchInputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showSuggestions]);

  const counts = useMemo(
    () => ({ cart: cartItems?.length || 0, wish: wishlist?.length || 0 }),
    [cartItems, wishlist]
  );

  // Get autocomplete suggestions
  const suggestions = useMemo(() => {
    if (!searchTerm.trim()) return [];

    const term = searchTerm.toLowerCase();
    const matches = allProducts
      .filter(p => p.name.toLowerCase().includes(term) || (p.category && p.category.toLowerCase().includes(term)))
      .slice(0, 6)
      .map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        image: p.image || p.images?.[0]
      }));

    // Add a "View all results" option if there are more matches
    const totalMatches = allProducts.filter(p => p.name.toLowerCase().includes(term) || (p.category && p.category.toLowerCase().includes(term))).length;
    if (totalMatches > 6) {
      matches.push({
        id: 'view-all',
        name: `View all ${totalMatches} results`,
        category: '',
        price: 0,
        image: ''
      });
    }

    return matches;
  }, [searchTerm, allProducts]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchTerm.trim();
    navigate(q ? `/?q=${encodeURIComponent(q)}` : "/");
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: any) => {
    if (suggestion.id === 'view-all') {
      submitSearch(new Event('submit') as any);
    } else {
      navigate(`/product/${suggestion.id}`);
      setShowSuggestions(false);
      setSearchTerm("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
          handleSuggestionClick(suggestions[selectedSuggestionIndex]);
        } else {
          submitSearch(e);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  return (
    <header className="sticky top-0 w-full z-50">
      <div className="border-b backdrop-blur-xl" style={{ backgroundColor: 'color-mix(in srgb, var(--current-header) 95%, transparent 5%)', borderColor: 'color-mix(in srgb, var(--current-text) 10%, transparent 90%)' }}>
        <div className="container-max py-2 flex items-center justify-between gap-3 text-[11px] sm:text-xs" style={{ color: 'var(--current-text-secondary)' }}>
          <span className="truncate">✨ {settings.announcement_text}</span>
          <span className="hidden md:inline">{settings.support_text}</span>
        </div>
      </div>

      <div className="backdrop-blur-xl border-b z-50" style={{ backgroundColor: 'color-mix(in srgb, var(--current-header) 90%, transparent 10%)', borderColor: 'color-mix(in srgb, var(--current-text) 10%, transparent 90%)' }}>
        <div className="container-max py-3 grid grid-cols-[auto_1fr_auto] items-center gap-3 lg:flex lg:min-h-16 lg:flex-nowrap lg:justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <button className="lg:hidden btn-ghost px-3" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu" type="button">
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>

            <Link to="/" className="flex items-center gap-2 min-w-0">
              <div className="h-9 w-9 shrink-0 rounded-xl bg-[var(--current-accent)] text-[var(--current-bg)] grid place-items-center font-bold shadow-[var(--current-shadow)]">
                {settings.store_name?.trim()?.[0]?.toUpperCase() || "S"}
              </div>
              <div className="leading-tight min-w-0 hidden xs:block">
                <div className="text-sm font-semibold tracking-wide truncate" style={{ color: 'var(--current-text)' }}>{settings.store_name}</div>
                <div className="text-[11px] truncate" style={{ color: 'var(--current-text-secondary)' }}>Premium fashion store</div>
              </div>
            </Link>
          </div>

          <form onSubmit={submitSearch} className="col-span-3 order-3 w-full md:col-span-2 md:order-none lg:mx-6 lg:max-w-2xl lg:flex-1 relative">
            <div className="glass w-full rounded-xl flex items-center gap-2 px-3 py-2">
              <Search size={16} className="shrink-0" style={{ color: 'var(--current-text-secondary)' }} />
              <input
                ref={searchInputRef}
                className="bg-transparent w-full text-sm focus:outline-none"
                style={{ color: 'var(--current-text)' }}
                placeholder="Search products, categories..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                  setSelectedSuggestionIndex(-1);
                }}
                onFocus={() => searchTerm && setShowSuggestions(true)}
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* AUTOCOMPLETE SUGGESTIONS */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 mt-2 rounded-xl shadow-xl overflow-hidden z-40"
                style={{ background: 'var(--current-surface)', border: '1px solid var(--current-card-border)' }}
              >
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition ${suggestion.id === 'view-all' ? '' : ''}`}
                    style={{
                      background: index === selectedSuggestionIndex ? 'color-mix(in srgb, var(--current-accent) 10%, transparent 90%)' : 'transparent',
                      borderTop: suggestion.id === 'view-all' ? '1px solid var(--current-card-border)' : 'none'
                    }}
                  >
                    {suggestion.image && suggestion.id !== 'view-all' && (
                      <img
                        src={suggestion.image}
                        alt={suggestion.name}
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="text-left flex-1 min-w-0">
                      <div className="text-sm font-medium truncate" style={{ color: 'var(--current-text)' }}>{suggestion.name}</div>
                      {suggestion.id !== 'view-all' && (
                        <div className="text-xs flex items-center justify-between" style={{ color: 'var(--current-text-secondary)' }}>
                          <span>{suggestion.category}</span>
                          <span className="font-semibold" style={{ color: 'var(--current-text)' }}>Rs {suggestion.price}</span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </form>

          <div className="flex items-center justify-end gap-2 shrink-0">
            <nav className="hidden lg:flex items-center gap-1">
              <Link className={navLinkBase} to="/">Home</Link>
              <Link className={navLinkBase} to="/my-orders">My Orders</Link>
              <Link className={navLinkBase} to="/account">Account</Link>
            </nav>

            <Link to="/wishlist" className="btn-ghost px-3 gap-2" aria-label="Wishlist">
              <Heart size={16} />
              <span className="hidden sm:inline">Wishlist</span>
              <span className="ml-1 text-xs" style={{ color: 'var(--current-text-secondary)' }}>({counts.wish})</span>
            </Link>

            <Link to="/cart" className="btn-primary gap-2 px-3 sm:px-4" aria-label="Cart">
              <ShoppingBag size={16} />
              <span className="hidden sm:inline">Cart</span>
              <span className="ml-1 text-xs">({counts.cart})</span>
            </Link>
          </div>
        </div>

        {open && (
          <div className="lg:hidden border-t" style={{ borderColor: 'var(--current-card-border)', backgroundColor: 'var(--current-bg)', opacity: 0.95 }}>
            <div className="container-max py-4 grid gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Link to="/" className="btn-ghost gap-2">Home</Link>
                <Link to="/my-orders" className="btn-ghost gap-2"><Package size={16} /> My Orders</Link>
                <Link to="/account" className="btn-ghost gap-2 sm:col-span-2"><User2 size={16} /> Account</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
