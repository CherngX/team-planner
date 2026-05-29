export function toISO(date) {
  return date.toISOString().slice(0, 10);
}

export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return d;
}

export function parseDate(str) {
  // Parse YYYY-MM-DD as local date (not UTC)
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function diffDays(a, b) {
  return Math.round((b - a) / 86400000);
}

export function isWeekend(date) {
  const d = date.getDay();
  return d === 0 || d === 6;
}

export function isToday(date) {
  const t = new Date();
  return date.getFullYear() === t.getFullYear() &&
    date.getMonth() === t.getMonth() &&
    date.getDate() === t.getDate();
}

export function formatShort(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatMonth(date) {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function getDayLabel(date) {
  return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
}
