'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const isLoadedRef = useRef(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('addis_eats_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCart(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
    }
    isLoadedRef.current = true;
  }, []);

  useEffect(() => {
    if (isLoadedRef.current) {
      try {
        localStorage.setItem('addis_eats_cart', JSON.stringify(cart));
      } catch (e) {
        console.error('Failed to save cart to localStorage', e);
      }
    }
  }, [cart]);

  const addToCart = useCallback((dish) => {
    if (!dish) return;
    if (dish.available === false) {
      console.warn(`"${dish.name}" is sold out and cannot be added to cart.`);
      return;
    }
    setCart((prev) => {
      const existing = prev.find((item) => item.id === dish.id);
      if (existing) {
        return prev.map((item) =>
          item.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...dish, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const total = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + item.price * (item.quantity || 1),
        0
      ),
    [cart]
  );

  const value = useMemo(
    () => ({
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      total,
    }),
    [cart, addToCart, removeFromCart, clearCart, total]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
