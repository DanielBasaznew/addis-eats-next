export default function AdminLoading() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-12 animate-pulse">
      <header className="mb-8 pb-6 border-b border-stone-200 dark:border-stone-800">
        <div className="h-4 w-36 bg-stone-200 dark:bg-stone-800 rounded mb-3" />
        <div className="h-10 w-72 bg-stone-300 dark:bg-stone-700 rounded mb-2" />
        <div className="h-4 w-96 bg-stone-200 dark:bg-stone-800 rounded" />
      </header>

      {/* Metrics Skeletons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
            <div className="h-3 w-20 bg-stone-200 dark:bg-stone-800 rounded mb-2" />
            <div className="h-8 w-14 bg-stone-300 dark:bg-stone-700 rounded" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs p-6">
        <div className="h-10 w-full bg-stone-100 dark:bg-stone-800 rounded-xl mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 w-full bg-stone-50 dark:bg-stone-800/50 rounded-xl" />
          ))}
        </div>
      </div>
    </main>
  );
}
