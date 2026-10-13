'use client';

import { useState } from 'react';
import { downloadCsv } from '@/lib/csv';
import { etb, when } from '@/lib/format';

export default function CsvExportButton({ orders = [], className = '' }) {
  const [isExporting, setIsExporting] = useState(false);

  function handleExport() {
    if (!orders || orders.length === 0) return;
    setIsExporting(true);

    try {
      const headers = [
        'Order ID',
        'Date Placed (Addis Ababa)',
        'Delivery Area',
        'Status',
        'Items Summary',
        'Raw Total (ETB)',
        'Formatted Total',
      ];

      const rows = orders.map((order) => {
        const itemsSummary = Array.isArray(order.items)
          ? order.items
              .map((item) => `${item.name || 'Dish'} (x${item.quantity || 1})`)
              .join('; ')
          : '';

        const numericTotal = Number(order.total || 0);

        return [
          order.id || '',
          when(order.createdAt),
          order.area || 'Addis Ababa',
          order.status || 'Pending',
          itemsSummary,
          numericTotal,
          etb(numericTotal),
        ];
      });

      const todayStr = new Date().toISOString().slice(0, 10);
      downloadCsv(`addis-eats-orders-${todayStr}.csv`, headers, rows);
    } catch (err) {
      console.error('Failed to export CSV:', err);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isExporting || orders.length === 0}
      title="Download order history as an Excel/CSV spreadsheet"
      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 transition-colors shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <svg
        className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      <span>{isExporting ? 'Exporting...' : `Export CSV (${orders.length})`}</span>
    </button>
  );
}
