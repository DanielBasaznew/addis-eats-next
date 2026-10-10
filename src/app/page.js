import Link from 'next/link';

export const metadata = {
  title: 'Ethiopian Food Delivery in Addis Ababa',
  description:
    'Order authentic Ethiopian dishes, fresh teff injera, and traditional wots delivered across Addis Ababa.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Ethiopian Food Delivery in Addis Ababa · Addis Eats',
    description:
      'Order authentic Ethiopian dishes, fresh teff injera, and traditional wots delivered across Addis Ababa.',
    url: '/',
    siteName: 'Addis Eats',
    locale: 'en_ET',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ethiopian Food Delivery in Addis Ababa · Addis Eats',
    description:
      'Order authentic Ethiopian dishes, fresh teff injera, and traditional wots delivered across Addis Ababa.',
  },
};

const restaurantJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: 'Addis Eats',
  description:
    'Handcrafted Ethiopian dishes, slow-simmered wots, and fresh daily teff injera delivered across Addis Ababa.',
  url: 'https://addiseats.et',
  servesCuisine: 'Ethiopian',
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Bole Road & Kazanchis',
    addressLocality: 'Addis Ababa',
    addressCountry: 'ET',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '10:00',
      closes: '22:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Saturday', 'Sunday'],
      opens: '09:00',
      closes: '23:00',
    },
  ],
};

export default function HomePage() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(restaurantJsonLd),
        }}
      />
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950 via-stone-900 to-amber-900 text-stone-100 p-8 sm:p-12 md:p-16 shadow-xl border border-amber-900/30">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold tracking-wide uppercase mb-6">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Fresh Everyday • Addis Ababa Heritage
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.15] mb-6">
            Taste the Soul of Ethiopian Cuisine.
          </h1>

          <p className="text-stone-300 text-base sm:text-lg leading-relaxed mb-8 max-w-xl">
            From fragrant berbere-infused Doro Wot to silky Shiro and sizzling clay-pot Tibs. Every dish is prepared with hand-blended spices and served with fresh, sourdough teff injera.
          </p>

          <div className="flex flex-wrap gap-4 items-center">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm sm:text-base shadow-lg hover:shadow-amber-500/20 transition-all duration-200 no-underline"
            >
              <span>Explore Our Menu</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-stone-100 font-semibold text-sm sm:text-base border border-white/20 transition-all duration-200 no-underline backdrop-blur-sm"
            >
              Review Your Cart
            </Link>
          </div>
        </div>

        {/* Ambient Warm Gradient Accent */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-amber-600/20 blur-3xl pointer-events-none" />
      </section>

      {/* Culinary Pillars */}
      <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-sm hover:border-amber-700/30 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-mono font-bold text-xs mb-4">
            01
          </div>
          <h3 className="text-lg font-bold text-stone-900 mb-2">Clay Pot Traditions</h3>
          <p className="text-sm text-stone-600 leading-relaxed">
            Slow-simmered in earthen pots using clarified niter kibbeh, whole cardamom, and sun-dried red chilies from the Ethiopian highlands.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-sm hover:border-amber-700/30 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-mono font-bold text-xs mb-4">
            02
          </div>
          <h3 className="text-lg font-bold text-stone-900 mb-2">100% Teff Sourdough</h3>
          <p className="text-sm text-stone-600 leading-relaxed">
            Naturally fermented over four days to cultivate the signature airy spongy eyes that capture every drop of savoury wot sauce.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-sm hover:border-amber-700/30 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-mono font-bold text-xs mb-4">
            03
          </div>
          <h3 className="text-lg font-bold text-stone-900 mb-2">Vegetarian & Fasting</h3>
          <p className="text-sm text-stone-600 leading-relaxed">
            Rich vegan traditions crafted for fasting Wednesdays and Fridays, featuring slow-cooked split red lentils, yellow split peas, and collards.
          </p>
        </div>
      </section>
    </main>
  );
}
