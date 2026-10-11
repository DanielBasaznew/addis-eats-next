'use client';

import { useState } from 'react';
import { useCart } from './CartProvider';

export default function AddToCartButton({ dish, compact = false, className = '' }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(dish);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleAdd}
        aria-label={`Add ${dish?.name || 'dish'} to cart`}
        className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs tracking-wide transition-all duration-200 shadow-xs cursor-pointer ${
          added
            ? 'bg-emerald-700 text-white shadow-emerald-700/20 scale-[0.98]'
            : 'bg-amber-900 hover:bg-amber-800 text-amber-50 shadow-amber-950/15 hover:shadow-sm active:scale-[0.98]'
        } ${className}`}
      >
        {added ? (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 h-3.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>Added</span>
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add to Cart</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 shadow-sm cursor-pointer ${
        added
          ? 'bg-emerald-700 text-white shadow-emerald-700/20 scale-[0.98]'
          : 'bg-amber-900 hover:bg-amber-800 text-amber-50 shadow-amber-950/15 hover:shadow-md active:scale-[0.98]'
      } ${className}`}
    >
      {added ? 'Added to Cart!' : 'Add to Order'}
    </button>
  );
}
