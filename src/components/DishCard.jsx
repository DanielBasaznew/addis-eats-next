'use client';

import { memo, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import FavoriteButton from '@/components/FavoriteButton';
import AddToCartButton from '@/components/AddToCartButton';

function DishCard({ dish, priority = false, isFavorite = false }) {
  const [isAvailable, setIsAvailable] = useState(() => dish?.available !== false);

  useEffect(() => {
    setIsAvailable(dish?.available !== false);
  }, [dish?.available]);

  useEffect(() => {
    if (!dish?.id) return;

    function syncAvailability() {
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

    syncAvailability();

    function onAvailabilityChanged(e) {
      if (e?.detail?.dishId && String(e.detail.dishId) === String(dish.id)) {
        setIsAvailable(Boolean(e.detail.available));
      } else if (!e?.detail?.dishId) {
        syncAvailability();
      }
    }

    window.addEventListener('dish-availability-changed', onAvailabilityChanged);
    window.addEventListener('storage', syncAvailability);

    return () => {
      window.removeEventListener('dish-availability-changed', onAvailabilityChanged);
      window.removeEventListener('storage', syncAvailability);
    };
  }, [dish?.id]);

  if (!dish) return null;

  return (
    <article
      className="group dish-card relative flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-sm hover:shadow-md hover:border-amber-900/30 dark:hover:border-amber-500/40 transition-all duration-200"
      data-category={dish.category}
      data-dish-id={dish.id}
    >
      <div>
        <div className="relative mb-4 w-full h-44 bg-stone-100 dark:bg-stone-800 rounded-xl overflow-hidden">
          {dish.image ? (
            <Image
              src={dish.image}
              alt={dish.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 384px"
              priority={priority}
              className={`object-cover rounded-xl group-hover:scale-102 transition-transform duration-300 ${
                !isAvailable ? 'filter grayscale-[30%] opacity-85' : ''
              }`}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500">
              <svg className="w-8 h-8 mb-1.5 text-stone-400 dark:text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3v2" />
                <path d="M4 14a8 8 0 0 1 16 0H4Z" />
                <path d="M2 18h20" />
                <path d="M5 18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2" />
              </svg>
              <span className="text-xs font-medium">Addis Eats Kitchen</span>
            </div>
          )}
          {!isAvailable && (
            <div className="absolute top-2.5 left-2.5 z-10 px-2.5 py-1 rounded-full bg-stone-900/90 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider border border-amber-500/40 backdrop-blur-md shadow-xs">
              Sold Out
            </div>
          )}
          <div className="absolute top-2.5 right-2.5 z-10">
            <FavoriteButton
              dishId={dish.id}
              initialIsFavorite={isFavorite}
              size="sm"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-medium">
            {dish.category}
          </span>

          <span
            className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${dish.vegetarian
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60'
              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60'
              }`}
          >
            {dish.vegetarian ? 'Vegetarian' : 'Traditional Stew'}
          </span>
        </div>

        <div className="flex items-baseline justify-between gap-2">
          <h3 className="m-0 text-xl font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-900 dark:group-hover:text-amber-400 transition-colors tracking-tight">
            <Link
              href={`/menu/${encodeURIComponent(dish.name)}`}
              className="no-underline text-inherit focus:outline-none"
            >
              {dish.name}
            </Link>
          </h3>

          <span className="text-lg font-extrabold text-amber-900 dark:text-amber-400 whitespace-nowrap">
            {dish.price}{' '}
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
              ETB
            </span>
          </span>
        </div>

        <p className="mt-2 text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
          Prepared fresh daily with authentic Ethiopian spices & sourdough teff injera.
        </p>
      </div>

      <div className="mt-5 pt-3.5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
        <Link
          href={`/menu/${encodeURIComponent(dish.name)}`}
          className="inline-flex items-center justify-center px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 hover:text-stone-950 dark:hover:text-white transition-all duration-200 no-underline shadow-xs"
        >
          <span>View Details</span>
          <span aria-hidden="true" className="ml-1 text-stone-400 group-hover:translate-x-0.5 transition-transform">
            &rarr;
          </span>
        </Link>

        <AddToCartButton dish={{ ...dish, available: isAvailable }} compact />
      </div>
    </article>
  );
}

export default memo(DishCard);