'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { getTableNumber, clearTableSession, setTableSession } from '@/lib/tableSession';

export default function TableBanner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [tableNumber, setTableNumberState] = useState(null);

  useEffect(() => {
    const tableFromUrl = searchParams.get('table');
    if (tableFromUrl) {
      setTableSession(tableFromUrl);
      setTableNumberState(tableFromUrl);
    } else {
      const active = getTableNumber();
      setTableNumberState(active);
    }

    function handleTableChange(e) {
      setTableNumberState(e?.detail?.tableNumber || null);
    }

    window.addEventListener('table-session-changed', handleTableChange);
    return () => window.removeEventListener('table-session-changed', handleTableChange);
  }, [searchParams]);

  if (!tableNumber) return null;

  const handleExitTable = () => {
    clearTableSession();
    setTableNumberState(null);

    // Remove table param from current URL if present
    const params = new URLSearchParams(searchParams.toString());
    params.delete('table');
    const qs = params.toString();
    const newUrl = qs ? `${pathname}?${qs}` : pathname;
    router.replace(newUrl);
  };

  return (
    <aside
      aria-label="Active dine-in table banner"
      className="bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 text-amber-200 border-b border-amber-500/30 px-4 py-2.5 text-xs sm:text-sm font-medium shadow-md transition-all"
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 text-center sm:text-left">
          <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0 border border-amber-400/30">
            🍽️
          </span>
          <div>
            <span className="font-extrabold text-amber-100">
              Dine-In Session Active: Table #{tableNumber}
            </span>
            <span className="hidden md:inline text-amber-300/80 ml-2">
              • Orders are dispatched directly to your floor table with 0 ETB service fee.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
            Table Service
          </span>
          <button
            type="button"
            onClick={handleExitTable}
            className="text-[11px] font-semibold text-stone-300 hover:text-white underline underline-offset-2 hover:no-underline transition-colors cursor-pointer"
          >
            Switch to Delivery
          </button>
        </div>
      </div>
    </aside>
  );
}
