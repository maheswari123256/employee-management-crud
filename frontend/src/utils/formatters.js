/**
 * utils/formatters.js
 * Date / currency / avatar helpers.
 */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2024-05-12" | ISO → "12 May 2024" */
export const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return `${String(date.getDate()).padStart(2, '0')} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
};

/** ISO → value for <input type="date"> */
export const toDateInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const tz = date.getTimezoneOffset();
  return new Date(date.getTime() - tz * 60000).toISOString().slice(0, 10);
};

/** 1250000 → "₹12,50,000" (Indian grouping) */
export const formatSalary = (value) => {
  const num = Number(value);
  if (!value && value !== 0) return '—';
  if (Number.isNaN(num)) return '—';
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num);
  } catch {
    return `₹${num.toLocaleString('en-IN')}`;
  }
};

/** "Aarav Sharma" → "AS" */
export const getInitials = (firstName = '', lastName = '') =>
  `${String(firstName).charAt(0)}${String(lastName).charAt(0)}`.toUpperCase() || '?';

/** Deterministic avatar colour from a string (soft, readable on white). */
const PALETTE = ['#eef2ff', '#ecfdf5', '#fff7ed', '#fdf2f8', '#eff6ff', '#f5f3ff'];
const TEXT = ['#4338ca', '#047857', '#c2410c', '#be185d', '#1d4ed8', '#6d28d9'];

export const avatarStyle = (seed = '') => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const idx = hash % PALETTE.length;
  return { background: PALETTE[idx], color: TEXT[idx] };
};

/** "/uploads/employees/x.jpg" → absolute URL (works with the Vite proxy too) */
export const photoUrl = (photo) => {
  if (!photo) return '';
  if (/^https?:\/\//i.test(photo)) return photo;
  return photo;
};
