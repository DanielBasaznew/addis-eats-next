/**
 * Addis Eats - Formatting Utilities for Ethiopia (Day 47)
 *
 * Provides locale-aware formatters for Ethiopian Birr (ETB),
 * Addis Ababa local time (EAT, UTC+3), and relative timestamps.
 *
 * Formatter instances are created once at the module boundary
 * to maximize performance across thousands of rows.
 */

export const etbFormatter = new Intl.NumberFormat('en-ET', {
  style: 'currency',
  currency: 'ETB',
  maximumFractionDigits: 0,
});

export const whenFormatter = new Intl.DateTimeFormat('en-ET', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Africa/Addis_Ababa',
});

export const relativeFormatter = new Intl.RelativeTimeFormat('en', {
  numeric: 'auto',
});

/**
 * Format a numeric amount into Ethiopian Birr (e.g. "ETB 650")
 * Can be called as a function `etb(value)` or via `etb.format(value)`.
 */
export function etb(value) {
  const amount = Number(value);
  return etbFormatter.format(Number.isFinite(amount) ? amount : 0);
}
etb.format = (v) => etb(v);

/**
 * Format a timestamp into Addis Ababa local time (EAT, UTC+3)
 * (e.g. "Oct 12, 2026, 4:15 AM")
 */
export function when(value) {
  if (!value) return 'Unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unavailable';
  return whenFormatter.format(date);
}
when.format = (v) => when(v);

/**
 * Format a timestamp into a human relative time (e.g. "12 minutes ago")
 */
export function relative(value) {
  if (!value) return 'Unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unavailable';

  const diffInSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  if (Math.abs(diffInSeconds) < 10) return 'just now';

  const intervals = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
    ['second', 1],
  ];

  for (const [unit, secondsInUnit] of intervals) {
    if (Math.abs(diffInSeconds) >= secondsInUnit) {
      return relativeFormatter.format(Math.round(diffInSeconds / secondsInUnit), unit);
    }
  }

  return 'just now';
}
relative.format = (v) => relative(v);
