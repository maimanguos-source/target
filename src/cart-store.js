const CART_KEY_PREFIX = 'targetsticker_cart_';

function getCartKey(userId) {
  if (!userId) throw new Error('Inicia sesión para acceder a tu cesta.');
  return `${CART_KEY_PREFIX}${encodeURIComponent(userId)}`;
}

export function getCart(userId) {
  const stored = localStorage.getItem(getCartKey(userId));
  if (!stored) return [];

  const cart = JSON.parse(stored);
  if (!Array.isArray(cart) || cart.some((item) => (
    typeof item.productId !== 'string'
    || !Number.isInteger(item.quantity)
    || item.quantity < 1
  ))) {
    throw new Error('No se pudo leer la cesta guardada. Prueba a vaciarla y empezar de nuevo.');
  }
  return cart;
}

function saveCart(userId, cart) {
  localStorage.setItem(getCartKey(userId), JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent('targetsticker:cart-updated', { detail: { userId, cart } }));
  return cart;
}

export function addToCart(userId, productId) {
  const cart = getCart(userId);
  const existing = cart.find((item) => item.productId === productId);
  if (existing) existing.quantity += 1;
  else cart.push({ productId, quantity: 1 });
  return saveCart(userId, cart);
}

export function updateCartQuantity(userId, productId, quantity) {
  const cart = getCart(userId).filter((item) => item.productId !== productId || quantity > 0);
  const item = cart.find((entry) => entry.productId === productId);
  if (item) item.quantity = Math.max(1, Math.floor(quantity));
  return saveCart(userId, cart);
}

export function removeFromCart(userId, productId) {
  return saveCart(userId, getCart(userId).filter((item) => item.productId !== productId));
}

export function clearCart(userId) {
  return saveCart(userId, []);
}
