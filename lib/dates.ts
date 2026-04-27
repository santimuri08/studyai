// lib/dates.ts
// Convert natural-language date strings into ISO YYYY-MM-DD strings.
// Handles "May 14", "5/14", "tuesday", "next monday", "tomorrow", "2026-05-14".

const WEEKDAYS = [
  "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday",
];

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

function isoDate(d: Date): string {
  const y  = d.getFullYear();
  const m  = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function nextWeekday(target: number, base: Date, forceNext = false): Date {
  const out = new Date(base);
  const cur = out.getDay();
  let diff  = target - cur;
  if (diff < 0 || (diff === 0 && forceNext)) diff += 7;
  if (diff === 0 && !forceNext) diff = 0;
  out.setDate(out.getDate() + diff);
  return out;
}

/**
 * Parse a single date phrase.
 * Returns ISO YYYY-MM-DD or null if it can't be parsed.
 */
export function parseDate(phrase: string, today = new Date()): string | null {
  if (!phrase) return null;
  const p = phrase.toLowerCase().trim();

  // Already ISO?
  const iso = p.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return p;

  // tomorrow / today
  if (p === "today")    return isoDate(today);
  if (p === "tomorrow") {
    const t = new Date(today);
    t.setDate(t.getDate() + 1);
    return isoDate(t);
  }

  // "next monday", "this friday"
  const wkRel = p.match(/^(this|next)\s+(\w+)$/);
  if (wkRel) {
    const idx = WEEKDAYS.indexOf(wkRel[2]);
    if (idx >= 0) {
      return isoDate(nextWeekday(idx, today, wkRel[1] === "next"));
    }
  }

  // bare weekday: "monday", "tuesday"
  const wkIdx = WEEKDAYS.indexOf(p);
  if (wkIdx >= 0) {
    return isoDate(nextWeekday(wkIdx, today, false));
  }

  // "may 14", "may 14th", "may 14, 2026"
  const monthDay = p.match(/^([a-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?(?:[,\s]+(\d{4}))?$/);
  if (monthDay) {
    const mIdx = MONTHS.indexOf(monthDay[1]);
    if (mIdx >= 0) {
      const day  = parseInt(monthDay[2], 10);
      const year = monthDay[3] ? parseInt(monthDay[3], 10) : today.getFullYear();
      const candidate = new Date(year, mIdx, day);
      // If no year was given and the date already passed this year, roll to next year.
      if (!monthDay[3] && candidate.getTime() < today.getTime() - 24 * 3600 * 1000) {
        candidate.setFullYear(year + 1);
      }
      return isoDate(candidate);
    }
  }

  // "5/14", "5/14/2026"
  const slash = p.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
  if (slash) {
    const month = parseInt(slash[1], 10) - 1;
    const day   = parseInt(slash[2], 10);
    let year    = slash[3] ? parseInt(slash[3], 10) : today.getFullYear();
    if (year < 100) year += 2000;
    const candidate = new Date(year, month, day);
    if (!slash[3] && candidate.getTime() < today.getTime() - 24 * 3600 * 1000) {
      candidate.setFullYear(year + 1);
    }
    return isoDate(candidate);
  }

  return null;
}

/**
 * Parse a list of date phrases like "may 14", "tuesday and friday", "mon, wed, fri".
 * Returns a sorted, deduped array of ISO dates. Returns [] if nothing parses.
 */
export function parseDates(input: string, today = new Date()): string[] {
  if (!input) return [];

  // Split on common separators: " and ", commas, " & ", " or "
  const parts = input
    .toLowerCase()
    .replace(/\s+&\s+/g, ",")
    .replace(/\s+and\s+/g, ",")
    .replace(/\s+or\s+/g, ",")
    .split(/[,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  // Also try the full string as-is in case it's a single date phrase.
  const candidates = parts.length > 0 ? parts : [input.toLowerCase().trim()];

  const out = new Set<string>();
  for (const c of candidates) {
    const date = parseDate(c, today);
    if (date) out.add(date);
  }

  return Array.from(out).sort();
}