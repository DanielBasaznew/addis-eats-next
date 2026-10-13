'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { signOutAction } from '@/app/actions';
import { useCart } from '@/components/CartProvider';
import ThemeToggle from '@/components/ThemeToggle';

export default function Navbar({ initialSession = null }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { cart } = useCart();

  const totalCartCount =
    cart?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;

  // Close mobile drawer whenever user navigates
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
      setIsOpen(false);
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Sign out failed:', err);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div>
      {/* Desktop Navigation (>= md screens) */}
      <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
        <Link
          href="/menu"
          className="px-3 py-2 rounded-full text-sm font-medium text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors no-underline"
        >
          Menu
        </Link>
        <Link
          href="/favorites"
          className="px-3 py-2 rounded-full text-sm font-medium text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors no-underline"
        >
          Favorites
        </Link>
        <Link
          href="/orders"
          className="px-3 py-2 rounded-full text-sm font-medium text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors no-underline"
        >
          Orders
        </Link>
        <Link
          href="/cart"
          className="px-3.5 py-2 rounded-full text-sm font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors no-underline flex items-center gap-1.5 border border-amber-200/50 dark:border-amber-800/60"
        >
          <span>Cart</span>
          {totalCartCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-900 dark:bg-amber-500 text-white dark:text-stone-950 text-[11px] font-bold flex items-center justify-center">
              {totalCartCount}
            </span>
          )}
        </Link>

        {/* Staff-only Kitchen and Admin Dashboard links */}
        {isStaff && (
          <>
            <Link
              href="/kitchen"
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/70 text-amber-950 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors no-underline flex items-center gap-1 border border-amber-300 dark:border-amber-800"
            >
              <span>Kitchen</span>
            </Link>
            <Link
              href="/admin"
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/70 text-amber-950 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors no-underline flex items-center gap-1 border border-amber-300 dark:border-amber-800"
            >
              <span>Admin</span>
            </Link>
          </>
        )}

        {/* Theme Toggle Button */}
        <ThemeToggle />

        <div className="h-4 w-px bg-stone-200 dark:bg-stone-800 mx-1" />

        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            {/* User Status Badge */}
            <div
              title={`Signed in as ${username} (${roleDisplay})`}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border transition-colors ${
                isStaff
                  ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-950 dark:text-amber-200 border-amber-300 dark:border-amber-800'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border-stone-200 dark:border-stone-700'
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
              <span className="hidden lg:inline text-stone-500 dark:text-stone-400 font-normal">
                · {username}
              </span>
            </div>

            {/* Instant Sign Out Button */}
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors border border-stone-200 dark:border-stone-700 cursor-pointer disabled:opacity-50"
            >
              {isSigningOut ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        ) : (
          /* Sign In Button */
          <Link
            href="/signin"
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-stone-900 dark:bg-amber-500 text-white dark:text-stone-950 hover:bg-stone-800 dark:hover:bg-amber-400 transition-colors no-underline shadow-xs"
          >
            Sign In
          </Link>
        )}
      </nav>

      {/* Mobile Top Bar Controls (< md screens) */}
      <div className="flex md:hidden items-center gap-1.5">
        {/* Mobile Theme Toggle Button */}
        <ThemeToggle size="sm" />

        <Link
          href="/cart"
          className="relative p-2 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors no-underline flex items-center justify-center"
          aria-label="View Cart"
        >
          <svg
            className="w-5 h-5 text-stone-800 dark:text-stone-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          {totalCartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-amber-900 dark:bg-amber-500 text-white dark:text-stone-950 text-[10px] font-bold flex items-center justify-center shadow-xs">
              {totalCartCount}
            </span>
          )}
        </Link>

        {/* Hamburger Toggle Button */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="p-2 rounded-xl text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-900/20"
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          <div className="w-5 h-4 flex flex-col justify-between">
            <span
              className={`h-0.5 w-full bg-stone-800 dark:bg-stone-200 rounded-full transition-transform duration-300 origin-left ${
                isOpen ? 'rotate-45 translate-x-0.5 -translate-y-0.5' : ''
              }`}
            />
            <span
              className={`h-0.5 w-full bg-stone-800 dark:bg-stone-200 rounded-full transition-opacity duration-300 ${
                isOpen ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <span
              className={`h-0.5 w-full bg-stone-800 dark:bg-stone-200 rounded-full transition-transform duration-300 origin-left ${
                isOpen ? '-rotate-45 translate-x-0.5 translate-y-0.5' : ''
              }`}
            />
          </div>
        </button>
      </div>

      {/* Mobile Menu Dropdown Drawer */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 top-16 bg-stone-900/40 dark:bg-black/60 backdrop-blur-xs z-40 md:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Menu Panel */}
          <div className="fixed top-16 left-0 right-0 z-50 bg-white dark:bg-stone-900 border-b border-stone-200/90 dark:border-stone-800 shadow-2xl p-5 md:hidden animate-in slide-in-from-top-2 duration-200 max-h-[calc(100vh-4.5rem)] overflow-y-auto">
            <div className="flex flex-col space-y-2">
              <Link
                href="/menu"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors no-underline"
              >
                <span>🍽️ Menu</span>
                <span className="text-stone-400 dark:text-stone-500 text-xs font-normal">Explore dishes &rarr;</span>
              </Link>
              <Link
                href="/favorites"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors no-underline"
              >
                <span>❤️ Favorites</span>
                <span className="text-stone-400 dark:text-stone-500 text-xs font-normal">Saved meals &rarr;</span>
              </Link>
              <Link
                href="/orders"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors no-underline"
              >
                <span>📦 Orders</span>
                <span className="text-stone-400 dark:text-stone-500 text-xs font-normal">Track status &rarr;</span>
              </Link>
              <Link
                href="/cart"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold text-amber-950 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors no-underline border border-amber-200/40 dark:border-amber-800/50"
              >
                <span>🛒 View Cart</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-900 dark:bg-amber-500 text-white dark:text-stone-950 text-xs font-bold">
                  {totalCartCount} items
                </span>
              </Link>

              {/* Theme Switcher in Mobile Drawer */}
              <div className="pt-2 pb-1">
                <ThemeToggle showLabel className="w-full" />
              </div>

              {/* Staff Portal Links */}
              {isStaff && (
                <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-1">
                  <p className="px-4 text-[11px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                    Staff Portal
                  </p>
                  <Link
                    href="/kitchen"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold text-amber-950 dark:text-amber-200 hover:bg-amber-100/60 dark:hover:bg-amber-900/40 transition-colors no-underline"
                  >
                    <span>👨‍🍳 Kitchen Board</span>
                    <span className="text-stone-400 dark:text-stone-500 text-xs">&rarr;</span>
                  </Link>
                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold text-amber-950 dark:text-amber-200 hover:bg-amber-100/60 dark:hover:bg-amber-900/40 transition-colors no-underline"
                  >
                    <span>⚙️ Admin Dashboard</span>
                    <span className="text-stone-400 dark:text-stone-500 text-xs">&rarr;</span>
                  </Link>
                </div>
              )}

              {/* Auth Session Section */}
              <div className="pt-3 border-t border-stone-100 dark:border-stone-800">
                {isAuthenticated ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-8 h-8 rounded-full inline-flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                          isStaff ? 'avatar-badge-staff' : 'avatar-badge-customer'
                        }`}
                      >
                        {initial}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">{username}</p>
                        <p className="text-[10px] text-amber-800 dark:text-amber-400 font-semibold">{roleDisplay}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-600 transition-colors cursor-pointer"
                    >
                      {isSigningOut ? 'Signing out...' : 'Sign Out'}
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/signin"
                    onClick={() => setIsOpen(false)}
                    className="w-full inline-flex items-center justify-center px-4 py-3 rounded-xl text-sm font-bold bg-stone-900 dark:bg-amber-500 text-white dark:text-stone-950 hover:bg-stone-800 dark:hover:bg-amber-400 transition-colors no-underline shadow-sm"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
