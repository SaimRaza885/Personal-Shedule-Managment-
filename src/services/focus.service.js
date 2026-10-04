import { execute, query, queryOne } from "@/lib/database";
import { FOCUS_STATUS, TASK_STATUS } from "@/lib/constants";
import { setTaskStatus } from "@/services/task.service";
import { getTodaySchedule } from "@/services/today.service";

/**
 * Focus sessions record deep-work time against a task. A session is running
 * (started) or paused while open, then finished as completed or cancelled.
 * Time is always derived from started_at so pausing and resuming stay
 * accurate without extra columns.
 */

/**
 * A focus session joined with its task, as consumed by the Focus screen.
 * plannedMinutes is null when the session was never linked to a task's plan.
 * @typedef {{ id: string, taskId: string|null, taskTitle: string|null,
 *   startedAt: string, endedAt: string|null, plannedMinutes: number|null,
 *   actualMinutes: number, status: string, stepsTotal: number,
 *   stepsRemaining: number, distractionsCount: number }} FocusSession
 */

const SESSION_SELECT = `
  SELECT
    fs.id AS id,
    fs.task_id AS taskId,
    t.title AS taskTitle,
    fs.started_at AS startedAt,
    fs.ended_at AS endedAt,
    fs.planned_minutes AS plannedMinutes,
    fs.actual_minutes AS actualMinutes,
    fs.status AS status,
    (SELECT COUNT(*) FROM task_steps ts WHERE ts.task_id = fs.task_id)
      AS stepsTotal,
    (SELECT COUNT(*) FROM task_steps ts
      WHERE ts.task_id = fs.task_id AND ts.is_completed = 0)
      AS stepsRemaining,
    (SELECT COUNT(*) FROM distractions d WHERE d.focus_session_id = fs.id)
      AS distractionsCount
  FROM focus_sessions fs
  LEFT JOIN tasks t ON t.id = fs.task_id`;

function elapsedMinutesSince(isoTimestamp) {
  const startedMs = new Date(isoTimestamp).getTime();
  return Math.max(0, Math.round((Date.now() - startedMs) / 60000));
}

/** @returns {Promise<FocusSession|null>} */
export async function getActiveFocusSession() {
  try {
    const row = await queryOne(
      `${SESSION_SELECT}
       WHERE fs.status IN (?, ?)
       ORDER BY fs.created_at DESC
       LIMIT 1`,
      [FOCUS_STATUS.STARTED, FOCUS_STATUS.PAUSED],
    );
    return row ?? null;
  } catch (error) {
    console.error("[focus.service:getActiveFocusSession]", error);
    throw new Error("Could not load your focus session. Please try again.");
  }
}

/**
 * Finished sessions, most recent first, for the history list.
 * @param {number} [limit]
 * @returns {Promise<FocusSession[]>}
 */
export async function listFocusSessions(limit = 10) {
  try {
    return await query(
      `${SESSION_SELECT}
       WHERE fs.status IN (?, ?)
       ORDER BY fs.started_at DESC
       LIMIT ?`,
      [FOCUS_STATUS.COMPLETED, FOCUS_STATUS.CANCELLED, limit],
    );
  } catch (error) {
    console.error("[focus.service:listFocusSessions]", error);
    throw new Error("Could not load your recent sessions. Please try again.");
  }
}

/**
 * Today's scheduled tasks that are still open, as start-session options.
 * @param {string} date
 * @returns {Promise<import("@/services/today.service").ScheduleItem[]>}
 */
export async function listFocusCandidates(date) {
  try {
    const schedule = await getTodaySchedule(date);
    return schedule.filter(
      (item) =>
        item.status !== TASK_STATUS.COMPLETED &&
        item.status !== TASK_STATUS.CANCELLED,
    );
  } catch (error) {
    console.error("[focus.service:listFocusCandidates]", error);
    throw new Error("Could not load today's schedule. Please try again.");
  }
}

/**
 * @param {{ taskId: string }} input
 * @returns {Promise<string>} id of the created session
 */
export async function startFocusSession({ taskId }) {
  const active = await getActiveFocusSession();
  if (active) {
    throw new Error("You already have a focus session in progress.");
  }

  let task;
  try {
    task = await queryOne(
      "SELECT id, status, planned_minutes AS plannedMinutes FROM tasks WHERE id = ?",
      [taskId],
    );
  } catch (error) {
    console.error("[focus.service:startFocusSession]", error);
    throw new Error("Could not start the focus session. Please try again.");
  }
  if (!task) throw new Error("That task no longer exists.");

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  try {
    await execute(
      `INSERT INTO focus_sessions
         (id, task_id, started_at, planned_minutes, actual_minutes, status, created_at)
       VALUES (?, ?, ?, ?, 0, ?, ?)`,
      [id, taskId, now, task.plannedMinutes, FOCUS_STATUS.STARTED, now],
    );
  } catch (error) {
    console.error("[focus.service:startFocusSession]", error);
    throw new Error("Could not start the focus session. Please try again.");
  }

  if (task.status === TASK_STATUS.NOT_STARTED) {
    await setTaskStatus({ id: taskId, status: TASK_STATUS.IN_PROGRESS });
  }

  return id;
}

