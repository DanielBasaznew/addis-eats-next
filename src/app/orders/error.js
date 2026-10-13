'use client';

export default function OrdersError({ error, reset }) {
  return (
    <main className="max-w-xl mx-auto px-4 sm:px-6 py-20 text-center">
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-rose-200/90 dark:border-rose-900/60 p-8 sm:p-12 shadow-xs">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-2xl border border-rose-200 dark:border-rose-900/60">
          !
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight mb-2">
          Unable to Load Orders
        </h1>

        <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed mb-6">
          {error?.message || "We encountered an issue retrieving your Ethiopian culinary order history. Please try refreshing."}
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="px-6 py-3 rounded-full bg-amber-900 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white font-bold text-sm transition-colors cursor-pointer shadow-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    </main>
  );
}
