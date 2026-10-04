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

/**
 * Stored timestamps are full ISO strings (e.g. focus session start/end).
 * @param {string} isoTimestamp
 * @returns {string} e.g. "Mar 15, 9:00 AM"
 */
export function formatTimestamp(isoTimestamp) {
  if (!isoTimestamp) return "";
  return format(
    new Date(isoTimestamp),
    `${DATE_FORMATS.SHORT}, ${DATE_FORMATS.TIME}`,
  );
}

/**
 * Human-friendly duration from whole minutes.
 * @param {number} totalMinutes
 * @returns {string} e.g. "45 min", "1h 20m"
 */
export function formatMinutes(totalMinutes) {
  const minutes = Math.max(0, Math.round(totalMinutes ?? 0));
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  if (rest === 0) return `${hours}h`;
  return `${hours}h ${rest}m`;
}

/**
 * Live stopwatch display.
 * @param {number} ms
 * @returns {string} e.g. "04:32" or "1:02:09"
 */
export function formatElapsed(ms) {
  const pad = (value) => String(value).padStart(2, "0");
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours === 0) return `${pad(minutes)}:${pad(seconds)}`;
  return `${hours}:${pad(minutes)}:${pad(seconds)}`;
}
