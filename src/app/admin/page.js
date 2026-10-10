import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { getDishes } from '@/lib/dishes';
import AdminDishManager from '@/components/AdminDishManager';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin Dish Management · Addis Eats',
  description: 'Staff-only dashboard for listing, creating, editing, and deleting dishes.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  const session = await getSession();

  if (!session) {
    redirect('/signin?next=/admin');
  }

  if (session.role !== 'staff') {
    return (
      <main className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl border border-rose-200/90 p-8 sm:p-12 shadow-xs">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-2xl">
            &times;
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mb-2">
            Staff Access Required
          </h1>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed mb-6">
            This dashboard is restricted to staff members. Your current session does not possess administrative privileges.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/menu"
              className="px-5 py-2.5 rounded-full bg-stone-900 text-white font-semibold text-sm hover:bg-stone-800 transition-colors no-underline"
            >
              Back to Menu
            </Link>
            <Link
              href="/signin?next=/admin"
              className="px-5 py-2.5 rounded-full border border-stone-200 text-stone-700 font-semibold text-sm hover:bg-stone-50 transition-colors no-underline"
            >
              Sign In as Staff
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const dishes = await getDishes();

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-12">
      {/* Header */}
      <header className="mb-8 pb-6 border-b border-stone-200">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs uppercase tracking-widest text-amber-900 font-bold block">
                Back-of-House Administration
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold uppercase">
                Staff Verified
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              Dish Catalog Management
            </h1>
            <p className="mt-2 text-stone-600 text-sm sm:text-base max-w-2xl">
              Create, update, and manage Ethiopian culinary offerings across the public menu. All changes propagate with ISR revalidation.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Link
              href="/kitchen"
              className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 font-semibold text-xs hover:bg-stone-200 transition-colors no-underline"
            >
              Kitchen Orders &rarr;
            </Link>
            <Link
              href="/menu"
              target="_blank"
              className="px-4 py-2 rounded-xl bg-amber-900 text-white font-semibold text-xs hover:bg-amber-950 transition-colors no-underline"
            >
              View Live Menu &nearr;
            </Link>
          </div>
        </div>
      </header>

      {/* Main Admin Interactive Manager */}
      <AdminDishManager initialDishes={dishes} />
    </main>
  );
}
