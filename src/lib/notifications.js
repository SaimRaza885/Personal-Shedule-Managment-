import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";
import { isTauri } from "@/lib/database";

/**
 * Thin wrapper over desktop notifications.
 * In the Tauri desktop shell this uses the OS notification plugin;
 * in a plain browser (dev) it falls back to the Notification Web API.
 * @returns {boolean}
 */
export function notificationsSupported() {
  if (isTauri()) return true;
  return typeof window !== "undefined" && "Notification" in window;
}

/**
 * Ask the OS/browser for permission if it has not been decided yet.
 * @returns {Promise<boolean>} whether notifications may be shown
 */
export async function ensureNotificationPermission() {
  if (!notificationsSupported()) return false;
  try {
    if (isTauri()) {
      if (await isPermissionGranted()) return true;
      return (await requestPermission()) === "granted";
    }
    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") return false;
    return (await Notification.requestPermission()) === "granted";
  } catch (error) {
    console.error("[notifications:ensureNotificationPermission]", error);
    return false;
  }
}

/**
 * Show one desktop notification. Never throws — a failed reminder
 * must not break the screen it fired from.
 * @param {{ title: string, body: string }} notification
 * @returns {Promise<boolean>} whether it reached the operating system
 */
export async function sendDesktopNotification({ title, body }) {
  if (!notificationsSupported()) return false;
  try {
    if (isTauri()) {
      if (!(await ensureNotificationPermission())) return false;
      sendNotification({ title, body });
      return true;
    }
    if (Notification.permission !== "granted") return false;
    new Notification(title, { body });
    return true;
  } catch (error) {
    console.error("[notifications:sendDesktopNotification]", error);
    return false;
  }
}
