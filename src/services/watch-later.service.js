import { execute, query } from "@/lib/database";
import { WATCH_STATUS } from "@/lib/constants";

/**
 * Read + write operations for Watch Later. Links are things worth your
 * time, so each one can carry a scheduled date instead of rotting in an
 * endless backlog. Nothing here converts an item into a task — that
 * stays manual for now.
 */

const STATUS_ORDER = [WATCH_STATUS.PENDING, WATCH_STATUS.WATCHED];

// Null scheduled dates sort last — a distant sentinel keeps the
// comparator simple and stable.
const NO_DATE = "9999-99-99";

/**
 * @typedef {Object} WatchItem
 * @property {string} id
 * @property {string} title
 * @property {string} url
 * @property {string|null} scheduledDate
 * @property {string} status
 * @property {string} createdAt
 * @property {string} updatedAt
 */

function toWatchItem(row) {
  return {
    id: row.id,
    title: row.title,
    url: row.url ?? "",
    scheduledDate: row.scheduled_date ?? null,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * All items: pending before watched, then soonest scheduled date first,
 * newest first within the same rank and date. Unscheduled items sit at
 * the end of the pending group.
 * @returns {Promise<WatchItem[]>}
 */
export async function listWatchLater() {
  try {
    const rows = await query(
      "SELECT * FROM watch_later ORDER BY created_at DESC",
    );
    const items = rows.map(toWatchItem);
    // Status and date ranks sorted in JS — no enum literals in SQL.
    return items.sort((a, b) => {
      const rankDiff =
        STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
      if (rankDiff !== 0) return rankDiff;
      return (a.scheduledDate ?? NO_DATE).localeCompare(
        b.scheduledDate ?? NO_DATE,
      );
    });
  } catch (error) {
    console.error("[watch-later.service:listWatchLater]", error);
    throw new Error("Could not load your watch list. Please try again.");
  }
}

/**
 * @param {{ title: string, url?: string, scheduledDate?: string|null }} input
 * @returns {Promise<string>} id of the created item
 */
export async function createWatchItem({
  title,
  url = "",
  scheduledDate = null,
}) {
  const trimmed = title.trim();
  if (!trimmed) throw new Error("Give the item a title");

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  try {
    await execute(
      `INSERT INTO watch_later (id, title, url, scheduled_date, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        trimmed,
        url.trim(),
        scheduledDate || null,
        WATCH_STATUS.PENDING,
        now,
        now,
      ],
    );
  } catch (error) {
    console.error("[watch-later.service:createWatchItem]", error);
    throw new Error("Could not save the link. Please try again.");
  }
  return id;
}

/**
 * @param {{ id: string, title: string, url: string,
 *   scheduledDate: string|null, status: string }} input
 * @returns {Promise<void>}
 */
export async function updateWatchItem({
  id,
  title,
  url,
  scheduledDate,
  status,
}) {
  const trimmed = title.trim();
  if (!trimmed) throw new Error("Give the item a title");

  try {
    const result = await execute(
      `UPDATE watch_later
       SET title = ?, url = ?, scheduled_date = ?, status = ?, updated_at = ?
       WHERE id = ?`,
      [
        trimmed,
        url.trim(),
        scheduledDate || null,
        status,
        new Date().toISOString(),
        id,
      ],
    );
    if (result.rowsAffected === 0) {
      throw new Error(`Watch item ${id} not found`);
    }
  } catch (error) {
    console.error("[watch-later.service:updateWatchItem]", error);
    throw new Error("Could not update the link. Please try again.");
  }
}

/**
 * Single transition used by the card's watched/unwatched toggle.
 * @param {{ id: string, status: string }} input
 * @returns {Promise<void>}
 */
export async function setWatchItemStatus({ id, status }) {
  try {
    const result = await execute(
      "UPDATE watch_later SET status = ?, updated_at = ? WHERE id = ?",
      [status, new Date().toISOString(), id],
    );
    if (result.rowsAffected === 0) {
      throw new Error(`Watch item ${id} not found`);
    }
  } catch (error) {
    console.error("[watch-later.service:setWatchItemStatus]", error);
    throw new Error("Could not update the link status. Please try again.");
  }
}

/**
 * @param {{ id: string }} input
 * @returns {Promise<void>}
 */
export async function deleteWatchItem({ id }) {
  try {
    const result = await execute("DELETE FROM watch_later WHERE id = ?", [id]);
    if (result.rowsAffected === 0) {
      throw new Error(`Watch item ${id} not found`);
    }
  } catch (error) {
    console.error("[watch-later.service:deleteWatchItem]", error);
    throw new Error("Could not delete the link. Please try again.");
  }
}
