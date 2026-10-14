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
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-rose-200/90 dark:border-rose-900/60 p-8 sm:p-12 shadow-xs">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-2xl">
            &times;
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight mb-2">
            Staff Access Required
          </h1>
          <p className="text-stone-600 dark:text-stone-400 text-sm sm:text-base leading-relaxed mb-6">
            This dashboard is restricted to staff members. Your current session does not possess administrative privileges.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/menu"
              className="px-5 py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white font-semibold text-sm transition-colors no-underline"
            >
              Back to Menu
            </Link>
            <Link
              href="/signin?next=/admin"
              className="px-5 py-2.5 rounded-full border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 font-semibold text-sm hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors no-underline"
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
    <main className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
      <AdminDishManager initialDishes={dishes} session={session} />
    </main>
  );
}