/**
 * @param {{ id: string }} input
 * @returns {Promise<{ actualMinutes: number }>}
 */
export async function pauseFocusSession({ id }) {
  const session = await findSession(id);
  if (!session) throw new Error("That focus session no longer exists.");
  if (session.status !== FOCUS_STATUS.STARTED) {
    throw new Error("Only a running session can be paused.");
  }

  const actualMinutes = elapsedMinutesSince(session.startedAt);

  try {
    await execute(
      "UPDATE focus_sessions SET status = ?, actual_minutes = ? WHERE id = ?",
      [FOCUS_STATUS.PAUSED, actualMinutes, id],
    );
  } catch (error) {
    console.error("[focus.service:pauseFocusSession]", error);
    throw new Error("Could not pause the session. Please try again.");
  }

  return { actualMinutes };
}

/** @param {{ id: string }} input @returns {Promise<void>} */
export async function resumeFocusSession({ id }) {
  const session = await findSession(id);
  if (!session) throw new Error("That focus session no longer exists.");
  if (session.status !== FOCUS_STATUS.PAUSED) {
    throw new Error("Only a paused session can be resumed.");
  }

  // The schema stores a single started_at, so resuming shifts it back by the
  // time already accumulated; elapsed time stays (now - started_at) in every
  // open state.
  const shiftedStart = new Date(
    Date.now() - session.actualMinutes * 60000,
  ).toISOString();

  try {
    await execute(
      "UPDATE focus_sessions SET started_at = ?, status = ? WHERE id = ?",
      [shiftedStart, FOCUS_STATUS.STARTED, id],
    );
  } catch (error) {
    console.error("[focus.service:resumeFocusSession]", error);
    throw new Error("Could not resume the session. Please try again.");
  }
}

async function findSession(id) {
  try {
    return await queryOne(
      `SELECT id, task_id AS taskId, status, started_at AS startedAt,
              planned_minutes AS plannedMinutes, actual_minutes AS actualMinutes
       FROM focus_sessions WHERE id = ?`,
      [id],
    );
  } catch (error) {
    console.error("[focus.service:findSession]", error);
    throw new Error("Could not load the focus session. Please try again.");
  }
}

async function finishSession(id, status) {
  const session = await findSession(id);
  if (!session) throw new Error("That focus session no longer exists.");
  if (
    session.status === FOCUS_STATUS.COMPLETED ||
    session.status === FOCUS_STATUS.CANCELLED
  ) {
    throw new Error("This session is already finished.");
  }

  const endedAt = new Date().toISOString();
  const actualMinutes =
    session.status === FOCUS_STATUS.STARTED
      ? elapsedMinutesSince(session.startedAt)
      : session.actualMinutes;

  try {
    await execute(
      `UPDATE focus_sessions
       SET status = ?, actual_minutes = ?, ended_at = ?
       WHERE id = ?`,
      [status, actualMinutes, endedAt, id],
    );
    if (session.taskId) {
      await execute(
        "UPDATE tasks SET actual_minutes = actual_minutes + ?, updated_at = ? WHERE id = ?",
        [actualMinutes, endedAt, session.taskId],
      );
    }
  } catch (error) {
    console.error("[focus.service:finishSession]", error);
    throw new Error(
      status === FOCUS_STATUS.COMPLETED
        ? "Could not complete the session. Please try again."
        : "Could not cancel the session. Please try again.",
    );
  }

  return {
    actualMinutes,
    plannedMinutes: session.plannedMinutes,
    status,
  };
}

/**
 * Finish a session as completed and add its focused time to the task's
 * actual_minutes rollup.
 * @param {{ id: string }} input
 * @returns {Promise<{ actualMinutes: number, plannedMinutes: number|null, status: string }>}
 */
export function completeFocusSession({ id }) {
  return finishSession(id, FOCUS_STATUS.COMPLETED);
}

/**
 * Finish a session as cancelled. Time already spent still rolls up to the
 * task because it was real focus time.
 * @param {{ id: string }} input
 * @returns {Promise<{ actualMinutes: number, plannedMinutes: number|null, status: string }>}
 */
export function cancelFocusSession({ id }) {
  return finishSession(id, FOCUS_STATUS.CANCELLED);
}
