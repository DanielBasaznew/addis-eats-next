'use client';

import { useState, useTransition, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import { toggleFavorite } from '@/app/actions';
import { fetcher } from '@/lib/fetcher';

export default function FavoriteButton({
  dishId,
  initialIsFavorite = false,
  className = '',
  size = 'md',
  showText = false,
}) {
  const numericId = Number(dishId);
  const [optimisticState, setOptimisticState] = useState(null);
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  // Conditionally sync favorites via SWR if user is authenticated
  const { data: favoritesData } = useSWR('/api/favorites', fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const isFavoriteFromSwr =
    Array.isArray(favoritesData?.favoriteIds) &&
    favoritesData.favoriteIds.includes(numericId);

  // Optimistic state takes precedence during transitions, followed by SWR, then initial prop
  const isFavorite =
    optimisticState !== null
      ? optimisticState
      : favoritesData?.favoriteIds
      ? isFavoriteFromSwr
      : initialIsFavorite;

  // Clear transient error after 4 seconds
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 4000);
    return () => clearTimeout(timer);
  }, [error]);

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);

    const nextState = !isFavorite;
    setOptimisticState(nextState);

    startTransition(async () => {
      try {
        const result = await toggleFavorite(numericId);
        if (!result?.success) {
          // Revert optimistic state
          setOptimisticState(!nextState);
          if (result?.authorized === false) {
            const currentPath =
              typeof window !== 'undefined' && window.location.pathname
                ? window.location.pathname
                : '/menu';
            window.location.href = `/signin?next=${encodeURIComponent(currentPath)}`;
            return;
          }
          setError(result?.error || 'Failed to update favorites.');
        } else {
          setOptimisticState(Boolean(result.isFavorite));
          // Optimistically mutate SWR favorites cache
          if (favoritesData?.favoriteIds) {
            const updatedIds = result.isFavorite
              ? [...new Set([...favoritesData.favoriteIds, numericId])]
              : favoritesData.favoriteIds.filter((id) => id !== numericId);
            mutate('/api/favorites', { ...favoritesData, favoriteIds: updatedIds }, false);
          }
        }
      } catch {
        setOptimisticState(!nextState);
        setError('Network error updating favorites.');
      }
    });
  };

  const sizeClasses =
    size === 'sm'
      ? 'w-8 h-8 text-xs'
      : size === 'lg'
      ? 'w-11 h-11 text-base'
      : 'w-9 h-9 text-sm';

  const iconClasses =
    size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';

  return (
    <div className="relative inline-flex items-center gap-1.5">
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        aria-label={
          isFavorite
            ? `Remove dish ${dishId} from favorites`
            : `Add dish ${dishId} to favorites`
        }
        title={
          isFavorite
            ? 'Saved to favorites (click to remove)'
            : 'Save to favorites'
        }
        className={`rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${sizeClasses} ${
          isFavorite
            ? 'bg-rose-50 text-rose-600 border border-rose-300 shadow-sm hover:bg-rose-100'
            : 'bg-white/95 text-stone-400 border border-stone-200/90 hover:text-rose-500 hover:border-rose-300 hover:bg-white shadow-sm backdrop-blur-xs'
        } ${isPending ? 'opacity-70 scale-95' : 'hover:scale-108 active:scale-95'} ${className}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={isFavorite ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${iconClasses} transition-transform`}
        >
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      </button>

      {showText && (
        <span className="text-xs font-semibold text-stone-600 select-none">
          {isFavorite ? 'Saved to Favorites' : 'Add to Favorites'}
        </span>
      )}

      {error && (
        <span
          role="alert"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2.5 py-1 bg-stone-900 text-white text-[10px] font-medium rounded-md shadow-lg whitespace-nowrap z-30"
        >
          {error}
        </span>
      )}
    </div>
  );
}
