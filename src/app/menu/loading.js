export default function MenuLoading() {
  return (
    <div className="py-24 px-6 max-w-md mx-auto text-center">
      <div className="inline-block w-10 h-10 border-4 border-amber-200 dark:border-amber-900/60 border-t-amber-900 dark:border-t-amber-400 rounded-full animate-spin mb-5" />
      <h2 className="text-xl font-extrabold text-stone-900 dark:text-stone-100 m-0 tracking-tight">
        Preparing Addis Eats Menu
      </h2>
      <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm mt-2 leading-relaxed">
        Simmering our slow-cooked wots and baking fresh teff injera for your table...
      </p>
    </div>
  );
}
