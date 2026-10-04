import { execute, executeTransaction, query } from "@/lib/database";
import { DEFAULT_VALUES, TASK_STATUS } from "@/lib/constants";

/**
 * A scheduled block that can still be picked for the Daily Top 3.
 * @typedef {{ id: string, taskId: string, title: string, startTime: string, endTime: string }} TopThreeCandidate
 */

/**
 * Today's scheduled tasks that are not completed/cancelled and not already
 * in the Top 3. The picker consumes this; daily_schedules is the source.
 * @param {string} date
 * @returns {Promise<TopThreeCandidate[]>}
 */
export async function listTopThreeCandidates(date) {
  return query(
    `SELECT
       ds.id AS id,
       ds.task_id AS taskId,
       t.title AS title,
       ds.start_time AS startTime,
       ds.end_time AS endTime
     FROM daily_schedules ds
     JOIN tasks t ON t.id = ds.task_id
     WHERE ds.date = ?
       AND t.status NOT IN (?, ?)
       AND ds.task_id NOT IN (
         SELECT task_id FROM daily_top_three WHERE date = ?
       )
     ORDER BY ds.start_time`,
    [date, TASK_STATUS.COMPLETED, TASK_STATUS.CANCELLED, date],
  );
}

/**
 * Add a task to the day's Top 3 at the next free position. The CHECK
 * constraint caps positions at 1..3, but the count guard gives a friendly
 * message instead of a raw constraint error.
 * @param {{ date: string, taskId: string }} input
 * @returns {Promise<string>} id of the created daily_top_three row
 */
export async function addTopThreeTask({ date, taskId }) {
  try {
    const scheduled = await query(
      `SELECT COUNT(*) AS count
       FROM daily_schedules ds
       JOIN tasks t ON t.id = ds.task_id
       WHERE ds.date = ? AND ds.task_id = ?
         AND t.status NOT IN (?, ?)`,
      [date, taskId, TASK_STATUS.COMPLETED, TASK_STATUS.CANCELLED],
    );
    if (scheduled[0].count === 0) {
      throw new Error("That task is not scheduled for today.");
    }

    const existing = await query(
      "SELECT COUNT(*) AS count FROM daily_top_three WHERE date = ? AND task_id = ?",
      [date, taskId],
    );
    if (existing[0].count > 0) {
      throw new Error("That task is already in your Top 3.");
    }

    const count = await query(
      "SELECT COUNT(*) AS count FROM daily_top_three WHERE date = ?",
      [date],
    );
    if (count[0].count >= DEFAULT_VALUES.DAILY_TOP_THREE_MAX) {
      throw new Error(
        "Your Top 3 is full. Remove a task before adding another.",
      );
    }

    const id = crypto.randomUUID();
    await execute(
      `INSERT INTO daily_top_three (id, date, task_id, position, created_at)
       VALUES (
         ?,
         ?,
         ?,
         COALESCE(
           (SELECT MAX(position) FROM daily_top_three WHERE date = ?), 0
         ) + 1,
         ?
       )`,
      [id, date, taskId, date, new Date().toISOString()],
    );

    return id;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("That ")) {
      throw error;
    }
    console.error("[top-three.service:addTopThreeTask]", error);
    throw new Error("Could not add the task to your Top 3. Please try again.");
  }
}

/**
 * Remove an entry and close the position gap so ranks stay 1..n.
 * daily_top_three has UNIQUE(date, position), so positions are rewritten by
 * delete + re-insert inside the transaction — direct swaps would collide
 * with the constraint mid-update.
 * @param {{ date: string, id: string }} input
 * @returns {Promise<void>}
 */
export async function removeTopThreeTask({ date, id }) {
  try {
    const rows = await query(
      `SELECT id, task_id AS taskId, created_at AS createdAt
       FROM daily_top_three WHERE date = ? ORDER BY position`,
      [date],
    );
    const remaining = rows.filter((row) => row.id !== id);
    if (remaining.length === rows.length) {
      throw new Error(`Top 3 entry ${id} not found`);
    }

    const { sql, params } = buildRewritePositions(date, remaining);
    await executeTransaction(sql, params);
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      throw new Error("That Top 3 task was already removed.");
    }
    console.error("[top-three.service:removeTopThreeTask]", error);
    throw new Error("Could not remove the task from your Top 3. Please try again.");
  }
}

/**
 * Swap an entry with the entry above or below it. Same rewrite approach as
 * removeTopThreeTask — the UNIQUE(date, position) pair cannot be updated in
 * place without a colliding intermediate state.
 * @param {{ date: string, id: string, direction: "up" | "down" }} input
 * @returns {Promise<void>}
 */
export async function moveTopThreeTask({ date, id, direction }) {
  try {
    const rows = await query(
      `SELECT id, task_id AS taskId, created_at AS createdAt
       FROM daily_top_three WHERE date = ? ORDER BY position`,
      [date],
    );
    const index = rows.findIndex((row) => row.id === id);
    if (index === -1) {
      throw new Error(`Top 3 entry ${id} not found`);
    }

    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= rows.length) {
      return;
    }

    const reordered = [...rows];
    [reordered[index], reordered[target]] = [
      reordered[target],
      reordered[index],
    ];
    const { sql, params } = buildRewritePositions(date, reordered);
    await executeTransaction(sql, params);
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      throw new Error("That Top 3 task was already removed.");
    }
    console.error("[top-three.service:moveTopThreeTask]", error);
    throw new Error("Could not reorder your Top 3. Please try again.");
  }
}

/**
 * Build a single transactional batch that rewrites every position for the
 * day in order, giving ranks 1..n with no gaps.
 * @param {string} date
 * @param {Array<{ id: string, taskId: string, createdAt: string }>} orderedEntries
 * @returns {{ sql: string, params: unknown[] }}
 */
function buildRewritePositions(date, orderedEntries) {
  const statements = ["DELETE FROM daily_top_three WHERE date = ?"];
  const params = [date];

  for (let i = 0; i < orderedEntries.length; i += 1) {
    statements.push(
      `INSERT INTO daily_top_three (id, date, task_id, position, created_at)
       VALUES (?, ?, ?, ?, ?)`,
    );
    params.push(
      orderedEntries[i].id,
      date,
      orderedEntries[i].taskId,
      i + 1,
      orderedEntries[i].createdAt,
    );
  }

  return { sql: statements.join(";\n"), params };
}
