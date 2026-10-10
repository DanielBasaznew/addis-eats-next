import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="py-24 px-6 max-w-lg mx-auto text-center">
      <span className="text-xs uppercase tracking-widest text-amber-800 font-bold mb-2 block">
        404 • Missing Dish
      </span>
      <h1 className="text-6xl sm:text-7xl font-black text-amber-950 tracking-tight m-0 mb-3">
        404
      </h1>
      <h2 className="text-2xl font-extrabold text-stone-900 m-0 mb-3 tracking-tight">
        Recipe or Page Not Found
      </h2>
      <p className="text-stone-500 text-sm mb-8 leading-relaxed max-w-sm mx-auto">
        The delicacy or page you were seeking may not exist in our kitchen records. Let us guide you back to our freshest offerings.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-900 hover:bg-amber-800 text-amber-50 font-bold text-sm shadow-sm transition-all no-underline"
        >
          <span>Explore Today&apos;s Menu</span>
          <span aria-hidden="true">&rarr;</span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 font-semibold text-sm transition-all no-underline"
        >
          Return Home
        </Link>
      </div>
    </main>
  );
}
