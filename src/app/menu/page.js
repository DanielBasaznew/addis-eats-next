import DishCard from '@/components/DishCard';
import FilterShell from '@/components/FilterShell';
import { getDishes } from '@/lib/dishes';
import { getSession } from '@/lib/session';
import { cookies } from 'next/headers';
import { getFavoriteIds, syncFavoritesFromList } from '@/lib/favorites';

export const revalidate = 3600;

export const metadata = {
  title: 'Menu',
  description:
    'Explore our handcrafted Ethiopian dishes, traditional slow-cooked wots, and vegetarian options served with fresh teff injera.',
  alternates: {
    canonical: '/menu',
  },
  openGraph: {
    title: 'Our Handcrafted Menu · Addis Eats',
    description:
      'Explore our handcrafted Ethiopian dishes, traditional slow-cooked wots, and vegetarian options served with fresh teff injera.',
    url: '/menu',
    siteName: 'Addis Eats',
    locale: 'en_ET',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Our Handcrafted Menu · Addis Eats',
    description:
      'Explore our handcrafted Ethiopian dishes, traditional slow-cooked wots, and vegetarian options served with fresh teff injera.',
  },
};

export default async function MenuPage() {
  const session = await getSession();
  let userFavoriteIds = new Set();
  if (session) {
    const cookieStore = await cookies();
    const cookieVal = cookieStore.get(`favorites_${session.id}`)?.value;
    if (cookieVal) {
      try {
        const parsed = JSON.parse(cookieVal);
        syncFavoritesFromList(session.id, parsed);
      } catch {
        // Ignore JSON parse error
      }
    }
    userFavoriteIds = getFavoriteIds(session.id);
  }

  const dishes = await getDishes();
  const categories = ['All', ...new Set(dishes.map((dish) => dish.category))];

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-12">
      <header className="mb-8 pb-6 border-b border-stone-200">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-amber-800 font-bold mb-1.5 block">
              Traditional Kitchen • Fresh Daily
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              Our Handcrafted Menu
            </h1>
            <p className="mt-2 text-stone-600 text-sm sm:text-base max-w-xl">
              Authentic Ethiopian recipes slow-cooked with spiced butter, berbere, and fresh vegetables. Served with warm teff injera.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-semibold border border-stone-200">
              {dishes.length} Dishes
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
              Vegan Options
            </span>
          </div>
        </div>
      </header>
      <FilterShell categories={categories}>
        {dishes.map((dish, index) => (
          <DishCard
            key={dish.id}
            dish={dish}
            isFavorite={userFavoriteIds.has(Number(dish.id))}
            data-category={dish.category}
            data-dish-id={dish.id}
            priority={index === 0}
          />
        ))}
      </FilterShell>
    </main>
  );
}