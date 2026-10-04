import { execute, query } from "@/lib/database";

/**
 * Distractions are logged while a focus session runs, for personal
 * awareness and later analytics — never as punishment. Each entry belongs
 * to exactly one session (FK cascade).
 */

const DISTRACTION_SELECT = `
  SELECT
    id AS id,
    focus_session_id AS focusSessionId,
    reason AS reason,
    notes AS notes,
    occurred_at AS occurredAt,
    created_at AS createdAt
  FROM distractions`;

/**
 * @param {{ focusSessionId: string, reason: string, notes?: string }} input
 * @returns {Promise<string>} id of the created distraction row
 */
export async function logDistraction({ focusSessionId, reason, notes = "" }) {
  const trimmedReason = reason.trim();
  if (!trimmedReason) {
    throw new Error("Pick or describe what pulled you away.");
  }
  const trimmedNotes = notes.trim();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  try {
    await execute(
      `INSERT INTO distractions
         (id, focus_session_id, reason, notes, occurred_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, focusSessionId, trimmedReason, trimmedNotes, now, now],
    );
  } catch (error) {
    console.error("[distraction.service:logDistraction]", error);
    throw new Error("Could not log the distraction. Please try again.");
  }
  return id;
}

/**
 * All distractions for one focus session, oldest first.
 * @param {string} focusSessionId
 * @returns {Promise<Array<{ id: string, focusSessionId: string, reason: string,
 *   notes: string, occurredAt: string, createdAt: string }>>}
 */
export async function listSessionDistractions(focusSessionId) {
  try {
    return await query(
      `${DISTRACTION_SELECT}
       WHERE focus_session_id = ?
       ORDER BY occurred_at ASC`,
      [focusSessionId],
    );
  } catch (error) {
    console.error("[distraction.service:listSessionDistractions]", error);
    throw new Error("Could not load distractions. Please try again.");
  }
}
