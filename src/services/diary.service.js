import { execute, query } from "@/lib/database";

/**
 * Read + write operations for the Digital Diary. Entries are completely
 * free-form — no titles, prompts, or structure — and separate from the
 * structured daily/weekly reviews. Chronological by entry date, newest first.
 */

/**
 * @typedef {Object} DiaryEntry
 * @property {string} id
 * @property {string} date        yyyy-MM-dd
 * @property {string} content
 * @property {string} createdAt
 * @property {string} updatedAt
 */

function toEntry(row) {
  return {
    id: row.id,
    date: row.date,
    content: row.content ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * @returns {Promise<DiaryEntry[]>}
 */
export async function listDiaryEntries() {
  try {
    const rows = await query(
      "SELECT * FROM diary_entries ORDER BY date DESC, created_at DESC",
    );
    return rows.map(toEntry);
  } catch (error) {
    console.error("[diary.service:listDiaryEntries]", error);
    throw new Error("Could not load your diary. Please try again.");
  }
}

/**
 * @param {{ date: string, content: string }} input
 * @returns {Promise<string>} id of the created entry
 */
export async function createDiaryEntry({ date, content }) {
  const trimmedContent = content.trim();
  if (!trimmedContent) throw new Error("Write something before saving.");
  const trimmedDate = date.trim();
  if (!trimmedDate) throw new Error("Pick a date for this entry.");

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  try {
    await execute(
      `INSERT INTO diary_entries (id, date, content, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      [id, trimmedDate, trimmedContent, now, now],
    );
  } catch (error) {
    console.error("[diary.service:createDiaryEntry]", error);
    throw new Error("Could not save the diary entry. Please try again.");
  }
  return id;
}

/**
 * @param {{ id: string, date: string, content: string }} input
 * @returns {Promise<void>}
 */
export async function updateDiaryEntry({ id, date, content }) {
  const trimmedContent = content.trim();
  if (!trimmedContent) throw new Error("Write something before saving.");
  const trimmedDate = date.trim();
  if (!trimmedDate) throw new Error("Pick a date for this entry.");

  try {
    const result = await execute(
      `UPDATE diary_entries
       SET date = ?, content = ?, updated_at = ?
       WHERE id = ?`,
      [trimmedDate, trimmedContent, new Date().toISOString(), id],
    );
    if (result.rowsAffected === 0) {
      throw new Error(`Diary entry ${id} not found`);
    }
  } catch (error) {
    console.error("[diary.service:updateDiaryEntry]", error);
    throw new Error("Could not update the diary entry. Please try again.");
  }
}

/**
 * @param {{ id: string }} input
 * @returns {Promise<void>}
 */
export async function deleteDiaryEntry({ id }) {
  try {
    const result = await execute("DELETE FROM diary_entries WHERE id = ?", [
      id,
    ]);
    if (result.rowsAffected === 0) {
      throw new Error(`Diary entry ${id} not found`);
    }
  } catch (error) {
    console.error("[diary.service:deleteDiaryEntry]", error);
    throw new Error("Could not delete the diary entry. Please try again.");
  }
}
