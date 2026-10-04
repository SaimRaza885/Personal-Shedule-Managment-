import { execute, query, queryOne } from "@/lib/database";
import {
  CONVERTED_TYPE,
  DEFAULT_VALUES,
  TASK_PRIORITY,
  TASK_STATUS,
} from "@/lib/constants";
import { createTask } from "@/services/task.service";

/**
 * Read + write operations for quick captures. A capture is a fast,
 * free-form thought; organizing it (convert to a task, or delete) is a
 * separate, deliberate step. Converted rows stay for history and the
 * created target is never modified from here.
 */

const MAX_TASK_TITLE = 120;

/**
 * @typedef {Object} Capture
 * @property {string} id
 * @property {string} content
 * @property {string} capturedAt
 * @property {string|null} convertedType
 * @property {string|null} convertedId
 */

function toCapture(row) {
  return {
    id: row.id,
    content: row.content,
    capturedAt: row.captured_at,
    convertedType: row.converted_type,
    convertedId: row.converted_id,
  };
}

/**
 * All captures, newest first, with not-yet-organized ones on top.
 * @returns {Promise<Capture[]>}
 */
export async function listCaptures() {
  try {
    const rows = await query(
      "SELECT * FROM quick_captures ORDER BY captured_at DESC",
    );
    const captures = rows.map(toCapture);
    // Stable sort: organized captures keep history but sink below the inbox.
    return captures.sort(
      (a, b) => (a.convertedType ? 1 : 0) - (b.convertedType ? 1 : 0),
    );
  } catch (error) {
    console.error("[quick-capture.service:listCaptures]", error);
    throw new Error("Could not load your captures. Please try again.");
  }
}

/**
 * Store a thought exactly as typed — no structure, no questions asked.
 * @param {{ content: string }} input
 * @returns {Promise<string>} id of the created capture
 */
export async function createCapture({ content }) {
  const trimmed = content.trim();
  if (!trimmed) throw new Error("Capture something first");

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  try {
    await execute(
      `INSERT INTO quick_captures (id, content, captured_at, created_at)
       VALUES (?, ?, ?, ?)`,
      [id, trimmed, now, now],
    );
  } catch (error) {
    console.error("[quick-capture.service:createCapture]", error);
    throw new Error("Could not save your capture. Please try again.");
  }
  return id;
}

/**
 * Turn a capture into a real task. Long content becomes the task
 * description with a shortened title. The capture is marked converted
 * and kept for history; both writes share one transaction.
 * @param {{ id: string }} input
 * @returns {Promise<string>} id of the created task
 */
export async function convertCaptureToTask({ id }) {
  const capture = await queryOne("SELECT * FROM quick_captures WHERE id = ?", [id]);
  if (!capture) throw new Error("That capture no longer exists.");
  if (capture.converted_type) {
    throw new Error("This capture has already been organized.");
  }

  const content = capture.content.trim();
  const truncated = content.length > MAX_TASK_TITLE;
  const title = truncated
    ? `${content.slice(0, MAX_TASK_TITLE - 1).trimEnd()}…`
    : content;

  try {
    await execute("BEGIN");
    const taskId = await createTask({
      title,
      description: truncated ? content : "",
      priority: TASK_PRIORITY.MEDIUM,
      status: TASK_STATUS.NOT_STARTED,
      plannedMinutes: DEFAULT_VALUES.PLANNED_MINUTES,
    });
    await execute(
      "UPDATE quick_captures SET converted_type = ?, converted_id = ? WHERE id = ?",
      [CONVERTED_TYPE.TASK, taskId, id],
    );
    await execute("COMMIT");
    return taskId;
  } catch (error) {
    await execute("ROLLBACK").catch(() => {});
    console.error("[quick-capture.service:convertCaptureToTask]", error);
    throw new Error(
      "Could not convert the capture into a task. Please try again.",
    );
  }
}

/**
 * Delete a capture. If it was already converted, the created task or
 * idea is left untouched — only the capture row disappears.
 * @param {{ id: string }} input
 * @returns {Promise<void>}
 */
export async function deleteCapture({ id }) {
  try {
    const result = await execute("DELETE FROM quick_captures WHERE id = ?", [id]);
    if (result.rowsAffected === 0) {
      throw new Error(`Capture ${id} not found`);
    }
  } catch (error) {
    console.error("[quick-capture.service:deleteCapture]", error);
    throw new Error("Could not delete the capture. Please try again.");
  }
}
