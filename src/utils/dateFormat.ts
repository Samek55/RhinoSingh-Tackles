const pad = (n: number) => String(n).padStart(2, '0');

// Formats a Date using its local (not UTC) calendar day, so bookings made in
// UTC+5:30/+5:45 timezones don't roll back to the previous day.
export const toLocalDateString = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// Formats a Date as an ISO-like string with no timezone designator, so
// re-parsing it with `new Date(...)` is interpreted as local time (per the
// ECMA-262 date-time string spec) instead of being shifted to UTC.
export const toLocalDateTimeString = (date: Date): string =>
  `${toLocalDateString(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
