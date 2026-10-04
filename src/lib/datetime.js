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
