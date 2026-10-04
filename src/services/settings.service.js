import { execute, query, queryOne } from "@/lib/database";
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

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * Desktop notification preferences.
 * Lead minutes fire a reminder early before a scheduled block (0 = at start).
 * An empty evening review time disables that reminder.
 * @returns {Promise<{ enabled: boolean, leadMinutes: number, eveningReviewTime: string }>}
 */
export async function getNotificationSettings() {
  const rows = await query(
    "SELECT key, value FROM settings WHERE key IN (?, ?, ?)",
    [
      SETTING_KEYS.NOTIFICATIONS_ENABLED,
      SETTING_KEYS.NOTIFICATION_LEAD_MINUTES,
      SETTING_KEYS.EVENING_REVIEW_TIME,
    ],
  );
  const stored = Object.fromEntries(rows.map((row) => [row.key, row.value]));

  const enabledValue = stored[SETTING_KEYS.NOTIFICATIONS_ENABLED];
  const enabled = enabledValue === undefined ? true : enabledValue === "true";

  const leadValue = Number.parseInt(
    stored[SETTING_KEYS.NOTIFICATION_LEAD_MINUTES] ?? "",
    10,
  );
  const leadMinutes =
    Number.isInteger(leadValue) && leadValue >= 0 && leadValue <= 60
      ? leadValue
      : DEFAULT_VALUES.NOTIFICATION_LEAD_MINUTES;

  const reviewValue = stored[SETTING_KEYS.EVENING_REVIEW_TIME];
  const eveningReviewTime =
    reviewValue === undefined ||
    (reviewValue !== "" && !TIME_PATTERN.test(reviewValue))
      ? DEFAULT_VALUES.EVENING_REVIEW_TIME
      : reviewValue;

  return { enabled, leadMinutes, eveningReviewTime };
}

/**
 * @param {{ enabled: boolean, leadMinutes: number, eveningReviewTime: string }} settings
 * @returns {Promise<void>}
 */
export async function setNotificationSettings({
  enabled,
  leadMinutes,
  eveningReviewTime,
}) {
  if (typeof enabled !== "boolean") {
    throw new Error("Notifications must be turned on or off");
  }
  if (!Number.isInteger(leadMinutes) || leadMinutes < 0 || leadMinutes > 60) {
    throw new Error("Reminder lead time must be between 0 and 60 minutes");
  }
  if (eveningReviewTime !== "" && !TIME_PATTERN.test(eveningReviewTime)) {
    throw new Error("Evening review time must be a valid time");
  }
  try {
    const upsert = `INSERT INTO settings (key, value) VALUES (?, ?)
       ON CONFLICT (key) DO UPDATE SET value = excluded.value`;
    await execute(upsert, [
      SETTING_KEYS.NOTIFICATIONS_ENABLED,
      String(enabled),
    ]);
    await execute(upsert, [
      SETTING_KEYS.NOTIFICATION_LEAD_MINUTES,
      String(leadMinutes),
    ]);
    await execute(upsert, [
      SETTING_KEYS.EVENING_REVIEW_TIME,
      eveningReviewTime,
    ]);
  } catch (error) {
    console.error("[settings.service:setNotificationSettings]", error);
    throw new Error("Could not save notification settings. Please try again.");
  }
}
