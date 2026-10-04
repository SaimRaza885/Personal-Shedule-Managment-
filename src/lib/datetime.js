import { format, parse } from "date-fns";
import { DATE_FORMATS } from "./constants";

/**
 * Stored times are "HH:mm" (24-hour). Display them at the UI boundary.
 * @param {string} hhmm
 * @returns {string} e.g. "9:00 AM"
 */
export function formatTime(hhmm) {
  if (!hhmm) return "";
  return format(parse(hhmm.slice(0, 5), "HH:mm", new Date()), DATE_FORMATS.TIME);
}

/**
 * Stored dates are "yyyy-MM-dd". Display them at the UI boundary.
 * @param {string} isoDate
 * @returns {string} e.g. "Mar 15, 2026"
 */
export function formatDate(isoDate) {
  if (!isoDate) return "";
  return format(parse(isoDate, DATE_FORMATS.ISO, new Date()), DATE_FORMATS.DAY);
}
