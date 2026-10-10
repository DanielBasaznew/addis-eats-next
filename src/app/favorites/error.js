'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function FavoritesError({ error, reset }) {
  useEffect(() => {
    console.error('Favorites Error Boundary caught error:', error);
  }, [error]);

  return (
    <main className="max-w-xl mx-auto px-4 py-16 text-center">
      <div className="bg-white rounded-3xl border border-red-200/80 p-8 sm:p-10 shadow-xs">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold text-xl">
          !
        </div>
        <h1 className="text-2xl font-bold text-stone-900 mb-2">
          Unable to Load Favorites
        </h1>
        <p className="text-stone-600 text-sm mb-6 leading-relaxed">
          {error?.message || 'An unexpected error occurred while retrieving your favorite dishes.'}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-full bg-amber-900 text-white font-semibold text-sm hover:bg-amber-950 transition-colors cursor-pointer"
          >
            Try Again
          </button>
          <Link
            href="/menu"
            className="px-5 py-2.5 rounded-full border border-stone-200 text-stone-700 font-semibold text-sm hover:bg-stone-50 transition-colors no-underline"
          >
            Back to Menu
          </Link>
        </div>
      </div>
    </main>
  );
}
