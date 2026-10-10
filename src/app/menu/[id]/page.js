import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import AddToCartButton from '@/components/AddToCartButton';
import FavoriteButton from '@/components/FavoriteButton';
import { getDishes } from '@/lib/dishes';

export async function generateStaticParams() {
  const dishes = await getDishes();
  return dishes.map((dish) => ({
    id: String(dish.id),
  }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const dishes = await getDishes();
  const dish = dishes.find((item) => String(item.id) === String(id));

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
  const url = `https://addiseats.et/menu/${dish.id}`;
  const ogImageUrl = `https://addiseats.et/menu/${dish.id}/opengraph-image`;

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
          url: ogImageUrl,
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
      images: [ogImageUrl],
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
    image: dish.image ? `https://addiseats.et${dish.image}` : undefined,
    offers: {
      '@type': 'Offer',
      price: dish.price,
      priceCurrency: 'ETB',
      availability: 'https://schema.org/InStock',
      url: `https://addiseats.et/menu/${dish.id}`,
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
  const dishes = await getDishes();
  const dish = dishes.find((item) => String(item.id) === String(id));

  if (!dish) {
    notFound();
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
        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-900 hover:text-amber-700 transition-colors mb-6 no-underline"
      >
        <span aria-hidden="true">&larr;</span>
        <span>Back to Full Menu</span>
      </Link>

      <article className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-10 relative overflow-hidden">
        <div className="relative mb-8">
          {dish.image && (
            <Image
              src={dish.image}
              alt={dish.name}
              width={896}
              height={384}
              sizes="(max-width: 896px) 100vw, 896px"
              priority
              className="w-full h-72 sm:h-96 object-cover rounded-2xl"
            />
          )}
          <div className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-xs rounded-full p-1 shadow-md">
            <FavoriteButton dishId={dish.id} size="lg" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs px-3 py-1 rounded-full bg-stone-100 text-stone-700 font-medium">
            Category: {dish.category}
          </span>
          <span
            className={`text-xs px-3 py-1 rounded-full font-semibold border ${
              dish.vegetarian
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-900 border-amber-200'
            }`}
          >
            {dish.vegetarian ? 'Vegetarian Specialty' : 'Traditional Stew'}
          </span>
          <span className="text-xs px-3 py-1 rounded-full bg-amber-50/60 text-amber-800 border border-amber-100 font-medium hidden sm:inline-block">
            Fresh Sourdough Injera Included
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4 mb-6">
          <h1 className="m-0 text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            {dish.name}
          </h1>
          <div className="inline-flex items-baseline gap-1 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200/70 self-start sm:self-auto">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-950">
              {dish.price}
            </span>
            <span className="text-xs font-bold text-amber-800">ETB</span>
          </div>
        </div>

        <div className="space-y-4 text-stone-600 text-sm sm:text-base leading-relaxed">
          {dish.description ? (
            <p className="m-0">{dish.description}</p>
          ) : (
            <p className="m-0">
              A quintessential specialty of Ethiopian cuisine. Cooked in clay pots using fragrant highland spices, aromatic garlic, ginger, and clarified spiced butter, creating a harmonious and comforting depth of flavour.
            </p>
          )}
          <p className="text-xs text-stone-500 italic">
            * Served piping hot alongside freshly rolled fermented teff injera. Enjoyed traditionally by hand.
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <FavoriteButton dishId={dish.id} size="md" showText />
            <span className="text-stone-300 hidden sm:inline">•</span>
            <div className="text-xs text-stone-500 text-center sm:text-left">
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
