/**
 * Addis Eats - CSV Generation & Export Utilities (Day 47)
 *
 * Implements strict RFC 4180 escaping: any value containing
 * quotes, commas, or newlines is wrapped in double quotes,
 * and existing quotes are doubled (" -> "").
 */

/**
 * Escapes an individual cell value according to CSV rules.
 * Handles commas, quotes, newlines, and null/undefined values.
 */
export function escapeCsvCell(value) {
  if (value == null) return '';
  const text = String(value);

  // If the cell contains quotes, commas, or newlines, quote the entire field and double internal quotes
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

/**
 * Generates a full CSV string from headers and an array of row data.
 */
export function generateCsv(headers, rows) {
  const allLines = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((row) => row.map(escapeCsvCell).join(',')),
  ];
  return allLines.join('\r\n');
}

/**
 * Triggers a browser file download of CSV data.
 * Includes a UTF-8 Byte Order Mark (\uFEFF) to guarantee Excel/Numbers render correctly.
 */
export function downloadCsv(filename, headers, rows) {
  if (typeof window === 'undefined') return;

  const csvContent = generateCsv(headers, rows);

  // Prepend UTF-8 BOM (\uFEFF) so Excel and spreadsheet tools recognize UTF-8 encoding
  const blob = new Blob(['\uFEFF', csvContent], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  link.remove();

  // Revoke object URL after click to release browser memory
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
