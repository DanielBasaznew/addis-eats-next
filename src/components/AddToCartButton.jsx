'use client';

import { useState } from 'react';
import { useCart } from './CartProvider';

export default function AddToCartButton({ dish }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(dish);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={handleAdd}
      className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 shadow-sm cursor-pointer ${
        added
          ? 'bg-emerald-700 text-white shadow-emerald-700/20 scale-[0.98]'
          : 'bg-amber-900 hover:bg-amber-800 text-amber-50 shadow-amber-950/15 hover:shadow-md active:scale-[0.98]'
      }`}
    >
      {added ? 'Added to Cart!' : 'Add to Order'}
    </button>
  );
}
