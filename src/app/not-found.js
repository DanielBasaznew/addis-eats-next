import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="py-24 px-6 max-w-lg mx-auto text-center">
      <span className="text-xs uppercase tracking-widest text-amber-800 dark:text-amber-400 font-bold mb-2 block">
        404 • Missing Dish
      </span>
      <h1 className="text-6xl sm:text-7xl font-black text-amber-950 dark:text-amber-500 tracking-tight m-0 mb-3">
        404
      </h1>
      <h2 className="text-2xl font-extrabold text-stone-900 dark:text-stone-100 m-0 mb-3 tracking-tight">
        Recipe or Page Not Found
      </h2>
      <p className="text-stone-500 dark:text-stone-400 text-sm mb-8 leading-relaxed max-w-sm mx-auto">
        The delicacy or page you were seeking may not exist in our kitchen records. Let us guide you back to our freshest offerings.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-900 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-amber-50 dark:text-white font-bold text-sm shadow-sm transition-all no-underline"
        >
          <span>Explore Today&apos;s Menu</span>
          <span aria-hidden="true">&rarr;</span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-sm transition-all no-underline"
        >
          Return Home
        </Link>
      </div>
    </main>
  );
}
