'use client';

import { useState, useTransition, useActionState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createDish, updateDish, deleteDish, toggleDishAvailability } from '@/app/actions';
import AdminTableManager from '@/components/AdminTableManager';

const INITIAL_FORM_STATE = {
  success: false,
  error: null,
  fieldErrors: {},
};

export default function AdminDishManager({
  initialDishes = [],
  initialTables = [],
  session = null,
}) {
  const [activeWorkspace, setActiveWorkspace] = useState('dishes'); // 'dishes' | 'tables'
  const [dishes, setDishes] = useState(initialDishes);
  const [tables, setTables] = useState(initialTables);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'available' | 'sold_out'
  const [filterCategory, setFilterCategory] = useState('All');
  const [vegetarianOnly, setVegetarianOnly] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [isCreatingOpen, setIsCreatingOpen] = useState(false);
  const [notice, setNotice] = useState(null);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [isPending, startTransition] = useTransition();

  // Create Dish Form Action State
  const [createState, createAction, isCreatingPending] = useActionState(
    async (prevState, formData) => {
      const res = await createDish(prevState, formData);
      if (res.success && res.dish) {
        setDishes((prev) => [res.dish, ...prev]);
        setIsCreatingOpen(false);
        setNotice({ type: 'success', message: res.message });
      }
      return res;
    },
    INITIAL_FORM_STATE
  );

  // Update Dish Form Action State
  const [updateState, updateAction, isUpdatingPending] = useActionState(
    async (prevState, formData) => {
      const res = await updateDish(prevState, formData);
      if (res.success && res.dish) {
        setDishes((prev) =>
          prev.map((d) => (d.id === res.dish.id ? res.dish : d))
        );
        setEditingDish(null);
        setNotice({ type: 'success', message: res.message });
      }
      return res;
    },
    INITIAL_FORM_STATE
  );

  // Quick Toggle Availability Switch (Available <=> Sold Out)
  const handleToggleAvailability = (dish) => {
    const nextAvailable = !(dish.available !== false);
    setTogglingId(dish.id);

    // Optimistic UI update
    setDishes((prev) =>
      prev.map((d) => (d.id === dish.id ? { ...d, available: nextAvailable } : d))
    );

    // Immediate client-side cookie & event broadcast
    if (typeof window !== 'undefined') {
      try {
        const match = document.cookie.match(/dish_availability=([^;]+)/);
        const map = match ? JSON.parse(decodeURIComponent(match[1])) : {};
        map[String(dish.id)] = nextAvailable;
        document.cookie = `dish_availability=${encodeURIComponent(JSON.stringify(map))}; path=/; max-age=2592000; SameSite=Lax`;
        localStorage.setItem('dish_availability', JSON.stringify(map));
      } catch {}
      window.dispatchEvent(
        new CustomEvent('dish-availability-changed', {
          detail: { dishId: dish.id, available: nextAvailable },
        })
      );
    }

    startTransition(async () => {
      try {
        const res = await toggleDishAvailability(dish.id);
        if (res.success) {
          setNotice({
            type: 'success',
            message: res.message || `Status updated for ${dish.name}.`,
          });
        } else {
          // Revert optimistic update on failure
          setDishes((prev) =>
            prev.map((d) => (d.id === dish.id ? { ...d, available: !nextAvailable } : d))
          );
          if (typeof window !== 'undefined') {
            try {
              const match = document.cookie.match(/dish_availability=([^;]+)/);
              const map = match ? JSON.parse(decodeURIComponent(match[1])) : {};
              map[String(dish.id)] = !nextAvailable;
              document.cookie = `dish_availability=${encodeURIComponent(JSON.stringify(map))}; path=/; max-age=2592000; SameSite=Lax`;
              localStorage.setItem('dish_availability', JSON.stringify(map));
            } catch {}
            window.dispatchEvent(
              new CustomEvent('dish-availability-changed', {
                detail: { dishId: dish.id, available: !nextAvailable },
              })
            );
          }
          setNotice({
            type: 'error',
            message: res.error || 'Failed to toggle availability.',
          });
        }
      } catch {
        // Revert on network error
        setDishes((prev) =>
          prev.map((d) => (d.id === dish.id ? { ...d, available: !nextAvailable } : d))
        );
        if (typeof window !== 'undefined') {
          try {
            const match = document.cookie.match(/dish_availability=([^;]+)/);
            const map = match ? JSON.parse(decodeURIComponent(match[1])) : {};
            map[String(dish.id)] = !nextAvailable;
            document.cookie = `dish_availability=${encodeURIComponent(JSON.stringify(map))}; path=/; max-age=2592000; SameSite=Lax`;
            localStorage.setItem('dish_availability', JSON.stringify(map));
          } catch {}
          window.dispatchEvent(
            new CustomEvent('dish-availability-changed', {
              detail: { dishId: dish.id, available: !nextAvailable },
            })
          );
        }
        setNotice({
          type: 'error',
          message: 'Network error updating availability.',
        });
      } finally {
        setTogglingId(null);
      }
    });
  };

  // Delete Dish handler
  const handleDelete = (dish) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete "${dish.name}" (ID #${dish.id})?`
      )
    ) {
      return;
    }

    setIsDeletingId(dish.id);
    startTransition(async () => {
      try {
        const res = await deleteDish(dish.id);
        if (res.success) {
          setDishes((prev) => prev.filter((d) => d.id !== dish.id));
          setNotice({
            type: 'success',
            message: res.message || `Dish "${dish.name}" was deleted.`,
          });
        } else {
          setNotice({
            type: 'error',
            message: res.error || 'Failed to delete dish.',
          });
        }
      } catch {
        setNotice({
          type: 'error',
          message: 'Network error deleting dish.',
        });
      } finally {
        setIsDeletingId(null);
      }
    });
  };

  // Computed metrics
  const totalCount = dishes.length;
  const availableCount = useMemo(
    () => dishes.filter((d) => d.available !== false).length,
    [dishes]
  );
  const soldOutCount = totalCount - availableCount;
  const inStockPercentage =
    totalCount > 0 ? Math.round((availableCount / totalCount) * 100) : 0;
  const avgPrice = useMemo(
    () =>
      totalCount > 0
        ? Math.round(dishes.reduce((sum, d) => sum + (Number(d.price) || 0), 0) / totalCount)
        : 0,
    [dishes, totalCount]
  );

  const categories = useMemo(
    () => ['All', ...new Set(dishes.map((d) => d.category))],
    [dishes]
  );

  // Filtered dishes
  const filteredDishes = useMemo(() => {
    return dishes.filter((d) => {
      const isAvailable = d.available !== false;
      const matchesSearch =
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(d.id).includes(searchTerm);

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'available'
          ? isAvailable
          : !isAvailable;

      const matchesCategory =
        filterCategory === 'All' || d.category === filterCategory;

      const matchesVeg = !vegetarianOnly || Boolean(d.vegetarian);

      return matchesSearch && matchesStatus && matchesCategory && matchesVeg;
    });
  }, [dishes, searchTerm, statusFilter, filterCategory, vegetarianOnly]);

  return (
    <div className="flex flex-col lg:flex-row items-start gap-8">
      {/* =========================================================================
          LEFT-SIDE SELECTOR & NAVIGATION RAIL (Admin Control Sidebar)
          ========================================================================= */}
      <aside className="w-full lg:w-72 shrink-0 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-sm p-5 sm:p-6 lg:sticky lg:top-6">
        {/* Admin Portal Header */}
        <div className="pb-5 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-900 dark:bg-amber-600 text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0">
              AE
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-stone-900 dark:text-stone-100 tracking-tight leading-tight">
                Addis Eats Portal
              </h2>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Staff Console
              </span>
            </div>
          </div>
        </div>

        {/* View Navigator / Main Sections */}
        <div className="py-4 border-b border-stone-100 dark:border-stone-800">
          <p className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 tracking-wider mb-2.5 px-2">
            Workspaces
          </p>
          <nav className="space-y-1">
            <button
              type="button"
              onClick={() => setActiveWorkspace('dishes')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer text-left ${
                activeWorkspace === 'dishes'
                  ? 'bg-amber-500/10 dark:bg-amber-400/10 text-amber-950 dark:text-amber-300 border border-amber-500/20'
                  : 'text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/60'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                </svg>
                <span>Dish Catalog</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-200/60 dark:bg-amber-900/60 text-[10px]">
                {totalCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveWorkspace('tables')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer text-left ${
                activeWorkspace === 'tables'
                  ? 'bg-amber-500/10 dark:bg-amber-400/10 text-amber-950 dark:text-amber-300 border border-amber-500/20'
                  : 'text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/60'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                  <path d="M6 6h10" />
                  <path d="M6 10h10" />
                </svg>
                <span>Floor Tables & QR</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-200/60 dark:bg-amber-900/60 text-[10px]">
                {tables.length}
              </span>
            </button>

            <Link
              href="/kitchen"
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/60 font-semibold text-xs transition-colors no-underline"
            >
              <span className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 13.8a4.4 4.4 0 0 1-2.8-4.2C3.2 7 5 5 7.4 5.2A5 5 0 0 1 12 2a5 5 0 0 1 4.6 3.2c2.4-.2 4.2 1.8 4.2 4.4a4.4 4.4 0 0 1-2.8 4.2" />
                  <path d="M6 17h12v4H6z" />
                </svg>
                <span>Kitchen Board</span>
              </span>
              <span className="text-stone-400 text-xs">→</span>
            </Link>

            <Link
              href="/dashboard"
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/60 font-semibold text-xs transition-colors no-underline"
            >
              <span className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v18h18" />
                  <path d="m19 9-5 5-4-4-3 3" />
                </svg>
                <span>Order Analytics</span>
              </span>
              <span className="text-stone-400 text-xs">→</span>
            </Link>

            <Link
              href="/menu"
              target="_blank"
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/60 font-semibold text-xs transition-colors no-underline"
            >
              <span className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <span>Live Public Menu</span>
              </span>
              <span className="text-stone-400 text-xs">↗</span>
            </Link>
          </nav>
        </div>

        {activeWorkspace === 'dishes' ? (
          <>
            {/* =====================================================================
                LEFT SIDE SELECTOR 1: Stock Status (All vs Available vs Sold Out)
                ===================================================================== */}
            <div className="py-4 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center justify-between mb-2.5 px-2">
                <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 tracking-wider">
                  Stock Availability
                </span>
                <span className="text-[10px] font-bold text-amber-900 dark:text-amber-400">
                  {inStockPercentage}% Active
                </span>
              </div>

              {/* Mini progress bar */}
              <div className="w-full bg-stone-100 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden mb-3">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${inStockPercentage}%` }}
                />
              </div>

              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    statusFilter === 'all'
                      ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-stone-400" />
                    <span>All Dishes</span>
                  </span>
                  <span className="text-[11px] opacity-70 font-mono">{totalCount}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('available')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    statusFilter === 'available'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-300 dark:ring-emerald-800" />
                    <span>In Stock (Available)</span>
                  </span>
                  <span className="text-[11px] opacity-70 font-mono">{availableCount}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('sold_out')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    statusFilter === 'sold_out'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-rose-300 dark:ring-rose-800" />
                    <span>Sold Out</span>
                  </span>
                  <span className="text-[11px] opacity-70 font-mono">{soldOutCount}</span>
                </button>
              </div>
            </div>

            {/* =====================================================================
                LEFT SIDE SELECTOR 2: Meal Category Filter
                ===================================================================== */}
            <div className="py-4 border-b border-stone-100 dark:border-stone-800">
              <p className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 tracking-wider mb-2.5 px-2">
                Filter Category
              </p>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => {
                  const count =
                    cat === 'All'
                      ? totalCount
                      : dishes.filter((d) => d.category === cat).length;
                  const isSelected = filterCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFilterCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-900 dark:bg-amber-600 text-white shadow-xs'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                      }`}
                    >
                      {cat} <span className="opacity-60 text-[10px] font-mono">({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Vegetarian quick toggle */}
              <label className="mt-3.5 flex items-center justify-between px-2 py-1 text-xs font-medium text-stone-700 dark:text-stone-300 cursor-pointer">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Vegetarian Only</span>
                </span>
                <input
                  type="checkbox"
                  checked={vegetarianOnly}
                  onChange={(e) => setVegetarianOnly(e.target.checked)}
                  className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                />
              </label>
            </div>
          </>
        ) : (
          /* =====================================================================
              FLOOR OVERVIEW SIDEBAR SUMMARY
              ===================================================================== */
          <div className="py-4 border-b border-stone-100 dark:border-stone-800 space-y-3">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 tracking-wider">
                Floor Summary
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live Dine-In
              </span>
            </div>

            <div className="bg-stone-50 dark:bg-stone-800/60 rounded-2xl p-3 border border-stone-100 dark:border-stone-800 text-xs space-y-2">
              <div className="flex items-center justify-between text-stone-600 dark:text-stone-300">
                <span>Active Stations</span>
                <span className="font-bold text-stone-900 dark:text-stone-100">{tables.length} Tables</span>
              </div>
              <div className="flex items-center justify-between text-stone-600 dark:text-stone-300">
                <span>Total Seats</span>
                <span className="font-bold text-amber-900 dark:text-amber-400">
                  {tables.reduce((sum, t) => sum + (Number(t.seats) || 4), 0)} Guests
                </span>
              </div>
              <div className="flex items-center justify-between text-stone-600 dark:text-stone-300">
                <span>Service Fee</span>
                <span className="font-bold text-emerald-600">0 ETB</span>
              </div>
            </div>

            <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed px-1">
              QR codes can be printed and laminated for dining tables. Customers scanning with camera will automatically order under that table.
            </p>
          </div>
        )}

        {/* Staff User Card */}
        <div className="pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 flex items-center justify-center font-bold text-xs">
              {session?.id ? session.id.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900 dark:text-stone-100 leading-tight">
                {session?.id || 'Staff Administrator'}
              </p>
              <p className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold uppercase">
                Staff Verified
              </p>
            </div>
          </div>
          <Link
            href="/signout"
            className="text-[11px] text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 font-medium transition-colors no-underline"
          >
            Sign Out
          </Link>
        </div>
      </aside>

      {/* =========================================================================
          RIGHT-SIDE MAIN WORKSPACE (Admin Data Grid & Controls)
          ========================================================================= */}
      {activeWorkspace === 'tables' ? (
        <section className="flex-1 w-full min-w-0">
          <AdminTableManager
            initialTables={tables}
            session={session}
            onNotice={setNotice}
            onTablesChange={setTables}
          />
        </section>
      ) : (
        <section className="flex-1 w-full min-w-0 space-y-6">
          {/* Top Control Bar: Header, Search & Action Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-400 mb-1">
              <span>Admin</span>
              <span>/</span>
              <span className="font-semibold text-stone-700 dark:text-stone-300">
                Dish Catalog & Stock Control
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
              Dish Management
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setIsCreatingOpen(true);
                setEditingDish(null);
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-900 hover:bg-amber-950 dark:bg-amber-600 dark:hover:bg-amber-500 text-white font-bold text-xs sm:text-sm transition-all shadow-sm cursor-pointer select-none"
            >
              <span className="text-base leading-none">+</span>
              <span>Add New Dish</span>
            </button>
          </div>
        </div>

        {/* 4 Summary KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
            <span className="text-[11px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider block">
              Total Items
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-stone-900 dark:text-stone-100">
                {totalCount}
              </span>
              <span className="text-xs text-stone-500">Dishes</span>
            </div>
          </div>

          <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
            <span className="text-[11px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider block">
              In Stock
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {availableCount}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                Available
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
            <span className="text-[11px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider block">
              Sold Out
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
                {soldOutCount}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                Unavailable
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
            <span className="text-[11px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider block">
              Avg. Price
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-stone-900 dark:text-stone-100">
                {avgPrice}
              </span>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                ETB
              </span>
            </div>
          </div>
        </div>

        {/* Global Notice Toast */}
        {notice && (
          <div
            role="status"
            className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-sm font-semibold transition-all ${
              notice.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{notice.type === 'success' ? '✓' : '⚠'}</span>
              <span>{notice.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Search & Results Bar */}
        <div className="flex items-center justify-between gap-4 bg-white dark:bg-stone-900 px-4 py-3 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
          <div className="relative flex-1">
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search dishes by name, category, or ID..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-900/20 dark:focus:ring-amber-500/20"
            />
            <svg
              className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="text-xs text-stone-400 dark:text-stone-500 whitespace-nowrap">
            Showing <strong className="text-stone-900 dark:text-stone-100">{filteredDishes.length}</strong> of {totalCount}
          </div>
        </div>

        {/* Dishes Table */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-stone-50 dark:bg-stone-800/60 border-b border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 font-bold text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-4">Dish</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4 text-center">Availability (Toggle)</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {filteredDishes.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-stone-500 dark:text-stone-400">
                      <p className="font-semibold text-base mb-1">No dishes match your selected filters</p>
                      <p className="text-xs text-stone-400">
                        Try adjusting your search query, status selector, or category filter on the left.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredDishes.map((dish) => {
                    const isAvailable = dish.available !== false;
                    const isToggling = togglingId === dish.id;

                    return (
                      <tr
                        key={dish.id}
                        className={`hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition-colors ${
                          !isAvailable ? 'opacity-75 bg-stone-50/30 dark:bg-stone-900/30' : ''
                        }`}
                      >
                        {/* Dish Details */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shrink-0">
                              {dish.image ? (
                                <Image
                                  src={dish.image}
                                  alt={dish.name}
                                  fill
                                  sizes="48px"
                                  className={`object-cover ${!isAvailable ? 'grayscale-[40%]' : ''}`}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-400">
                                  No img
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                                <Link
                                  href={`/menu/${encodeURIComponent(dish.name)}`}
                                  className="no-underline text-inherit hover:text-amber-800 dark:hover:text-amber-400 transition-colors"
                                  target="_blank"
                                >
                                  {dish.name}
                                </Link>
                                {!isAvailable && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                                    Sold Out
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-stone-400">
                                #{dish.id} • {dish.description ? `${dish.description.slice(0, 38)}...` : 'Traditional dish'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4 font-medium">
                          <span className="px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold">
                            {dish.category}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="py-3.5 px-4 font-black text-stone-900 dark:text-stone-100 whitespace-nowrap">
                          {dish.price} <span className="text-xs font-bold text-amber-700 dark:text-amber-400">ETB</span>
                        </td>

                        {/* Vegetarian / Stew */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                              dish.vegetarian
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800/60'
                            }`}
                          >
                            {dish.vegetarian ? 'Vegetarian' : 'Stew / Meat'}
                          </span>
                        </td>

                        {/* =======================================================
                            THE AVAILABLE & SOLD OUT TOGGLE (Interactive Switch)
                            ======================================================= */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={isAvailable}
                            aria-label={`Toggle availability for ${dish.name}. Currently ${isAvailable ? 'Available' : 'Sold Out'}`}
                            onClick={() => handleToggleAvailability(dish)}
                            disabled={isToggling || isPending}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                              isAvailable
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300/80 dark:border-emerald-700 shadow-xs hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-300 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-700'
                            } ${isToggling ? 'opacity-60 pointer-events-none' : ''}`}
                          >
                            {/* Switch Knob */}
                            <span
                              className={`w-7 h-4 rounded-full transition-colors relative flex items-center p-0.5 ${
                                isAvailable
                                  ? 'bg-emerald-500'
                                  : 'bg-stone-300 dark:bg-stone-600'
                              }`}
                            >
                              <span
                                className={`w-3 h-3 rounded-full bg-white shadow-xs transition-transform ${
                                  isAvailable ? 'translate-x-3' : 'translate-x-0'
                                }`}
                              />
                            </span>
                            <span>{isAvailable ? 'Available' : 'Sold Out'}</span>
                          </button>
                        </td>

                        {/* Action Controls */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <Link
                              href={`/menu/${encodeURIComponent(dish.name)}`}
                              target="_blank"
                              className="px-2.5 py-1 rounded-lg text-xs font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors no-underline"
                              title="View on live menu"
                            >
                              View ↗
                            </Link>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingDish(dish);
                                setIsCreatingOpen(false);
                              }}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold text-amber-900 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800/60 transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(dish)}
                              disabled={isDeletingId === dish.id || isPending}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-rose-200/80 dark:border-rose-900/60 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {isDeletingId === dish.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      )}

      {/* =========================================================================
          MODAL: CREATE NEW DISH
          ========================================================================= */}
      {isCreatingOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-dish-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800 mb-6">
              <div>
                <span className="text-xs uppercase tracking-widest text-amber-800 dark:text-amber-400 font-bold">
                  Catalog Management
                </span>
                <h3 id="create-dish-title" className="text-xl font-extrabold text-stone-900 dark:text-stone-100">
                  Add New Dish
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-400 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {createState?.error && (
              <div role="alert" className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs font-medium">
                {createState.error}
              </div>
            )}

            <form action={createAction} className="space-y-4">
              <div>
                <label htmlFor="create-name" className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                  Dish Name *
                </label>
                <input
                  id="create-name"
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. Doro Wot"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-900/20"
                />
                {createState?.fieldErrors?.name && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{createState.fieldErrors.name.join(', ')}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="create-category" className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <input
                    id="create-category"
                    name="category"
                    type="text"
                    required
                    placeholder="e.g. Breakfast, Lunch, Dinner"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-900/20"
                  />
                  {createState?.fieldErrors?.category && (
                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{createState.fieldErrors.category.join(', ')}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="create-price" className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                    Price (ETB) *
                  </label>
                  <input
                    id="create-price"
                    name="price"
                    type="number"
                    step="1"
                    min="1"
                    required
                    placeholder="e.g. 420"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-900/20"
                  />
                  {createState?.fieldErrors?.price && (
                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{createState.fieldErrors.price.join(', ')}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="create-image" className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                  Image Path / URL
                </label>
                <input
                  id="create-image"
                  name="image"
                  type="text"
                  placeholder="/images/dishes/doro-wot.jpg"
                  defaultValue="/images/dishes/genfo.jpg"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-900/20"
                />
              </div>

              <div>
                <label htmlFor="create-description" className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  id="create-description"
                  name="description"
                  rows="3"
                  placeholder="Describe traditional ingredients, slow-simmer spices, and flavor profile..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-900/20"
                />
              </div>

              {/* Toggles: Vegetarian & Availability */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="available"
                    value="true"
                    defaultChecked
                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">
                      Available for Ordering (In Stock)
                    </span>
                    <span className="text-[11px] text-stone-500 block">
                      Customers can add this dish to cart immediately.
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="vegetarian"
                    value="true"
                    className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">
                      Vegetarian / Fasting Dish
                    </span>
                    <span className="text-[11px] text-stone-500 block">
                      Plant-based traditional stew without meat or animal products.
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsCreatingOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingPending}
                  className="px-5 py-2 rounded-xl bg-amber-900 hover:bg-amber-950 dark:bg-amber-600 dark:hover:bg-amber-500 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isCreatingPending ? 'Creating Dish...' : 'Publish Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EDIT EXISTING DISH
          ========================================================================= */}
      {editingDish && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-dish-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800 mb-6">
              <div>
                <span className="text-xs uppercase tracking-widest text-amber-800 dark:text-amber-400 font-bold">
                  Editing Dish #{editingDish.id}
                </span>
                <h3 id="edit-dish-title" className="text-xl font-extrabold text-stone-900 dark:text-stone-100">
                  {editingDish.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingDish(null)}
                className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-400 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {updateState?.error && (
              <div role="alert" className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs font-medium">
                {updateState.error}
              </div>
            )}

            <form action={updateAction} className="space-y-4">
              <input type="hidden" name="id" value={editingDish.id} />

              <div>
                <label htmlFor="edit-name" className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                  Dish Name *
                </label>
                <input
                  id="edit-name"
                  name="name"
                  type="text"
                  required
                  defaultValue={editingDish.name}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-900/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-category" className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <input
                    id="edit-category"
                    name="category"
                    type="text"
                    required
                    defaultValue={editingDish.category}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-900/20"
                  />
                </div>

                <div>
                  <label htmlFor="edit-price" className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                    Price (ETB) *
                  </label>
                  <input
                    id="edit-price"
                    name="price"
                    type="number"
                    step="1"
                    min="1"
                    required
                    defaultValue={editingDish.price}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-900/20"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="edit-image" className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                  Image Path / URL
                </label>
                <input
                  id="edit-image"
                  name="image"
                  type="text"
                  defaultValue={editingDish.image || ''}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-900/20"
                />
              </div>

              <div>
                <label htmlFor="edit-description" className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  id="edit-description"
                  name="description"
                  rows="3"
                  defaultValue={editingDish.description || ''}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-900/20"
                />
              </div>

              {/* Toggles: Availability & Vegetarian */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="available"
                    value="true"
                    defaultChecked={editingDish.available !== false}
                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">
                      Available for Ordering (In Stock)
                    </span>
                    <span className="text-[11px] text-stone-500 block">
                      Uncheck to mark this dish as Sold Out.
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="vegetarian"
                    value="true"
                    defaultChecked={editingDish.vegetarian}
                    className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">
                      Vegetarian / Fasting Dish
                    </span>
                    <span className="text-[11px] text-stone-500 block">
                      Prepared without meat or dairy products.
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setEditingDish(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPending}
                  className="px-5 py-2 rounded-xl bg-amber-900 hover:bg-amber-950 dark:bg-amber-600 dark:hover:bg-amber-500 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isUpdatingPending ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
