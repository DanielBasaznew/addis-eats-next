'use client';

import { useState, useEffect, useTransition, useMemo } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { createTableAction, deleteTableAction, resetTablesAction } from '@/app/actions';

function TableCard({ table, origin, onDelete, isDeleting }) {
  const [qrUrl, setQrUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const menuUrl = origin
    ? `${origin}/menu?table=${table.number}`
    : `/menu?table=${table.number}`;

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(menuUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#1c1917',
        light: '#ffffff',
      },
    })
      .then((dataUri) => {
        if (active) setQrUrl(dataUri);
      })
      .catch((err) => {
        console.error('Failed to generate QR for table', table.number, err);
      });
    return () => {
      active = false;
    };
  }, [menuUrl, table.number]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(menuUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    if (!qrUrl) return;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = `addis-eats-table-${table.number}-qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/90 dark:border-stone-800 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Table Top Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 text-amber-900 dark:text-amber-400 flex items-center justify-center font-black text-lg shadow-xs">
              #{table.number}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
                {table.label || `Table ${table.number}`}
              </h3>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                <span className="inline-flex items-center gap-1 font-medium">
                  <svg className="w-3.5 h-3.5 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span>{table.seats || 4} Guests Capacity</span>
                </span>
              </div>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Dine-In
          </span>
        </div>

        {/* QR Code Canvas Frame */}
        <div className="relative bg-stone-50 dark:bg-stone-950/60 rounded-2xl p-4 border border-stone-100 dark:border-stone-800/80 flex flex-col items-center justify-center mb-4">
          <div className="w-48 h-48 bg-white p-2 rounded-xl shadow-xs border border-stone-200/80 flex items-center justify-center relative">
            {qrUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrUrl}
                alt={`QR code for Table ${table.number}`}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 text-xs animate-pulse">
                <span>Generating QR...</span>
              </div>
            )}
            <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/5 pointer-events-none" />
          </div>

          <p className="mt-2.5 text-[11px] font-semibold text-stone-500 dark:text-stone-400 text-center">
            Scan to view menu with Table #{table.number} lock
          </p>
          <p className="text-[10px] text-amber-700 dark:text-amber-400 font-mono mt-0.5 max-w-full truncate px-2">
            /menu?table={table.number}
          </p>
        </div>
      </div>

      {/* Action Row */}
      <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="w-full py-2 px-3 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-emerald-600 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <span>Copy Link</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={!qrUrl}
            className="w-full py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Download PNG</span>
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <Link
            href={`/menu?table=${table.number}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 no-underline"
          >
            <span>Test Customer Flow</span>
            <span className="text-sm">↗</span>
          </Link>

          <button
            type="button"
            onClick={() => onDelete(table)}
            disabled={isDeleting}
            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 transition-colors cursor-pointer disabled:opacity-50"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            <span>{isDeleting ? 'Removing...' : 'Delete'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminTableManager({
  initialTables = [],
  session = null,
  onNotice = null,
  onTablesChange = null,
}) {
  const [tables, setTables] = useState(initialTables);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState(null);
  const [sectionFilter, setSectionFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [localNotice, setLocalNotice] = useState(null);
  const [origin, setOrigin] = useState('');

  // Form states for new table
  const [newNumber, setNewNumber] = useState('');
  const [newLabel, setNewLabel] = useState('Main Dining Hall');
  const [newSeats, setNewSeats] = useState(4);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);

      // Hydrate custom tables from localStorage if available
      try {
        const stored = localStorage.getItem('addis_custom_tables');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            if (parsed.length > initialTables.length || parsed.some((pt) => !initialTables.some((t) => String(t.number) === String(pt.number)))) {
              setTables(parsed);
              onTablesChange?.(parsed);
              document.cookie = `addis_custom_tables=${encodeURIComponent(JSON.stringify(parsed))}; path=/; max-age=2592000; SameSite=Lax`;
            }
          }
        }
      } catch {}
    }
  }, []);

  const triggerNotice = (type, message) => {
    if (onNotice) {
      onNotice({ type, message });
    } else {
      setLocalNotice({ type, message });
      setTimeout(() => setLocalNotice(null), 4000);
    }
  };

  // Auto-calculate next available table number when modal opens
  const openAddModal = () => {
    const existingNumbers = tables.map((t) => Number(t.number) || 0);
    const nextNum = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    setNewNumber(String(nextNum));
    setNewLabel('Main Dining Hall');
    setNewSeats(4);
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleCreateTable = async (e) => {
    e.preventDefault();
    setFormError(null);

    const num = Number(newNumber);
    if (!num || num <= 0) {
      setFormError('Please enter a valid table number.');
      return;
    }

    if (tables.some((t) => Number(t.number) === num)) {
      setFormError(`Table #${num} already exists in your restaurant.`);
      return;
    }

    startTransition(async () => {
      try {
        const res = await createTableAction({
          number: String(num),
          label: newLabel.trim() || `Table ${num}`,
          seats: Number(newSeats) || 4,
        });

        if (res.success && res.table) {
          const updated = [...tables, res.table].sort((a, b) => Number(a.number) - Number(b.number));
          setTables(updated);
          onTablesChange?.(updated);
          try {
            localStorage.setItem('addis_custom_tables', JSON.stringify(updated));
            document.cookie = `addis_custom_tables=${encodeURIComponent(JSON.stringify(updated))}; path=/; max-age=2592000; SameSite=Lax`;
          } catch {}
          setIsAddModalOpen(false);
          triggerNotice('success', res.message || `Table #${num} created successfully.`);
        } else {
          setFormError(res.error || 'Failed to create table.');
        }
      } catch {
        setFormError('Network error while saving table.');
      }
    });
  };

  const handleDeleteTable = (table) => {
    if (
      !window.confirm(
        `Are you sure you want to remove Table #${table.number} (${table.label})? Any QR codes already printed for this table will stop functioning.`
      )
    ) {
      return;
    }

    setDeletingId(table.id);
    startTransition(async () => {
      try {
        const res = await deleteTableAction(table.id);
        if (res.success) {
          const updated = tables.filter((t) => t.id !== table.id);
          setTables(updated);
          onTablesChange?.(updated);
          try {
            localStorage.setItem('addis_custom_tables', JSON.stringify(updated));
            document.cookie = `addis_custom_tables=${encodeURIComponent(JSON.stringify(updated))}; path=/; max-age=2592000; SameSite=Lax`;
          } catch {}
          triggerNotice('success', `Table #${table.number} was deleted.`);
        } else {
          triggerNotice('error', res.error || 'Could not delete table.');
        }
      } catch {
        triggerNotice('error', 'Network error deleting table.');
      } finally {
        setDeletingId(null);
      }
    });
  };

  const handleResetTables = () => {
    if (
      !window.confirm(
        'Restore the standard 6-table dining room layout? This will restore default tables 1 through 6.'
      )
    ) {
      return;
    }

    startTransition(async () => {
      try {
        const res = await resetTablesAction();
        if (res.success && res.tables) {
          setTables(res.tables);
          onTablesChange?.(res.tables);
          try {
            localStorage.removeItem('addis_custom_tables');
            document.cookie = `addis_custom_tables=${encodeURIComponent(JSON.stringify(res.tables))}; path=/; max-age=2592000; SameSite=Lax`;
          } catch {}
          triggerNotice('success', res.message || 'Floor layout restored.');
        } else {
          triggerNotice('error', res.error || 'Failed to reset tables.');
        }
      } catch {
        triggerNotice('error', 'Network error resetting floor layout.');
      }
    });
  };

  // Computed sections
  const sections = useMemo(() => {
    const list = new Set();
    tables.forEach((t) => {
      if (t.label) list.add(t.label);
    });
    return ['All', ...Array.from(list)];
  }, [tables]);

  // Filtered tables
  const filteredTables = useMemo(() => {
    return tables.filter((t) => {
      const matchesSearch =
        String(t.number).includes(searchQuery) ||
        (t.label && t.label.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesSection =
        sectionFilter === 'All' || t.label === sectionFilter;

      return matchesSearch && matchesSection;
    });
  }, [tables, searchQuery, sectionFilter]);

  const totalSeats = useMemo(
    () => tables.reduce((acc, t) => acc + (Number(t.seats) || 4), 0),
    [tables]
  );

  return (
    <div className="space-y-6">
      {/* Notice Toast */}
      {localNotice && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold border transition-all ${
            localNotice.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-800'
          }`}
        >
          {localNotice.message}
        </div>
      )}

      {/* Top Floor Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-400 mb-1">
            <span>Admin</span>
            <span>/</span>
            <span className="font-semibold text-stone-700 dark:text-stone-300">
              Restaurant Floor Management
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
            Floor Tables & QR Codes
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
            Generate high-res QR codes for every dining station. When guests scan, their session locks to that table with 0 ETB service fees.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleResetTables}
            disabled={isPending}
            className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs transition-colors cursor-pointer"
          >
            Reset Defaults
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-900 hover:bg-amber-950 dark:bg-amber-600 dark:hover:bg-amber-500 text-white font-bold text-xs sm:text-sm transition-all shadow-sm cursor-pointer select-none"
          >
            <span className="text-base leading-none">+</span>
            <span>Add Dining Table</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
          <span className="text-[11px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider block">
            Total Floor Stations
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-stone-900 dark:text-stone-100">
              {tables.length}
            </span>
            <span className="text-xs text-stone-500">Active Tables</span>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
          <span className="text-[11px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider block">
            Total Seating Capacity
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-amber-900 dark:text-amber-400">
              {totalSeats}
            </span>
            <span className="text-xs text-stone-500">Dining Guests</span>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
          <span className="text-[11px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider block">
            QR Ordering Engine
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              Active
            </span>
            <span className="text-xs text-emerald-600/80 font-medium">0 ETB Dine-In Fee</span>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <svg
            className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by table number or section name..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Section chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mr-1 shrink-0">
            Section:
          </span>
          {sections.map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => setSectionFilter(sec)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                sectionFilter === sec
                  ? 'bg-amber-900 dark:bg-amber-600 text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Tables Grid */}
      {filteredTables.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-8">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold text-2xl">
            #
          </div>
          <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
            No Dining Tables Found
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No tables match your filter "${searchQuery}".`
              : 'Add your first restaurant table using the button above.'}
          </p>
          <button
            type="button"
            onClick={openAddModal}
            className="mt-4 px-4 py-2 rounded-xl bg-amber-900 text-white text-xs font-bold hover:bg-amber-800 cursor-pointer"
          >
            + Add Table
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredTables.map((table) => (
            <TableCard
              key={table.id || table.number}
              table={table}
              origin={origin}
              onDelete={handleDeleteTable}
              isDeleting={deletingId === table.id}
            />
          ))}
        </div>
      )}

      {/* Add New Table Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
                  Add Dining Station
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Creates a dining table with an automatically assigned QR code
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center font-bold text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateTable} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Table Number *
                </label>
                <input
                  type="number"
                  min="1"
                  max="999"
                  required
                  value={newNumber}
                  onChange={(e) => setNewNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  placeholder="e.g. 7"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  Must be unique. Customers scanning QR will see this table number.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Section / Ambience Label
                </label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g. Window Booth, Balcony, VIP Lounge"
                />
                {/* Suggestions */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {['Main Hall', 'Window Booth', 'Garden Patio', 'VIP Lounge', 'Terrace', 'Bar'].map(
                    (tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setNewLabel(tag)}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 cursor-pointer"
                      >
                        {tag}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Seating Capacity (Guests)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={newSeats}
                  onChange={(e) => setNewSeats(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  placeholder="4"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl bg-amber-900 hover:bg-amber-950 dark:bg-amber-600 dark:hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isPending ? 'Creating Table...' : 'Save Table & Generate QR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
