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
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1c100c] via-[#140e0b] to-[#1e130c] text-stone-100 p-6 sm:p-10 lg:p-12 shadow-2xl border border-amber-900/40">
        {/* Subtle Ethiopian-inspired geometric pattern backdrop */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #f59e0b 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
          aria-hidden="true"
        />

        {/* Ambient Warm Gradient Accent Orbs */}
        <div className="absolute -right-24 -bottom-24 w-[26rem] h-[26rem] rounded-full bg-gradient-to-br from-amber-600/25 to-orange-600/10 blur-3xl pointer-events-none animate-glow-pulse" />
        <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Story, Marketing Typography & CTAs */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Live Heritage Badge */}
            <div className="animate-hero-fade-1 inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs sm:text-sm font-semibold tracking-wide uppercase mb-5 w-fit backdrop-blur-md shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
              </span>
              Fresh Everyday • Addis Ababa Heritage
            </div>

            {/* High-Impact Attention-Capturing Marketing Headline */}
            <h1 className="animate-hero-fade-2 text-4xl sm:text-5xl md:text-6xl lg:text-[4.15rem] font-extrabold tracking-tight leading-[1.1] mb-6">
              <span className="block text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-stone-300 mb-1.5 opacity-90">
                Taste the
              </span>
              <span className="relative inline-block">
                {/* Pulsing Ember Bloom Halo behind the headline */}
                <span
                  className="absolute -inset-3 bg-gradient-to-r from-amber-600/35 via-orange-500/40 to-amber-500/35 rounded-3xl blur-2xl animate-ember-flare pointer-events-none -z-10"
                  aria-hidden="true"
                />

                {/* Floating ambient spice spark */}
                <span
                  className="absolute -top-3 right-3 w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_10px_#fde047] animate-particle pointer-events-none hidden sm:block"
                  aria-hidden="true"
                />

                {/* High-Contrast Golden Light Beam Sweep */}
                <span className="relative z-10 inline-block bg-gradient-to-r from-amber-400 via-amber-100 via-yellow-200 via-orange-400 to-amber-400 bg-[length:260%_100%] bg-clip-text text-transparent animate-text-beam font-black drop-shadow-[0_4px_28px_rgba(245,158,11,0.55)]">
                  Soul of Ethiopian Cuisine.
                </span>

                {/* Radiant Curved Golden Accent Flourish */}
                <svg
                  className="absolute -bottom-2 sm:-bottom-2.5 left-0 w-full max-w-sm sm:max-w-md h-2.5 pointer-events-none overflow-visible"
                  viewBox="0 0 280 10"
                  fill="none"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 7C45 2.5 140 1 278 5.5"
                    stroke="url(#hero-gold-glow)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="hero-gold-glow" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
                      <stop offset="40%" stopColor="#fef08a" stopOpacity="0.95" />
                      <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#ea580c" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            <p className="animate-hero-fade-3 text-stone-300 text-base sm:text-lg leading-relaxed mb-7 max-w-xl">
              From fragrant berbere-infused Doro Wot to silky Shiro and sizzling clay-pot Tibs. Every dish is prepared with hand-blended highland spices and served with fresh, naturally fermented teff injera.
            </p>

            {/* Action Buttons with Interactive Sheen */}
            <div className="animate-hero-fade-4 flex flex-wrap gap-4 items-center mb-8">
              <Link
                href="/menu"
                className="group relative overflow-hidden inline-flex items-center gap-2.5 px-7 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-sm sm:text-base shadow-[0_10px_25px_-5px_rgba(245,158,11,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(245,158,11,0.6)] transition-all duration-300 transform hover:-translate-y-0.5 no-underline"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span>Explore Our Menu</span>
                  <span aria-hidden="true" className="group-hover:translate-x-1 transition-transform duration-200">&rarr;</span>
                </span>
                <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />
              </Link>
              <Link
                href="/cart"
                className="inline-flex items-center gap-2 px-6 py-3.5 sm:py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-stone-100 font-semibold text-sm sm:text-base border border-white/20 hover:border-amber-400/40 transition-all duration-200 no-underline backdrop-blur-md hover:-translate-y-0.5"
              >
                Review Your Cart
              </Link>
            </div>

            {/* Micro Highlights Badges with Hover Glow */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-5 border-t border-amber-900/40 text-stone-300">
              <div className="p-2.5 sm:p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-amber-500/30 hover:bg-white/[0.06] transition-all duration-200">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl sm:text-2xl font-extrabold text-amber-400">4.9</span>
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <span className="text-xs text-stone-400">1,200+ Reviews</span>
              </div>
              <div className="p-2.5 sm:p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-amber-500/30 hover:bg-white/[0.06] transition-all duration-200">
                <span className="block text-xl sm:text-2xl font-extrabold text-white">35 min</span>
                <span className="text-xs text-stone-400">Average Delivery</span>
              </div>
              <div className="p-2.5 sm:p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-amber-500/30 hover:bg-white/[0.06] transition-all duration-200">
                <span className="block text-xl sm:text-2xl font-extrabold text-emerald-400">100%</span>
                <span className="text-xs text-stone-400">Sourdough Teff</span>
              </div>
            </div>
          </div>

          {/* Right Column: Unique Arched Portal Showcase (Non-rectangular) */}
          <div className="lg:col-span-5 relative flex items-center justify-center pt-2 lg:pt-0">
            {/* Outer Orbital Concentric Ring */}
            <div
              className="absolute w-[114%] h-[114%] rounded-full border border-dashed border-amber-400/20 animate-spin-slow pointer-events-none -z-0 hidden sm:block"
              aria-hidden="true"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_#f59e0b]" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-amber-500/60" />
            </div>

            {/* Ambient Ember Glow */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-amber-600/35 via-orange-500/20 to-amber-300/10 rounded-[140px] blur-2xl animate-glow-pulse pointer-events-none" />

            {/* Main Portal Container: Sculpted Archway */}
            <div className="relative group w-full max-w-[340px] sm:max-w-[380px] lg:max-w-[420px] mx-auto p-1.5 sm:p-2 rounded-t-[140px] sm:rounded-t-[180px] lg:rounded-t-[200px] rounded-b-[38px] sm:rounded-b-[46px] bg-gradient-to-b from-amber-400/70 via-amber-600/35 to-stone-900/60 shadow-[0_25px_60px_-15px_rgba(217,119,6,0.35)] transition-transform duration-500 hover:scale-[1.01]">
              {/* Inner Portal Frame */}
              <div className="relative aspect-[4/4.7] sm:aspect-[4/4.6] lg:aspect-[4/4.7] w-full rounded-t-[134px] sm:rounded-t-[172px] lg:rounded-t-[192px] rounded-b-[32px] sm:rounded-b-[40px] overflow-hidden bg-stone-950">
                <Image
                  src="/images/hero-feast.jpg"
                  alt="Authentic Ethiopian Culinary Feast with Doro Wot and Fresh Injera"
                  fill
                  priority
                  sizes="(max-width: 1024px) 90vw, 480px"
                  className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                />

                {/* Subtle vignette gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-black/25 pointer-events-none" />

                {/* Floating Glass Pill: Platter Details */}
                <div className="absolute bottom-3.5 right-3.5 px-3.5 py-1.5 rounded-xl bg-stone-900/85 backdrop-blur-md border border-white/15 text-white flex items-center gap-2.5 shadow-lg">
                  <svg
                    className="w-4 h-4 text-amber-400 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 2v2M8 4v2M16 4v2" />
                    <path d="M3 13c0 3.9 4 7 9 7s9-3.1 9-7H3z" />
                    <path d="M2 13h20" />
                  </svg>
                  <div>
                    <p className="text-[11px] font-bold leading-tight">Authentic Mesob Platter</p>
                    <p className="text-[9px] text-amber-300 font-medium">Clay-Pot Slow Simmered</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Artisanal Heritage Starburst Seal (Top Right) */}
            <div className="absolute top-2 -right-1 sm:top-3 sm:-right-3 z-20 animate-float-slow pointer-events-none select-none">
              <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 p-0.5 shadow-2xl flex items-center justify-center transform rotate-6">
                <div className="w-full h-full rounded-full bg-stone-950/90 border border-amber-300/40 flex flex-col items-center justify-center text-center p-1">
                  <svg
                    className="w-3.5 h-3.5 text-amber-400 mb-0.5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M12 2l2.3 5.4 5.7-1.8-2.6 5.3 5.1 3-5.1 3 2.6 5.3-5.7-1.8L12 22l-2.3-5.4-5.7 1.8 2.6-5.3-5.1-3 5.1-3-2.6-5.3 5.7 1.8L12 2z" />
                  </svg>
                  <span className="text-[10px] sm:text-[11px] font-extrabold text-white leading-tight uppercase tracking-wider">
                    100% Teff
                  </span>
                  <span className="text-[8px] text-amber-300 font-semibold uppercase tracking-widest">
                    Sourdough
                  </span>
                </div>
              </div>
            </div>

            {/* Floating Secondary Satellite Dish: Sizzling Tibs (Bottom Left) */}
            <div className="absolute bottom-4 -left-2 sm:bottom-6 sm:-left-4 lg:-left-5 z-20 animate-float-delayed">
              <div className="flex items-center gap-2.5 p-1.5 sm:p-2 pr-3.5 sm:pr-4 rounded-full bg-stone-950/90 backdrop-blur-md border border-amber-400/40 shadow-2xl hover:scale-105 transition-transform duration-300">
                <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-amber-400 ring-2 ring-amber-500/30 shrink-0">
                  <Image
                    src="/images/dishes/tibs.jpg"
                    alt="Clay pot sizzling tibs"
                    fill
                    sizes="50px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300 leading-tight">
                    <svg
                      className="w-3.5 h-3.5 text-orange-400 shrink-0"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M12 23c-4.97 0-9-3.8-9-8.5C3 9.4 7.2 4.2 11.2 1.3a1 1 0 0 1 1.6.8c-.1 2.2.8 4.2 2.2 5.6 1.8-2 2.5-4 2.5-4s4 4.5 4 8.8c0 4.7-4.03 8.5-9.5 8.5z" />
                    </svg>
                    <span>Sizzling Tibs</span>
                  </div>
                  <p className="text-[9px] sm:text-[10px] text-stone-300 font-medium">Clay-Pot Sautéed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Culinary Pillars */}
      <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm hover:border-amber-700/30 dark:hover:border-amber-500/40 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 flex items-center justify-center font-mono font-bold text-xs mb-4 border border-amber-200/50 dark:border-amber-800/60">
            01
          </div>
          <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-2">Clay Pot Traditions</h3>
          <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
            Slow-simmered in earthen pots using clarified niter kibbeh, whole cardamom, and sun-dried red chilies from the Ethiopian highlands.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm hover:border-amber-700/30 dark:hover:border-amber-500/40 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 flex items-center justify-center font-mono font-bold text-xs mb-4 border border-emerald-200/50 dark:border-emerald-800/60">
            02
          </div>
          <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-2">100% Teff Sourdough</h3>
          <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
            Naturally fermented over four days to cultivate the signature airy spongy eyes that capture every drop of savoury wot sauce.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm hover:border-amber-700/30 dark:hover:border-amber-500/40 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 flex items-center justify-center font-mono font-bold text-xs mb-4 border border-amber-200/50 dark:border-amber-800/60">
            03
          </div>
          <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-2">Vegetarian & Fasting</h3>
          <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
            Rich vegan traditions crafted for fasting Wednesdays and Fridays, featuring slow-cooked split red lentils, yellow split peas, and collards.
          </p>
        </div>
      </section>
    </main>
  );
}
