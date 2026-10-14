import './globals.css';
import Link from 'next/link';
import { Inter } from 'next/font/google';
import { CartProvider } from '@/components/CartProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import Navbar from '@/components/Navbar';
import { getSession } from '@/lib/session';


const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'https://addiseats.et');

const baseUrl = siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`;

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    template: '%s · Addis Eats',
    default: 'Addis Eats — Authentic Ethiopian Kitchen',
  },
  description:
    'Handcrafted Ethiopian dishes, slow-simmered wots, and fresh daily teff injera delivered across Addis Ababa.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Addis Eats — Authentic Ethiopian Kitchen',
    description:
      'Handcrafted Ethiopian dishes, slow-simmered wots, and fresh daily teff injera delivered across Addis Ababa.',
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
    title: 'Addis Eats — Authentic Ethiopian Kitchen',
    description:
      'Handcrafted Ethiopian dishes, slow-simmered wots, and fresh daily teff injera delivered across Addis Ababa.',
    images: ['/images/hero-feast.jpg'],
  },
};

export default async function RootLayout({ children }) {
  const session = await getSession();

  const themeScript = `
    (function() {
      try {
        var stored = localStorage.getItem('addis_eats_theme');
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        var isDark = stored === 'dark' || ((!stored || stored === 'system') && prefersDark);
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (e) {}
    })();
  `;

  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className="min-h-screen flex flex-col bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100 font-sans antialiased selection:bg-amber-500/30 selection:text-amber-950 dark:selection:text-amber-200 transition-colors duration-200"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <CartProvider>
            <header className="sticky top-0 z-40 bg-white/95 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 transition-colors">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                <Link href="/" className="group flex items-center gap-2.5 no-underline">
                  <span className="w-8 h-8 rounded-lg bg-amber-900 dark:bg-amber-600 text-amber-100 dark:text-stone-950 flex items-center justify-center font-bold text-xs shadow-sm ring-1 ring-amber-950/20 dark:ring-amber-500/30">
                    AE
                  </span>
                  <span className="flex flex-col">
                    <span className="font-semibold text-lg text-stone-900 dark:text-stone-100 tracking-tight group-hover:text-amber-900 dark:group-hover:text-amber-400 transition-colors">
                      Addis Eats
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-amber-800 dark:text-amber-400 font-medium -mt-0.5">
                      Ethiopian Kitchen
                    </span>
                  </span>
                </Link>

                <Navbar initialSession={session} />
              </div>
            </header>

            <div className="flex-1">{children}</div>

            <footer className="bg-stone-900 dark:bg-stone-950 text-stone-400 dark:text-stone-400 mt-20 border-t border-stone-800 dark:border-stone-900 text-sm transition-colors">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded bg-amber-800 dark:bg-amber-600 text-amber-100 dark:text-stone-950 flex items-center justify-center font-bold text-[10px]">
                      AE
                    </span>
                    <span className="font-semibold text-stone-200 text-base">
                      Addis Eats
                    </span>
                  </div>
                  <p className="text-stone-400 text-xs leading-relaxed max-w-sm">
                    Celebrating Ethiopian culinary heritage through time-honored clay-pot cooking, hand-ground berbere, and fresh sourdough injera.
                  </p>
                </div>

                <div>
                  <h4 className="text-stone-200 font-semibold text-xs uppercase tracking-wider mb-3">
                    Kitchen Hours
                  </h4>
                  <ul className="space-y-1.5 text-xs text-stone-400">
                    <li>Monday – Friday: 10:00 AM – 10:00 PM</li>
                    <li>Saturday – Sunday: 9:00 AM – 11:00 PM</li>
                    <li className="text-amber-500 font-medium">
                      Bole Road & Kazanchis, Addis Ababa
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-stone-200 font-semibold text-xs uppercase tracking-wider mb-3">
                    Quick Navigation
                  </h4>
                  <div className="flex flex-col gap-2 text-xs">
                    <Link href="/menu" className="hover:text-amber-400 transition-colors">
                      Explore Dishes
                    </Link>
                    <Link href="/favorites" className="hover:text-amber-400 transition-colors">
                      My Favorites
                    </Link>
                    <Link href="/cart" className="hover:text-amber-400 transition-colors">
                      View Shopping Cart
                    </Link>
                    <Link href="/checkout" className="hover:text-amber-400 transition-colors">
                      Fast Checkout
                    </Link>
                    <Link href="/orders" className="hover:text-amber-400 transition-colors">
                      My Orders
                    </Link>
                    <Link href="/kitchen" className="hover:text-amber-400 transition-colors">
                      Kitchen
                    </Link>
                    <Link href="/admin" className="hover:text-amber-400 transition-colors">
                      Admin Dashboard
                    </Link>
                    <Link href="/signin" className="hover:text-amber-400 transition-colors">
                      Sign In
                    </Link>
                    <Link href="/signout" className="hover:text-amber-400 transition-colors">
                      Sign Out
                    </Link>
                  </div>
                </div>
              </div>

              <div className="border-t border-stone-800/80 max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-2">
                <p>&copy; 2026 Addis Eats. Developed by Daniel Basaznew.</p>
                <p>IBT College Canada &bull; Full Stack Module 3</p>
              </div>
            </footer>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}