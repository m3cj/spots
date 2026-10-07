const BEST_TIME_LABELS = {
  morning: 'Morning',
  day: 'Daytime',
  night: 'Night',
  anytime: 'Anytime',
};

export const bestTimeLabel = (value) => BEST_TIME_LABELS[value] ?? null;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function formatTime(timeStr) {
  if (!timeStr) return '';
  const [hours, minutes] = String(timeStr).split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return String(timeStr);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

/** "2026-10-12" + "18:30:00" -> "Mon, 12 Oct · 6:30 PM". Optional endTime -> "Mon, 12 Oct · 6:30 PM – 9:00 PM". Parsed by hand so time zones never shift the day. */
export function formatEventWhen(eventDate, startTime, endTime) {
  const [year, month, day] = String(eventDate).split('-').map(Number);
  if (!year || !month || !day) return '';
  const weekday = WEEKDAYS[new Date(year, month - 1, day).getDay()];
  const date = `${weekday}, ${day} ${MONTHS[month - 1]}`;

  if (!startTime) return date;
  const start = formatTime(startTime);
  if (!endTime) return `${date} · ${start}`;
  const end = formatTime(endTime);
  return `${date} · ${start} – ${end}`;
}

/** Null price means free (schema.sql). */
export function isFree(price) {
  return price === null || price === undefined || Number(price) === 0;
}

export function formatPrice(price) {
  return `₹${Number(price).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

/** "heritage,parks" -> ['heritage', 'parks'] */
export function splitCategorySlugs(value) {
  return String(value ?? '')
    .split(',')
    .map((slug) => slug.trim())
    .filter(Boolean);
}
