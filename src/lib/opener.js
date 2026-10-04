import { openUrl } from "@tauri-apps/plugin-opener";
import { isTauri } from "@/lib/database";

/**
 * Open an external URL in the user's default browser.
 * In the Tauri desktop shell this goes through the opener plugin so the
 * link opens a real browser window; in a plain browser (dev) it falls back
 * to window.open. Throws when the URL cannot be opened.
 * @param {string} url
 * @returns {Promise<void>}
 */
export async function openExternal(url) {
  if (isTauri()) {
    await openUrl(url);
    return;
  }
  const opened = window.open(url, "_blank", "noopener,noreferrer");
  if (!opened) {
    throw new Error("Could not open the link");
  }
}
