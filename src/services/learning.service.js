import { execute, query } from "@/lib/database";

/**
 * Read + write operations for "What I Learned". Entries are free-form notes
 * the user jots down for themselves — nothing here quizzes, schedules or
 * resurfaces them. Chronological by learning date, newest first.
 */

/**
 * @typedef {Object} LearningEntry
 * @property {string} id
 * @property {string} title
 * @property {string} content
 * @property {string} date        yyyy-MM-dd
 * @property {string} createdAt
 * @property {string} updatedAt
 */

function toEntry(row) {
  return {
    id: row.id,
    title: row.title,
    content: row.content ?? "",
    date: row.date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * @returns {Promise<LearningEntry[]>}
 */
export async function listLearningEntries() {
  try {
    const rows = await query(
      "SELECT * FROM learning_entries ORDER BY date DESC, created_at DESC",
    );
    return rows.map(toEntry);
  } catch (error) {
    console.error("[learning.service:listLearningEntries]", error);
    throw new Error("Could not load your learning notes. Please try again.");
  }
}

/**
 * @param {{ title: string, content?: string, date: string }} input
 * @returns {Promise<string>} id of the created entry
 */
export async function createLearningEntry({ title, content = "", date }) {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) throw new Error("Give this learning note a title.");
  const trimmedDate = date.trim();
  if (!trimmedDate) throw new Error("Pick a date for this learning note.");

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  try {
    await execute(
      `INSERT INTO learning_entries (id, title, content, date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, trimmedTitle, content.trim(), trimmedDate, now, now],
    );
  } catch (error) {
    console.error("[learning.service:createLearningEntry]", error);
    throw new Error("Could not save the learning note. Please try again.");
  }
  return id;
}

/**
 * @param {{ id: string, title: string, content: string, date: string }} input
 * @returns {Promise<void>}
 */
export async function updateLearningEntry({ id, title, content, date }) {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) throw new Error("Give this learning note a title.");
  const trimmedDate = date.trim();
  if (!trimmedDate) throw new Error("Pick a date for this learning note.");

  try {
    const result = await execute(
      `UPDATE learning_entries
       SET title = ?, content = ?, date = ?, updated_at = ?
       WHERE id = ?`,
      [trimmedTitle, content.trim(), trimmedDate, new Date().toISOString(), id],
    );
    if (result.rowsAffected === 0) {
      throw new Error(`Learning entry ${id} not found`);
    }
  } catch (error) {
    console.error("[learning.service:updateLearningEntry]", error);
    throw new Error("Could not update the learning note. Please try again.");
  }
}

/**
 * @param {{ id: string }} input
 * @returns {Promise<void>}
 */
export async function deleteLearningEntry({ id }) {
  try {
    const result = await execute("DELETE FROM learning_entries WHERE id = ?", [
      id,
    ]);
    if (result.rowsAffected === 0) {
      throw new Error(`Learning entry ${id} not found`);
    }
  } catch (error) {
    console.error("[learning.service:deleteLearningEntry]", error);
    throw new Error("Could not delete the learning note. Please try again.");
  }
}
