import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import CheckoutForm from '@/components/CheckoutForm';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Checkout · Addis Eats',
  description: 'Complete your Addis Eats order for table dine-in or city-wide delivery.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CheckoutPage() {
  const session = await getSession();

  if (!session) {
    redirect('/signin?next=/checkout');
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <header className="mb-8 pb-4 border-b border-stone-200 dark:border-stone-800">
        <span className="text-xs uppercase tracking-widest text-amber-800 dark:text-amber-400 font-bold mb-1 block">
          Order Placement • Table Service & City Delivery
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
          Complete Your Order
        </h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Review your selection, choose your preferred Ethiopian payment method, and authorize your feast.
        </p>
      </header>
      <Suspense fallback={<div className="text-center py-12 text-sm text-stone-400">Loading checkout...</div>}>
        <CheckoutForm session={session} />
      </Suspense>
    </main>
  );
}
