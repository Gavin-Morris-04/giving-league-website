const dateFmt = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
const shortFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const monthDay = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

/** Parse an ISO yyyy-mm-dd as a UTC date so it never shifts a day in US time zones. */
export const parseISODate = (iso: string) => new Date(`${iso}T00:00:00Z`);

export const formatDate = (iso: string) => dateFmt.format(parseISODate(iso));
export const formatShortDate = (iso: string) => shortFmt.format(parseISODate(iso));

export function formatDateRange(start: string, end?: string) {
  if (!end || end === start) return formatDate(start);
  const s = parseISODate(start);
  const e = parseISODate(end);
  if (s.getUTCFullYear() === e.getUTCFullYear() && s.getUTCMonth() === e.getUTCMonth()) {
    return `${monthDay.format(s)}–${e.getUTCDate()}, ${e.getUTCFullYear()}`;
  }
  return `${monthDay.format(s)} – ${shortFmt.format(e)}`;
}

export const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");
