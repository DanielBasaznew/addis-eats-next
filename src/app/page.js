import Link from 'next/link';
import Image from 'next/image';

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
    images: [
      {
        url: '/images/hero-feast.jpg',
        width: 1200,
        height: 630,
        alt: 'Addis Eats — Authentic Ethiopian Feast',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ethiopian Food Delivery in Addis Ababa · Addis Eats',
    description:
      'Order authentic Ethiopian dishes, fresh teff injera, and traditional wots delivered across Addis Ababa.',
    images: ['/images/hero-feast.jpg'],
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
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950 via-stone-900 to-amber-900 text-stone-100 p-8 sm:p-12 lg:p-14 shadow-2xl border border-amber-900/40">
        {/* Ambient Warm Gradient Accent */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-amber-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -top-20 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Story & CTAs */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold tracking-wide uppercase mb-6 w-fit">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Fresh Everyday • Addis Ababa Heritage
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.12] mb-6">
              Taste the Soul of Ethiopian Cuisine.
            </h1>

            <p className="text-stone-300 text-base sm:text-lg leading-relaxed mb-8 max-w-xl">
              From fragrant berbere-infused Doro Wot to silky Shiro and sizzling clay-pot Tibs. Every dish is prepared with hand-blended spices and served with fresh, sourdough teff injera.
            </p>

            <div className="flex flex-wrap gap-4 items-center mb-10">
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

            {/* Micro Highlights */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-amber-900/40 text-stone-300">
              <div>
                <span className="block text-xl font-extrabold text-amber-400">4.9 ★</span>
                <span className="text-xs text-stone-400">1,200+ Reviews</span>
              </div>
              <div>
                <span className="block text-xl font-extrabold text-white">35 min</span>
                <span className="text-xs text-stone-400">Average Delivery</span>
              </div>
              <div>
                <span className="block text-xl font-extrabold text-emerald-400">100%</span>
                <span className="text-xs text-stone-400">Sourdough Teff</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Showcase Image Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative group mx-auto max-w-md lg:max-w-none">
              {/* Outer decorative glow ring */}
              <div className="absolute -inset-1.5 bg-gradient-to-tr from-amber-600/40 via-amber-400/20 to-transparent rounded-3xl blur-lg group-hover:blur-xl transition-all duration-500" />

              {/* Main Image Container */}
              <div className="relative aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3] w-full rounded-2xl overflow-hidden border-2 border-amber-400/30 shadow-2xl bg-stone-900">
                <Image
                  src="/images/hero-feast.jpg"
                  alt="Authentic Ethiopian Culinary Feast with Doro Wot and Fresh Injera"
                  fill
                  priority
                  sizes="(max-width: 1024px) 90vw, 480px"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Subtle vignette gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-black/20 pointer-events-none" />

                {/* Floating Glass Tag: Top Left */}
                <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-stone-900/85 backdrop-blur-md border border-white/10 text-white flex items-center gap-2 shadow-lg">
                  <span className="text-base">🍲</span>
                  <div>
                    <p className="text-[11px] font-bold leading-tight">Authentic Mesob Platter</p>
                    <p className="text-[9px] text-amber-300 font-medium">Clay-Pot Slow Simmered</p>
                  </div>
                </div>

                {/* Floating Glass Tag: Bottom Right */}
                <div className="absolute bottom-3 right-3 px-3.5 py-1.5 rounded-xl bg-amber-500/90 backdrop-blur-md text-stone-950 font-bold text-xs shadow-lg flex items-center gap-1.5">
                  <span>🌾 Fresh Injera Daily</span>
                </div>
              </div>
            </div>
          </div>
        </div>
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
