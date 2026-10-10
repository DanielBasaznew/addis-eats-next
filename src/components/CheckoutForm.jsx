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
      <div className="p-8 sm:p-10 border border-emerald-200 rounded-3xl bg-white shadow-sm text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
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

        <h2 className="text-2xl font-extrabold text-stone-900 mt-0 mb-2">
          Order Confirmed!
        </h2>

        <p className="text-sm sm:text-base text-stone-600 max-w-md mx-auto">
          Thank you,{' '}
          <strong className="text-stone-900">{state.order?.name}</strong>. Your
          Ethiopian feast has been received by our kitchen.
        </p>

        <div className="p-4 my-6 rounded-2xl bg-stone-50 border border-stone-200 text-left text-xs sm:text-sm space-y-1.5 max-w-sm mx-auto">
          <div className="flex justify-between">
            <span className="text-stone-500">Order ID:</span>
            <span className="font-mono font-bold text-stone-800">
              {state.orderId}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-stone-500">Contact Phone:</span>
            <span className="font-medium text-stone-800">
              {state.order?.phone}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-stone-500">Status:</span>
            <span className="text-emerald-700 font-semibold">
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
          className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs sm:text-sm flex items-start gap-2.5"
        >
          <span className="font-bold text-xs uppercase px-2 py-0.5 rounded bg-rose-200/60 text-rose-900">
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
          className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs sm:text-sm flex items-start gap-2.5"
        >
          <span className="font-bold text-xs uppercase px-2 py-0.5 rounded bg-amber-200/60 text-amber-900">
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

      <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-sm">
        <h3 className="m-0 mb-3 text-sm uppercase tracking-wider text-amber-900 font-bold">
          Order Summary
        </h3>

        {cart.length === 0 ? (
          <p className="text-stone-500 text-xs sm:text-sm m-0">
            Your cart is currently empty.{' '}
            <Link
              href="/menu"
              className="text-amber-800 font-semibold hover:underline"
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
                  className="flex justify-between items-center text-xs sm:text-sm text-stone-700"
                >
                  <span>
                    {item.name}{' '}
                    <span className="text-stone-400">
                      × {item.quantity}
                    </span>
                  </span>

                  <span className="font-semibold text-stone-900">
                    {item.price * item.quantity} ETB
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex justify-between items-baseline font-bold border-t border-stone-200 pt-3 text-sm sm:text-base">
              <span className="text-stone-800">Total Due</span>
              <span className="text-amber-950 font-extrabold text-lg">
                {total} ETB
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4 bg-white p-5 rounded-2xl border border-stone-200/90 shadow-sm">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="name"
            className="font-semibold text-xs text-stone-700 uppercase tracking-wide"
          >
            Customer Name <span className="text-rose-600">*</span>
          </label>

          <input
            id="name"
            name="name"
            type="text"
            placeholder="e.g. Daniel Basaznew"
            className={`px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900 ${
              state?.fieldErrors?.name
                ? 'border-rose-400 bg-rose-50/20'
                : 'border-stone-300 bg-white'
            }`}
          />

          {state?.fieldErrors?.name && (
            <p className="text-rose-600 text-xs mt-1 m-0 font-medium">
              {state.fieldErrors.name.join(', ')}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="phone"
            className="font-semibold text-xs text-stone-700 uppercase tracking-wide"
          >
            Phone Number <span className="text-rose-600">*</span>
          </label>

          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="e.g. 0912345678 or +251912345678"
            className={`px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900 ${
              state?.fieldErrors?.phone
                ? 'border-rose-400 bg-rose-50/20'
                : 'border-stone-300 bg-white'
            }`}
          />

          {state?.fieldErrors?.phone && (
            <p className="text-rose-600 text-xs mt-1 m-0 font-medium">
              {state.fieldErrors.phone.join(', ')}
            </p>
          )}
        </div>

        <div className="p-3.5 border border-dashed border-stone-300 rounded-xl bg-stone-50/80">
          <label
            htmlFor="authorized"
            className="flex items-start gap-2.5 cursor-pointer text-xs font-medium text-stone-700 select-none"
          >
            <input
              id="authorized"
              name="authorized"
              type="checkbox"
              value="true"
              defaultChecked
              className="w-4 h-4 rounded border-stone-300 text-amber-900 focus:ring-amber-900 cursor-pointer mt-0.5"
            />

            <div>
              <span className="font-semibold text-stone-900 block">
                Authenticated as Customer
              </span>

              <span className="text-[11px] text-stone-500 font-normal">
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
            ? 'bg-stone-400 cursor-not-allowed shadow-none'
            : 'bg-amber-900 hover:bg-amber-800 hover:shadow-amber-950/20 active:scale-[0.99]'
        }`}
      >
        {isPending ? 'Submitting to Kitchen...' : 'Place Order Now →'}
      </button>
    </form>
  );
}