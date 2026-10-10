'use client';

export default function MenuError({ error, reset }) {
  return (
    <div className="py-20 px-6 max-w-lg mx-auto text-center">
      <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-700 font-bold text-lg flex items-center justify-center mx-auto mb-4 border border-rose-200">
        !
      </div>
      <h2 className="text-2xl font-extrabold text-stone-900 mb-2 tracking-tight">
        Unable to Load Menu
      </h2>
      <p className="text-sm text-stone-600 mb-6 leading-relaxed max-w-sm mx-auto">
        We encountered a momentary snag retrieving today&apos;s dishes from our kitchen records. Please try again.
      </p>
      {reset && (
        <button
          type="button"
          onClick={() => reset()}
          className="px-6 py-3 rounded-xl bg-amber-900 hover:bg-amber-800 text-amber-50 font-bold text-sm shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          Reload Kitchen Menu
        </button>
      )}
    </div>
  );
}
