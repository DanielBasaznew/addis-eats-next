import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import AddToCartButton from '@/components/AddToCartButton';
import FavoriteButton from '@/components/FavoriteButton';
import { getDishes, getDishBySlugOrId } from '@/lib/dishes';
import { getSession } from '@/lib/session';
import { isDishFavorite, syncFavoritesFromList } from '@/lib/favorites';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function generateStaticParams() {
  const dishes = await getDishes();
  return dishes.map((dish) => ({
    id: dish.name,
  }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const dish = await getDishBySlugOrId(id);

  if (!dish) {
    return {
      title: 'Dish Not Found',
      description: 'The requested dish could not be found.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = dish.name;
  const description =
    dish.description ||
    `${dish.name} — ${dish.price} ETB at Addis Eats. Handcrafted Ethiopian culinary specialty served with sourdough teff injera.`;
  const url = `/menu/${encodeURIComponent(dish.name)}`;
  const foodImage = dish.image || `/menu/${encodeURIComponent(dish.name)}/opengraph-image`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${title} · Addis Eats`,
      description,
      url,
      siteName: 'Addis Eats',
      locale: 'en_ET',
      type: 'article',
      images: [
        {
          url: foodImage,
          width: 1200,
          height: 630,
          alt: `${dish.name} — Addis Eats`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} · Addis Eats`,
      description,
      images: [foodImage],
    },
  };
}

function createMenuItemJsonLd(dish) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'MenuItem',
    name: dish.name,
    description:
      dish.description ||
      `${dish.name} — authentic Ethiopian ${dish.category?.toLowerCase() || 'traditional'} dish served with fresh injera.`,
    image: dish.image ? dish.image : undefined,
    offers: {
      '@type': 'Offer',
      price: dish.price,
      priceCurrency: 'ETB',
      availability: 'https://schema.org/InStock',
      url: `/menu/${encodeURIComponent(dish.name)}`,
    },
    menuAddOn: {
      '@type': 'MenuItem',
      name: 'Sourdough Teff Injera',
    },
  };

  if (dish.vegetarian) {
    schema.suitableForDiet = 'https://schema.org/VegetarianDiet';
  }

  return schema;
}

export default async function DishDetailPage({ params }) {
  const { id } = await params;
  let dish = await getDishBySlugOrId(id);

  if (!dish) {
    notFound();
  }

  const cookieStore = await cookies();
  const availabilityCookie = cookieStore.get('dish_availability')?.value;
  if (availabilityCookie) {
    try {
      const map = JSON.parse(availabilityCookie);
      if (map[String(dish.id)] !== undefined) {
        dish = { ...dish, available: Boolean(map[String(dish.id)]) };
      }
    } catch {
      // Ignore JSON parse error
    }
  }

  const isAvailable = dish.available !== false;

  const session = await getSession();
  let isFavorite = false;
  if (session) {
    const cookieVal = cookieStore.get(`favorites_${session.id}`)?.value;
    if (cookieVal) {
      try {
        const parsed = JSON.parse(cookieVal);
        syncFavoritesFromList(session.id, parsed);
      } catch {
        // Ignore parse error
      }
    }
    isFavorite = isDishFavorite(session.id, dish.id);
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(createMenuItemJsonLd(dish)),
        }}
      />
      <Link
        href="/menu"
        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors mb-6 no-underline"
      >
        <span aria-hidden="true">&larr;</span>
        <span>Back to Full Menu</span>
      </Link>

      <article className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-sm p-6 sm:p-10 relative overflow-hidden">
        <div className="relative mb-8 w-full h-72 sm:h-96 bg-stone-100 dark:bg-stone-800 rounded-2xl overflow-hidden">
          {dish.image && (
            <Image
              src={dish.image}
              alt={dish.name}
              width={896}
              height={384}
              sizes="(max-width: 896px) 100vw, 896px"
              priority
              className={`w-full h-72 sm:h-96 object-cover rounded-2xl ${
                !isAvailable ? 'filter grayscale-[30%] opacity-85' : ''
              }`}
            />
          )}
          {!isAvailable && (
            <div className="absolute top-4 left-4 z-10 px-3.5 py-1.5 rounded-full bg-stone-900/90 text-amber-300 text-xs font-extrabold uppercase tracking-wider border border-amber-500/40 backdrop-blur-md shadow-md">
              Sold Out
            </div>
          )}
          <div className="absolute top-4 right-4 z-10">
            <FavoriteButton
              dishId={dish.id}
              initialIsFavorite={isFavorite}
              size="lg"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium">
            Category: {dish.category}
          </span>
          <span
            className={`text-xs px-3 py-1 rounded-full font-semibold border ${
              dish.vegetarian
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800/60'
            }`}
          >
            {dish.vegetarian ? 'Vegetarian Specialty' : 'Traditional Stew'}
          </span>
          <span className="text-xs px-3 py-1 rounded-full bg-amber-50/60 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-100 dark:border-amber-800/40 font-medium hidden sm:inline-block">
            Fresh Sourdough Injera Included
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4 mb-6">
          <h1 className="m-0 text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight flex items-center gap-3">
            <span>{dish.name}</span>
            {!isAvailable && (
              <span className="text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                Sold Out
              </span>
            )}
          </h1>
          <div className="inline-flex items-baseline gap-1 px-4 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/70 dark:border-amber-800/60 self-start sm:self-auto">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-950 dark:text-amber-300">
              {dish.price}
            </span>
            <span className="text-xs font-bold text-amber-800 dark:text-amber-400">ETB</span>
          </div>
        </div>

        <div className="space-y-4 text-stone-600 dark:text-stone-300 text-sm sm:text-base leading-relaxed">
          {dish.description ? (
            <p className="m-0">{dish.description}</p>
          ) : (
            <p className="m-0">
              A quintessential specialty of Ethiopian cuisine. Cooked in clay pots using fragrant highland spices, aromatic garlic, ginger, and clarified spiced butter, creating a harmonious and comforting depth of flavour.
            </p>
          )}
          <p className="text-xs text-stone-500 dark:text-stone-400 italic">
            * Served piping hot alongside freshly rolled fermented teff injera. Enjoyed traditionally by hand.
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <FavoriteButton
              dishId={dish.id}
              initialIsFavorite={isFavorite}
              size="md"
              showText
            />
            <span className="text-stone-300 dark:text-stone-700 hidden sm:inline">•</span>
            <div className="text-xs text-stone-500 dark:text-stone-400 text-center sm:text-left">
              <span>Prepared fresh upon order</span>
              <span className="mx-2">•</span>
              <span>Approx. 20–30 mins delivery</span>
            </div>
          </div>
          <AddToCartButton dish={dish} />
        </div>
      </article>
    </main>
  );
}
