import { isPermissionGranted, requestPermission, sendNotification } from "@tauri-apps/plugin-notification";
import { isTauri } from "./database";

/**
 * Send a Windows desktop notification.
 * No-ops outside the Tauri shell (plain-browser dev) so UI work never crashes.
 * @param {{ title: string, body?: string }} options
 * @returns {Promise<void>}
 */
export async function notify({ title, body }) {
  if (!isTauri()) return;

  try {
    let granted = await isPermissionGranted();
    if (!granted) {
      const permission = await requestPermission();
      granted = permission === "granted";
    }
    if (granted) {
      await sendNotification({ title, body });
    }
  } catch (error) {
    console.error("[notifications:notify]", error);
  }
}
