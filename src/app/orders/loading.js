export default function OrdersLoading() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 md:py-14 animate-pulse">
      {/* Skeleton Header */}
      <header className="mb-8 pb-6 border-b border-stone-200 dark:border-stone-800">
        <div className="h-3 w-28 bg-stone-200 dark:bg-stone-800 rounded-md mb-2" />
        <div className="h-9 w-52 bg-stone-200 dark:bg-stone-800 rounded-lg mb-2" />
        <div className="h-4 w-72 bg-stone-100 dark:bg-stone-800/60 rounded-md" />
      </header>

      {/* Table Skeleton matching exact 5-row structure */}
      <div className="overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">
        {/* Skeleton Table Header */}
        <div className="h-12 bg-stone-50 dark:bg-stone-800/70 border-b border-stone-200 dark:border-stone-800 flex items-center px-5 gap-4">
          <div className="h-3.5 w-28 bg-stone-200 dark:bg-stone-700 rounded" />
          <div className="h-3.5 w-16 bg-stone-200 dark:bg-stone-700 rounded hidden sm:block" />
          <div className="h-3.5 w-20 bg-stone-200 dark:bg-stone-700 rounded" />
          <div className="h-3.5 w-24 bg-stone-200 dark:bg-stone-700 rounded ml-auto" />
          <div className="h-3.5 w-14 bg-stone-200 dark:bg-stone-700 rounded" />
        </div>

        {/* 5 Skeleton Rows */}
        <div className="divide-y divide-stone-100 dark:divide-stone-800">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="px-5 py-4 flex items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="h-4 w-28 bg-stone-200 dark:bg-stone-800 rounded font-mono" />
                <div className="h-3 w-36 bg-stone-100 dark:bg-stone-800/60 rounded" />
              </div>

              <div className="h-5 w-20 bg-stone-100 dark:bg-stone-800 rounded hidden sm:block" />

              <div className="h-6 w-20 bg-stone-200 dark:bg-stone-800 rounded-full" />

              <div className="h-5 w-24 bg-stone-200 dark:bg-stone-800 rounded" />

              <div className="h-7 w-16 bg-stone-200 dark:bg-stone-800 rounded-lg" />
            </div>
          ))}
        </div>

        {/* Skeleton Footer */}
        <div className="h-10 bg-stone-50/70 dark:bg-stone-800/40 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between px-5">
          <div className="h-3 w-32 bg-stone-200 dark:bg-stone-800 rounded" />
          <div className="h-3 w-28 bg-stone-200 dark:bg-stone-800 rounded" />
        </div>
      </div>
    </main>
  );
}
