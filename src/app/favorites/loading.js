export default function FavoritesLoading() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-12 animate-pulse">
      <header className="mb-8 pb-6 border-b border-stone-200">
        <div className="h-4 w-32 bg-stone-200 rounded mb-3" />
        <div className="h-10 w-64 bg-stone-300 rounded mb-2" />
        <div className="h-4 w-96 bg-stone-200 rounded" />
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="w-full h-44 bg-stone-200 rounded-xl mb-4" />
              <div className="flex justify-between items-center mb-3">
                <div className="h-5 w-16 bg-stone-200 rounded-full" />
                <div className="h-5 w-20 bg-stone-200 rounded-full" />
              </div>
              <div className="h-6 w-3/4 bg-stone-300 rounded mb-3" />
              <div className="h-4 w-full bg-stone-100 rounded mb-1" />
              <div className="h-4 w-2/3 bg-stone-100 rounded" />
            </div>
            <div className="mt-5 pt-4 border-t border-stone-100 flex justify-between items-center">
              <div className="h-6 w-16 bg-stone-200 rounded" />
              <div className="h-9 w-24 bg-stone-200 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
