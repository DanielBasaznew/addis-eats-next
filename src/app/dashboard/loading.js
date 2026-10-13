export default function DashboardLoading() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14 animate-pulse">
      {/* Skeleton Header */}
      <header className="mb-8 pb-6 border-b border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="h-3.5 w-36 bg-stone-200 dark:bg-stone-800 rounded mb-2" />
          <div className="h-9 w-64 bg-stone-200 dark:bg-stone-800 rounded-lg mb-2" />
          <div className="h-4 w-96 max-w-full bg-stone-100 dark:bg-stone-800/60 rounded" />
        </div>
        <div className="h-9 w-28 bg-stone-200 dark:bg-stone-800 rounded-xl" />
      </header>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800"
          >
            <div className="h-3 w-20 bg-stone-200 dark:bg-stone-800 rounded mb-2" />
            <div className="h-8 w-28 bg-stone-200 dark:bg-stone-800 rounded-lg mb-2" />
            <div className="h-3 w-24 bg-stone-100 dark:bg-stone-800/60 rounded" />
          </div>
        ))}
      </div>

      {/* 2 Chart Cards Skeleton */}
      <div className="space-y-10">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8"
          >
            <div className="h-6 w-56 bg-stone-200 dark:bg-stone-800 rounded mb-2" />
            <div className="h-4 w-80 max-w-full bg-stone-100 dark:bg-stone-800/60 rounded mb-6" />
            <div className="h-[320px] rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800" />
          </div>
        ))}
      </div>
    </main>
  );
}
