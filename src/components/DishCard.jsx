import Link from 'next/link';
import Image from 'next/image';
import FavoriteButton from '@/components/FavoriteButton';

export default function DishCard({ dish, priority = false, isFavorite = false }) {
  if (!dish) return null;

  return (
    <article
      className="group dish-card relative flex flex-col justify-between p-5 rounded-2xl bg-white border border-stone-200/90 shadow-sm hover:shadow-md hover:border-amber-900/30 transition-all duration-200"
      data-category={dish.category}
      data-dish-id={dish.id}
    >
      <div>
        <div className="relative mb-4">
          {dish.image && (
            <Image
              src={dish.image}
              alt={dish.name}
              width={400}
              height={176}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 384px"
              priority={priority}
              className="w-full h-44 object-cover rounded-xl"
            />
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
          <span className="text-xs px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 font-medium">
            {dish.category}
          </span>

          <span
            className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
              dish.vegetarian
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                : 'bg-amber-50 text-amber-900 border-amber-200/80'
            }`}
          >
            {dish.vegetarian ? 'Vegetarian' : 'Traditional Stew'}
          </span>
        </div>

        <div className="flex items-baseline justify-between gap-2">
          <h3 className="m-0 text-xl font-bold text-stone-900 group-hover:text-amber-900 transition-colors tracking-tight">
            <Link
              href={`/menu/${dish.id}`}
              className="no-underline text-inherit focus:outline-none"
            >
              {dish.name}
            </Link>
          </h3>

          <span className="text-lg font-extrabold text-amber-900 whitespace-nowrap">
            {dish.price}{' '}
            <span className="text-xs font-semibold text-stone-500">
              ETB
            </span>
          </span>
        </div>

        <p className="mt-2 text-xs text-stone-500 leading-relaxed">
          Prepared fresh daily with authentic Ethiopian spices & sourdough teff injera.
        </p>
      </div>

      <div className="mt-4 pt-3.5 border-t border-stone-100 flex items-center justify-between">
        <Link
          href={`/menu/${dish.id}`}
          className="text-xs font-semibold text-amber-900 group-hover:text-amber-700 flex items-center gap-1 transition-colors no-underline"
        >
          <span>View Details & Order</span>
          <span
            aria-hidden="true"
            className="group-hover:translate-x-0.5 transition-transform"
          >
            &rarr;
          </span>
        </Link>
      </div>
    </article>
  );
}