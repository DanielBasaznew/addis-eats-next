'use client';

import Link from 'next/link';
import { useCart } from '@/components/CartProvider';

export default function CartPage() {
  const { cart, removeFromCart, total, clearCart } = useCart();

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-14">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
          Your Order Cart
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Review your selected traditional dishes before completing your order.
        </p>
      </header>

      {cart.length === 0 ? (
        <div className="text-center py-16 px-6 border border-dashed border-stone-300 rounded-3xl bg-white shadow-sm max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-900 flex items-center justify-center text-xs font-bold uppercase tracking-wider mx-auto mb-4 border border-amber-200">
            Cart
          </div>
          <h2 className="text-xl font-bold text-stone-900 mb-1.5">Your cart is currently empty</h2>
          <p className="text-sm text-stone-500 mb-6 max-w-xs mx-auto">
            Discover hearty stews, fresh injera, and vegan platters from our authentic kitchen.
          </p>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-900 hover:bg-amber-800 text-amber-50 font-bold text-sm shadow-sm transition-all no-underline"
          >
            <span>Explore Menu</span>
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <ul className="list-none p-0 m-0 space-y-3">
            {cart.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-sm"
              >
                <div>
                  <h3 className="m-0 text-base font-bold text-stone-900">
                    {item.name}
                  </h3>
                  <p className="m-0 text-xs text-stone-500 mt-1">
                    {item.quantity} × {item.price} ETB
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-extrabold text-amber-950 text-base">
                    {item.price * item.quantity} <span className="text-xs font-semibold text-stone-500">ETB</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="px-2.5 py-1 text-xs font-semibold text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="p-6 rounded-2xl bg-amber-50/60 border border-amber-200/70 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-amber-900 font-bold block">
                Order Total
              </span>
              <span className="text-xs text-stone-500">Inclusive of fresh teff injera & spices</span>
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold text-amber-950">
                {total}
              </span>
              <span className="text-sm font-bold text-amber-800 ml-1.5">ETB</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={clearCart}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-100 text-xs font-semibold transition-colors cursor-pointer"
              >
                Clear Cart
              </button>
              <Link
                href="/menu"
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-amber-900/30 text-amber-900 hover:bg-amber-50 text-xs font-semibold transition-colors text-center no-underline"
              >
                Add More Dishes
              </Link>
            </div>
            <Link
              href="/checkout"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-amber-900 hover:bg-amber-800 text-amber-50 font-bold text-sm shadow-md hover:shadow-amber-950/20 transition-all no-underline"
            >
              <span>Proceed to Checkout</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
