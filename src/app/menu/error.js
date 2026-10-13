'use client';

export default function MenuError({ error, reset }) {
  return (
    <div className="py-20 px-6 max-w-lg mx-auto text-center">
      <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 font-bold text-lg flex items-center justify-center mx-auto mb-4 border border-rose-200 dark:border-rose-900">
        !
      </div>
      <h2 className="text-2xl font-extrabold text-stone-900 dark:text-stone-100 mb-2 tracking-tight">
        Unable to Load Menu
      </h2>
      <p className="text-sm text-stone-600 dark:text-stone-400 mb-6 leading-relaxed max-w-sm mx-auto">
        We encountered a momentary snag retrieving today&apos;s dishes from our kitchen records. Please try again.
      </p>
      {reset && (
        <button
          type="button"
          onClick={() => reset()}
          className="px-6 py-3 rounded-xl bg-amber-900 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-amber-50 dark:text-white font-bold text-sm shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          Reload Kitchen Menu
        </button>
      )}
    </div>
  );
}
