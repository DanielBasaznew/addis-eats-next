'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOutAction } from '@/app/actions';

export default function Navbar({ initialSession = null }) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Directly use the session passed from the server layout
  const isAuthenticated = Boolean(initialSession?.id);
  const isStaff = isAuthenticated && initialSession?.role === 'staff';
  const username = initialSession?.id;
  const role = initialSession?.role;
  const initial = (username?.trim()?.charAt(0) || 'U').toUpperCase();
  const roleDisplay = role === 'staff' ? 'Staff' : 'Customer';

  const handleSignOut = async (e) => {
    e.preventDefault();
    if (isSigningOut) return;
    setIsSigningOut(true);

    try {
      await signOutAction();
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Sign out failed:', err);
    } finally {
      setIsSigningOut(false);
    }
  };

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
            className="px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-950 hover:bg-amber-200 transition-colors no-underline flex items-center gap-1 border border-amber-300"
          >
            <span>Admin</span>
          </Link>
        </>
      )}

      <div className="h-4 w-px bg-stone-200 mx-1 hidden sm:block" />

      {isAuthenticated ? (
        <div className="flex items-center gap-2">
          {/* User Status Badge: e.g. D Customer or D Staff */}
          <div
            title={`Signed in as ${username} (${roleDisplay})`}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border transition-colors ${
              isStaff
                ? 'bg-amber-50 text-amber-950 border-amber-300'
                : 'bg-stone-100 text-stone-800 border-stone-200'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-[11px] font-bold shrink-0 ${
                isStaff ? 'avatar-badge-staff' : 'avatar-badge-customer'
              }`}
            >
              {initial}
            </span>
            <span className="font-semibold text-xs whitespace-nowrap">
              {roleDisplay}
            </span>
            <span className="hidden lg:inline text-stone-500 font-normal">
              · {username}
            </span>
          </div>

          {/* Instant Sign Out Button */}
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="px-3.5 py-1.5 rounded-full text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors border border-stone-200 cursor-pointer disabled:opacity-50"
          >
            {isSigningOut ? 'Signing out...' : 'Sign Out'}
          </button>
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

