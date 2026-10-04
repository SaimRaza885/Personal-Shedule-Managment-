import { execute, queryOne } from "@/lib/database";
import { DEFAULT_VALUES, SETTING_KEYS } from "@/lib/constants";

/**
 * Read/write access to the local settings store (key/value rows).
 * Callers get typed, validated values — never raw strings.
 */

/**
 * Minutes the user actually has for planned work today.
 * Falls back to the default when unset or invalid.
 * @returns {Promise<number>}
 */
export async function getAvailableMinutes() {
  const row = await queryOne(
    "SELECT value FROM settings WHERE key = ?",
    [SETTING_KEYS.AVAILABLE_MINUTES],
  );
  const parsed = Number.parseInt(row?.value ?? "", 10);
  return Number.isInteger(parsed) && parsed > 0
    ? parsed
    : DEFAULT_VALUES.AVAILABLE_MINUTES;
}

/**
 * @param {number} minutes
 * @returns {Promise<void>}
 */
export async function setAvailableMinutes(minutes) {
  if (!Number.isInteger(minutes) || minutes <= 0) {
    throw new Error("Available time must be at least 15 minutes");
  }
  try {
    await execute(
      `INSERT INTO settings (key, value) VALUES (?, ?)
       ON CONFLICT (key) DO UPDATE SET value = excluded.value`,
      [SETTING_KEYS.AVAILABLE_MINUTES, String(minutes)],
    );
  } catch (error) {
    console.error("[settings.service:setAvailableMinutes]", error);
    throw new Error("Could not save your available time. Please try again.");
  }
}
