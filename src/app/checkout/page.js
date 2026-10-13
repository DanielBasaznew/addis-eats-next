import { redirect } from 'next/navigation';
import CheckoutForm from '@/components/CheckoutForm';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Checkout',
  description: 'Complete your Addis Eats order with authentic Ethiopian cuisine.',
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
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 md:py-14">
      <header className="mb-8 pb-4 border-b border-stone-200 dark:border-stone-800">
        <span className="text-xs uppercase tracking-widest text-amber-800 dark:text-amber-400 font-bold mb-1 block">
          Order Placement • Fast Delivery
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
          Complete Your Order
        </h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Provide your name and phone number for kitchen preparation and courier dispatch.
        </p>
      </header>
      <CheckoutForm />
    </main>
  );
}
