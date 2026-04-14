// Minimal server-side cart implementation (kept to preserve existing API routes).
// The frontend in this project uses localStorage/state for cart; however, these
// endpoints are useful for future expansion and must not crash.

const carts = new Map(); // userId -> [{ productId, quantity }]

export const getCart = async (req, res) => {
  const { userId } = req.params;
  res.json(carts.get(String(userId)) || []);
};

export const addToCart = async (req, res) => {
  const { userId } = req.params;
  const { productId, quantity = 1 } = req.body;
  if (!productId) return res.status(400).json({ message: "productId required" });

  const key = String(userId);
  const cart = carts.get(key) || [];
  const existing = cart.find((i) => i.productId === productId);
  if (existing) existing.quantity += Number(quantity) || 1;
  else cart.push({ productId, quantity: Number(quantity) || 1 });
  carts.set(key, cart);

  res.json({ success: true, cart });
};

export const removeFromCart = async (req, res) => {
  const { userId, productId } = req.params;
  const key = String(userId);
  const cart = carts.get(key) || [];
  carts.set(
    key,
    cart.filter((i) => String(i.productId) !== String(productId))
  );
  res.json({ success: true, cart: carts.get(key) });
};
