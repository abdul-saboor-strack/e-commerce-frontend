import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import { useCart } from "../store/cartStore";

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart, updateQuantity, removeFromCart } = useCart();

  const total = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );

  const [country, setCountry] = useState("PK");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState(localStorage.getItem("customer_address") || "");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);

  const validatePhone = () => {
    const digits = phone.replace(/\D/g, "");
    if (country === "PK") return digits.length === 11; // Pakistan mobile format (simple check)
    return digits.length >= 7;
  };

  const placeOrder = async () => {
    setError("");
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("customer_name");
    const email = localStorage.getItem("customer_email");

    if (!cartItems.length) {
      setError("Cart is empty.");
      return;
    }
    if (!name || !email) {
      setError("Please login first.");
      navigate("/account");
      return;
    }
    if (!address.trim()) return setError("Please enter your delivery address.");
    if (!validatePhone()) return setError(country === "PK" ? "PK phone must be 11 digits." : "Enter a valid phone number.");

    try {
      setPlacing(true);
      await API.post(
        `/orders`,
        {
          customer_name: name,
          customer_email: email,
          items: cartItems,
          total,
          shipping_address: address,
          city,
          country,
          phone,
          notes,
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
      );
      clearCart();
      navigate("/my-orders");
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.response?.data?.message || "Order failed");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="container-max py-8">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-5">
          <h2 className="text-xl font-semibold">Checkout</h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--current-text-secondary)' }}>Review items and add delivery details.</p>

          <div className="mt-5 space-y-3">
            {cartItems.map((item) => (
              <div key={item.id} className="glass rounded-xl2 p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium truncate">{item.name}</div>
                  <div className="text-sm" style={{ color: 'var(--current-text-secondary)' }}>Rs {item.price}</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    className="input w-24"
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, Number(e.target.value || 1))}
                  />
                  <button className="btn-ghost px-3" onClick={() => removeFromCart(item.id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold">Delivery details</h3>
            <div className="mt-3 grid sm:grid-cols-2 gap-3">
              <select className="select" value={country} onChange={(e) => setCountry(e.target.value)}>
                <option value="PK">Pakistan</option>
                <option value="AE">UAE</option>
                <option value="SA">Saudi Arabia</option>
                <option value="US">USA</option>
                <option value="GB">UK</option>
                <option value="OTHER">Other</option>
              </select>
              <input
                className="input"
                placeholder={country === "PK" ? "Phone (11 digits)" : "Phone"}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <input className="input" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
              <input
                className="input"
                placeholder="Full address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <textarea
              className="mt-3 w-full rounded-xl2 p-3 text-sm focus:outline-none focus:ring-2"
              style={{
                background: 'var(--current-input-bg)',
                border: '1px solid var(--current-input-border)',
                color: 'var(--current-input-text)',
              }}
              placeholder="Order notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {error && <div className="mt-4 text-sm text-rose-300">{error}</div>}
        </div>

        <div className="card p-5 h-fit">
          <h3 className="text-lg font-semibold">Summary</h3>
          <div className="mt-4 flex items-center justify-between" style={{ color: 'var(--current-text-secondary)' }}>
            <span>Items</span>
            <span>{cartItems.length}</span>
          </div>
          <div className="mt-2 flex items-center justify-between font-bold text-xl">
            <span>Total</span>
            <span>Rs {total}</span>
          </div>
          <button className="btn-primary w-full mt-5" onClick={placeOrder} disabled={placing}>
            {placing ? "Placing…" : "Place order"}
          </button>
          <button className="btn-ghost w-full mt-3" onClick={() => navigate("/cart")}
          >
            Back to cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;