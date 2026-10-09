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
  const today = philippinesDateString(date);
  const [year, month, day] = today.split("-").map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day));
  const daysSinceMonday = (utcDate.getUTCDay() + 6) % 7;
  utcDate.setUTCDate(utcDate.getUTCDate() - daysSinceMonday);
  return [
    utcDate.getUTCFullYear(),
    String(utcDate.getUTCMonth() + 1).padStart(2, "0"),
    String(utcDate.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

export function philippinesPeriodRange(period, date = new Date()) {
  const end = philippinesDateString(date);
  const [year, month, day] = end.split("-").map(Number);
  const startDate = new Date(Date.UTC(year, month - 1, day));

  if (period === "weekly") {
    startDate.setUTCDate(startDate.getUTCDate() - ((startDate.getUTCDay() + 6) % 7));
  } else if (period === "monthly") {
    startDate.setUTCDate(1);
  } else if (period === "yearly") {
    startDate.setUTCMonth(0, 1);
  } else {
    throw new RangeError(`Unsupported progress period: ${period}`);
  }

  return {
    start: [
      startDate.getUTCFullYear(),
      String(startDate.getUTCMonth() + 1).padStart(2, "0"),
      String(startDate.getUTCDate()).padStart(2, "0"),
    ].join("-"),
    end,
  };
}

export function formatPhilippinesDate(value, options = {}) {
  const dateKey = philippinesDateKey(value);
  if (!dateKey) return "";

  return new Intl.DateTimeFormat("en-PH", {
    timeZone: PHILIPPINES_TIME_ZONE,
    ...options,
  }).format(new Date(`${dateKey}T12:00:00+08:00`));
}
