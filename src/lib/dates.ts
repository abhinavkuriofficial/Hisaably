import type { ISODate } from "../types/models";

/** Today's date on the user's own clock, like "2026-11-24". */
export function todayISODate(now: Date = new Date()): ISODate {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-11-24" -> "24 Nov 2026" (only for showing on screen) */
export function formatDate(date: ISODate): string {
  const [year, month, day] = date.split("-").map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}