export const PHILIPPINES_TIME_ZONE = "Asia/Manila";

const dateParts = (date) => {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: PHILIPPINES_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  return Object.fromEntries(parts.map(({ type, value }) => [type, value]));
};

export function philippinesDateString(date = new Date()) {
  const parts = dateParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function philippinesDateKey(value) {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "" : philippinesDateString(date);
}

export function philippinesMondayString(date = new Date()) {
  return philippinesWeekStart(philippinesDateString(date));
}

/** Add (or subtract) whole days from a "YYYY-MM-DD" key. */
export function addPhilippinesDays(dateKey, days) {
  const [year, month, day] = String(dateKey).split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

/** The Monday of the week that contains the given "YYYY-MM-DD" key. */
export function philippinesWeekStart(dateKey = philippinesDateString()) {
  const [year, month, day] = String(dateKey).split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const daysSinceMonday = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - daysSinceMonday);
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

const WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/** The weekday name of a "YYYY-MM-DD" key, Monday first. */
export function philippinesWeekdayName(dateKey) {
  const [year, month, day] = String(dateKey).split("-").map(Number);
  return WEEKDAY_NAMES[(new Date(Date.UTC(year, month - 1, day)).getUTCDay() + 6) % 7];
}

/** Human readable label for a selected date range. */
export function describeDateRange(range) {
  if (!range || !range.start) return "All time";
  const sameYear = range.start.slice(0, 4) === range.end.slice(0, 4);
  const startLabel = formatPhilippinesDate(range.start, {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
  const endLabel = formatPhilippinesDate(range.end, { month: "short", day: "numeric", year: "numeric" });
  return `${startLabel} – ${endLabel}`;
}

export function formatPhilippinesDate(value, options = {}) {
  const dateKey = philippinesDateKey(value);
  if (!dateKey) return "";

  return new Intl.DateTimeFormat("en-PH", {
    timeZone: PHILIPPINES_TIME_ZONE,
    ...options,
  }).format(new Date(`${dateKey}T12:00:00+08:00`));
}
