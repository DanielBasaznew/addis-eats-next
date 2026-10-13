'use client';

import { useActionState, useEffect } from 'react';
import Link from 'next/link';
import { placeOrder } from '@/app/actions';
import { useCart } from './CartProvider';

export default function CheckoutForm() {
  const [state, formAction, isPending] = useActionState(placeOrder, null);
  const { cart, total, clearCart } = useCart();

  useEffect(() => {
    if (state?.success && cart.length > 0) {
      clearCart();
    }
  }, [state?.success, cart.length, clearCart]);

  if (state?.success) {
    return (
      <div className="p-8 sm:p-10 border border-emerald-200 dark:border-emerald-800/60 rounded-3xl bg-white dark:bg-stone-900 shadow-sm text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-800/60">
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-extrabold text-stone-900 dark:text-stone-100 mt-0 mb-2">
          Order Confirmed!
        </h2>

        <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 max-w-md mx-auto">
          Thank you,{' '}
          <strong className="text-stone-900 dark:text-stone-100">{state.order?.name}</strong>. Your
          Ethiopian feast has been received by our kitchen.
        </p>

        <div className="p-4 my-6 rounded-2xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 text-left text-xs sm:text-sm space-y-1.5 max-w-sm mx-auto">
          <div className="flex justify-between">
            <span className="text-stone-500 dark:text-stone-400">Order ID:</span>
            <span className="font-mono font-bold text-stone-800 dark:text-stone-200">
              {state.orderId}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-stone-500 dark:text-stone-400">Contact Phone:</span>
            <span className="font-medium text-stone-800 dark:text-stone-200">
              {state.order?.phone}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-stone-500 dark:text-stone-400">Status:</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
              Kitchen Preparing
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link
            href={`/orders/${state.orderId}`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all no-underline"
          >
            Track Order
          </Link>

          <Link
            href="/menu"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-900 hover:bg-amber-800 text-amber-50 font-bold text-sm shadow-sm transition-all no-underline"
          >
            Back to Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      {state?.authorized === false && (
        <div
          role="alert"
          className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 rounded-2xl text-rose-800 dark:text-rose-200 text-xs sm:text-sm flex items-start gap-2.5"
        >
          <span className="font-bold text-xs uppercase px-2 py-0.5 rounded bg-rose-200/60 dark:bg-rose-900/60 text-rose-900 dark:text-rose-100">
            Alert
          </span>
          <div>
            <strong className="block font-semibold">
              Authorization Error
            </strong>
            <span>{state.error}</span>
          </div>
        </div>
      )}

      {state?.error && state?.authorized !== false && (
        <div
          role="alert"
          className="p-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 rounded-2xl text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex items-start gap-2.5"
        >
          <span className="font-bold text-xs uppercase px-2 py-0.5 rounded bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-100">
            Notice
          </span>
          <div>
            <strong className="block font-semibold">
              Submission Issue
            </strong>
            <span>{state.error}</span>
          </div>
        </div>
      )}

      <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-sm">
        <h3 className="m-0 mb-3 text-sm uppercase tracking-wider text-amber-900 dark:text-amber-400 font-bold">
          Order Summary
        </h3>

        {cart.length === 0 ? (
          <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm m-0">
            Your cart is currently empty.{' '}
            <Link
              href="/menu"
              className="text-amber-800 dark:text-amber-400 font-semibold hover:underline"
            >
              Browse dishes to add items
            </Link>
            .
          </p>
        ) : (
          <div>
            <ul className="list-none p-0 m-0 space-y-2 mb-3">
              {cart.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between items-center text-xs sm:text-sm text-stone-700 dark:text-stone-300"
                >
                  <span>
                    {item.name}{' '}
                    <span className="text-stone-400 dark:text-stone-500">
                      × {item.quantity}
                    </span>
                  </span>

                  <span className="font-semibold text-stone-900 dark:text-stone-100">
                    {item.price * item.quantity} ETB
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex justify-between items-baseline font-bold border-t border-stone-200 dark:border-stone-800 pt-3 text-sm sm:text-base">
              <span className="text-stone-800 dark:text-stone-200">Total Due</span>
              <span className="text-amber-950 dark:text-amber-300 font-extrabold text-lg">
                {total} ETB
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4 bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-sm">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="name"
            className="font-semibold text-xs text-stone-700 dark:text-stone-300 uppercase tracking-wide"
          >
            Customer Name <span className="text-rose-600">*</span>
          </label>

          <input
            id="name"
            name="name"
            type="text"
            placeholder="e.g. Daniel Basaznew"
            className={`px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-900/20 dark:focus:ring-amber-500/20 focus:border-amber-900 dark:focus:border-amber-500 ${
              state?.fieldErrors?.name
                ? 'border-rose-400 bg-rose-50/20 dark:bg-rose-950/20 dark:border-rose-700'
                : 'border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500'
            }`}
          />

          {state?.fieldErrors?.name && (
            <p className="text-rose-600 dark:text-rose-400 text-xs mt-1 m-0 font-medium">
              {state.fieldErrors.name.join(', ')}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="phone"
            className="font-semibold text-xs text-stone-700 dark:text-stone-300 uppercase tracking-wide"
          >
            Phone Number <span className="text-rose-600">*</span>
          </label>

          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="e.g. 0912345678 or +251912345678"
            className={`px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-900/20 dark:focus:ring-amber-500/20 focus:border-amber-900 dark:focus:border-amber-500 ${
              state?.fieldErrors?.phone
                ? 'border-rose-400 bg-rose-50/20 dark:bg-rose-950/20 dark:border-rose-700'
                : 'border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500'
            }`}
          />

          {state?.fieldErrors?.phone && (
            <p className="text-rose-600 dark:text-rose-400 text-xs mt-1 m-0 font-medium">
              {state.fieldErrors.phone.join(', ')}
            </p>
          )}
        </div>

        <div className="p-3.5 border border-dashed border-stone-300 dark:border-stone-700 rounded-xl bg-stone-50/80 dark:bg-stone-800/60">
          <label
            htmlFor="authorized"
            className="flex items-start gap-2.5 cursor-pointer text-xs font-medium text-stone-700 dark:text-stone-300 select-none"
          >
            <input
              id="authorized"
              name="authorized"
              type="checkbox"
              value="true"
              defaultChecked
              className="w-4 h-4 rounded border-stone-300 dark:border-stone-600 text-amber-900 focus:ring-amber-900 cursor-pointer mt-0.5"
            />

            <div>
              <span className="font-semibold text-stone-900 dark:text-stone-100 block">
                Authenticated as Customer
              </span>

              <span className="text-[11px] text-stone-500 dark:text-stone-400 font-normal">
                Uncheck to verify server-side authorization rejection in the
                Server Action.
              </span>
            </div>
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className={`w-full py-4 px-6 rounded-xl font-bold text-sm tracking-wide text-white transition-all shadow-md cursor-pointer ${
          isPending
            ? 'bg-stone-400 dark:bg-stone-700 cursor-not-allowed shadow-none'
            : 'bg-amber-900 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 hover:shadow-amber-950/20 active:scale-[0.99]'
        }`}
      >
        {isPending ? 'Submitting to Kitchen...' : 'Place Order Now →'}
      </button>
    </form>
  );
}