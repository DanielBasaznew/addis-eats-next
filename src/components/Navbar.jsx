'use client';

import Link from 'next/link';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

export default function Navbar() {
  const { data } = useSWR('/api/session', fetcher, {
    revalidateOnFocus: true,
  });

  const isAuthenticated = Boolean(data?.authenticated && data?.session);
  const isStaff = isAuthenticated && data.session.role === 'staff';
  const username = data?.session?.id;
  const role = data?.session?.role;

  return (
    <nav className="flex items-center gap-1.5 sm:gap-2">
      <Link
        href="/menu"
        className="px-3 sm:px-4 py-2 rounded-full text-sm font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition-colors no-underline"
      >
        Menu
      </Link>
      <Link
        href="/favorites"
        className="px-3 sm:px-4 py-2 rounded-full text-sm font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition-colors no-underline"
      >
        Favorites
      </Link>
      <Link
        href="/orders"
        className="px-3 sm:px-4 py-2 rounded-full text-sm font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition-colors no-underline"
      >
        Orders
      </Link>
      <Link
        href="/cart"
        className="px-3 sm:px-4 py-2 rounded-full text-sm font-medium bg-amber-50 text-amber-900 hover:bg-amber-100 transition-colors no-underline flex items-center gap-1.5"
      >
        <span>Cart</span>
      </Link>

      {/* Staff-only Kitchen and Admin Dashboard links */}
      {isStaff && (
        <>
          <Link
            href="/kitchen"
            className="px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-950 hover:bg-amber-200 transition-colors no-underline flex items-center gap-1 border border-amber-300"
          >
            <span>Kitchen</span>
          </Link>
          <Link
            href="/admin"
            className="px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold bg-stone-900 text-amber-400 hover:bg-stone-800 transition-colors no-underline flex items-center gap-1 shadow-xs"
          >
            <span>Admin</span>
          </Link>
        </>
      )}

      <div className="h-4 w-px bg-stone-200 mx-1 hidden sm:block" />

      {isAuthenticated ? (
        <div className="flex items-center gap-2">
          {/* User Status Badge */}
          <div className="hidden md:flex items-center gap-1.5 text-xs bg-stone-100 text-stone-700 px-2.5 py-1 rounded-full border border-stone-200">
            <span className="font-semibold text-stone-900">{username}</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                isStaff
                  ? 'bg-amber-200 text-amber-950 border border-amber-300'
                  : 'bg-stone-200 text-stone-700'
              }`}
            >
              {role}
            </span>
          </div>

          {/* Sign Out Button */}
          <Link
            href="/signout"
            className="px-3.5 py-1.5 rounded-full text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors no-underline border border-stone-200"
          >
            Sign Out
          </Link>
        </div>
      ) : (
        /* Sign In Button */
        <Link
          href="/signin"
          className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-colors no-underline"
        >
          Sign In
        </Link>
      )}
    </nav>
  );
}
