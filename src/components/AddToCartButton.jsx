'use client';

import { useState, useEffect } from 'react';
import { useCart } from './CartProvider';

export default function AddToCartButton({ dish, compact = false, className = '' }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [isAvailable, setIsAvailable] = useState(() => dish?.available !== false);

  // Keep state synchronized with dish prop
  useEffect(() => {
    setIsAvailable(dish?.available !== false);
  }, [dish?.available]);

  // Read latest client-side cookie & listen to live availability broadcast
  useEffect(() => {
    if (!dish?.id) return;

    function syncFromClientStore() {
      try {
        const match = document.cookie.match(/dish_availability=([^;]+)/);
        if (match) {
          const map = JSON.parse(decodeURIComponent(match[1]));
          if (map[String(dish.id)] !== undefined) {
            setIsAvailable(Boolean(map[String(dish.id)]));
          }
        }
      } catch {}
    }

    syncFromClientStore();

    function onAvailabilityChanged(event) {
      if (event?.detail?.dishId && String(event.detail.dishId) === String(dish.id)) {
        setIsAvailable(Boolean(event.detail.available));
      } else if (!event?.detail?.dishId) {
        syncFromClientStore();
      }
    }

    window.addEventListener('dish-availability-changed', onAvailabilityChanged);
    window.addEventListener('storage', syncFromClientStore);

    return () => {
      window.removeEventListener('dish-availability-changed', onAvailabilityChanged);
      window.removeEventListener('storage', syncFromClientStore);
    };
  }, [dish?.id]);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAvailable) return;
    addToCart({ ...dish, available: isAvailable });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  if (!isAvailable) {
    return (
      <button
        type="button"
        disabled
        aria-label={`${dish?.name || 'Dish'} is sold out`}
        className={`inline-flex items-center justify-center gap-1.5 ${
          compact ? 'px-3 py-2' : 'px-6 py-3 w-full'
        } rounded-xl font-bold text-xs tracking-wide bg-stone-100 dark:bg-stone-800/80 text-stone-400 dark:text-stone-500 border border-stone-200 dark:border-stone-700/80 cursor-not-allowed select-none ${className}`}
      >
        <span>Sold Out</span>
      </button>
    );
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleAdd}
        aria-label={`Add ${dish?.name || 'dish'} to cart`}
        className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs tracking-wide transition-all duration-200 shadow-xs cursor-pointer ${added
            ? 'bg-emerald-700 text-white shadow-emerald-700/20 scale-[0.98]'
            : 'bg-amber-900 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-amber-50 dark:text-white shadow-amber-950/15 hover:shadow-sm active:scale-[0.98]'
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
      className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 shadow-sm cursor-pointer ${added
          ? 'bg-emerald-700 text-white shadow-emerald-700/20 scale-[0.98]'
          : 'bg-amber-900 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-amber-50 dark:text-white shadow-amber-950/15 hover:shadow-md active:scale-[0.98]'
        } ${className}`}
    >
      {added ? 'Added to Cart!' : 'Add to Order'}
    </button>
  );
}
