import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { getFavoriteIds } from '@/lib/favorites';
import { getDishes } from '@/lib/dishes';
import DishCard from '@/components/DishCard';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'My Favorites · Addis Eats',
  description: 'Your saved handcrafted Ethiopian specialties and favorite dishes.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function FavoritesPage() {
  const session = await getSession();

  if (!session) {
    redirect('/signin?next=/favorites');
  }

  const favoriteSet = getFavoriteIds(session.id);
  const allDishes = await getDishes();
  const favoriteDishes = allDishes.filter((dish) => favoriteSet.has(Number(dish.id)));

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-12">
      {/* Header */}
      <header className="mb-8 pb-6 border-b border-stone-200">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-rose-700 font-bold mb-1.5 block">
              Personal Collection • {session.role === 'staff' ? 'Staff Member' : 'Customer'}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              My Favorite Dishes
            </h1>
            <p className="mt-2 text-stone-600 text-sm sm:text-base max-w-xl">
              Your saved culinary favorites for quick access and reordering. Click the heart on any dish to remove it.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-3.5 py-1.5 rounded-full bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200">
              {favoriteDishes.length} {favoriteDishes.length === 1 ? 'Favorite' : 'Favorites'}
            </span>
            <Link
              href="/menu"
              className="px-3.5 py-1.5 rounded-full bg-amber-900 text-white text-xs font-semibold hover:bg-amber-950 transition-colors no-underline"
            >
              Explore Full Menu &rarr;
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      {favoriteDishes.length === 0 ? (
        <section
          aria-labelledby="empty-favorites-heading"
          className="bg-white rounded-3xl border border-stone-200/90 shadow-xs p-10 sm:p-16 text-center max-w-2xl mx-auto my-6"
        >
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
          </div>
          <h2
            id="empty-favorites-heading"
            className="text-2xl font-bold text-stone-900 tracking-tight"
          >
            No favorite dishes yet
          </h2>
          <p className="mt-2 text-stone-600 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            You haven&apos;t saved any dishes yet. Browse our menu to discover authentic Ethiopian slow-cooked wots, vegetarian delights, and freshly baked injera.
          </p>
          <div className="mt-8">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-900 hover:bg-amber-950 text-white font-semibold text-sm transition-colors shadow-sm no-underline"
            >
              <span>Browse Traditional Menu</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </section>
      ) : (
        <section
          aria-label="List of saved favorite dishes"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {favoriteDishes.map((dish) => (
            <DishCard
              key={dish.id}
              dish={dish}
              isFavorite={true}
              data-category={dish.category}
              data-dish-id={dish.id}
            />
          ))}
        </section>
      )}
    </main>
  );
}
