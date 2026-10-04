import { execute, query } from "@/lib/database";
import { TASK_PRIORITY, TASK_STATUS } from "@/lib/constants";

/**
 * Read and write operations for tasks and their steps. Tasks are the unit
 * of work: they can link to a project and/or a goal, carry steps that break
 * them down, and are scheduled through daily_schedules (never through the
 * tasks table's own date/time columns).
 */

// Active work surfaces first, cancelled sinks to the bottom.
const STATUS_ORDER = [
  TASK_STATUS.IN_PROGRESS,
  TASK_STATUS.NOT_STARTED,
  TASK_STATUS.PAUSED,
  TASK_STATUS.COMPLETED,
  TASK_STATUS.CANCELLED,
];

const PRIORITY_ORDER = [
  TASK_PRIORITY.HIGH,
  TASK_PRIORITY.MEDIUM,
  TASK_PRIORITY.LOW,
];

function byStatusAndPriority(a, b) {
  const statusRank =
    STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
  if (statusRank !== 0) return statusRank;
  return PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority);
}

/**
 * List tasks with their linked project/goal titles and step counts so the
 * list renders without extra queries.
 * @param {{ status?: string }} [filters]
 * @returns {Promise<Record<string, unknown>[]>}
 */
export async function listTasks(filters = {}) {
  const { status } = filters;
  const where = status ? "WHERE t.status = ?" : "";
  const params = status ? [status] : [];

  try {
    const rows = await query(
      `SELECT
         t.id, t.title, t.description,
         t.project_id AS projectId, p.name AS projectName,
         t.goal_id AS goalId, g.title AS goalTitle,
         t.planned_minutes AS plannedMinutes,
         t.actual_minutes AS actualMinutes,
         t.priority, t.status, t.energy_level AS energyLevel,
         t.created_at AS createdAt, t.updated_at AS updatedAt,
         (SELECT COUNT(*) FROM task_steps ts WHERE ts.task_id = t.id)
           AS stepsTotal,
         (SELECT COUNT(*) FROM task_steps ts
           WHERE ts.task_id = t.id AND ts.is_completed = 1)
           AS stepsCompleted
       FROM tasks t
       LEFT JOIN projects p ON p.id = t.project_id
       LEFT JOIN goals g ON g.id = t.goal_id
       ${where}
       ORDER BY t.created_at DESC`,
      params,
    );
    return rows.sort(byStatusAndPriority);
  } catch (error) {
    console.error("[task.service:listTasks]", error);
    throw new Error("Could not load your tasks. Please try again.");
  }
}

/**
 * @param {{ title: string, description?: string, projectId?: string|null,
 *   goalId?: string|null, priority: string, status: string,
 *   plannedMinutes: number, energyLevel?: string|null }} input
 * @returns {Promise<string>} id of the created task
 */
export async function createTask({
  title,
  description = "",
  projectId = null,
  goalId = null,
  priority,
  status,
  plannedMinutes,
  energyLevel = null,
}) {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) throw new Error("Task title is required");
  if (!Number.isInteger(plannedMinutes) || plannedMinutes < 1) {
    throw new Error("Planned time must be at least 1 minute");
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  try {
    await execute(
      `INSERT INTO tasks
         (id, project_id, goal_id, title, description, planned_minutes,
          priority, status, energy_level, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        projectId,
        goalId,
        trimmedTitle,
        description.trim(),
        plannedMinutes,
        priority,
        status,
        energyLevel,
        now,
        now,
      ],
    );
  } catch (error) {
    console.error("[task.service:createTask]", error);
    throw new Error("Could not create the task. Please try again.");
  }
  return id;
}

/**
 * @param {{ id: string, title: string, description: string,
 *   projectId: string|null, goalId: string|null, priority: string,
 *   status: string, plannedMinutes: number,
 *   energyLevel: string|null }} input
 * @returns {Promise<void>}
 */
export async function updateTask({
  id,
  title,
  description,
  projectId,
  goalId,
  priority,
  status,
  plannedMinutes,
  energyLevel,
}) {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) throw new Error("Task title is required");
  if (!Number.isInteger(plannedMinutes) || plannedMinutes < 1) {
    throw new Error("Planned time must be at least 1 minute");
  }

  const now = new Date().toISOString();

  try {
    const result = await execute(
      `UPDATE tasks
       SET project_id = ?, goal_id = ?, title = ?, description = ?,
           planned_minutes = ?, priority = ?, status = ?, energy_level = ?,
           updated_at = ?
       WHERE id = ?`,
      [
        projectId,
        goalId,
        trimmedTitle,
        description.trim(),
        plannedMinutes,
        priority,
        status,
        energyLevel,
        now,
        id,
      ],
    );
    if (result.rowsAffected === 0) {
      throw new Error(`Task ${id} not found`);
    }
  } catch (error) {
    console.error("[task.service:updateTask]", error);
    throw new Error("Could not update the task. Please try again.");
  }
}

/**
 * Delete a task. The database cascades to its steps, schedule blocks, and
 * Top 3 entries.
 * @param {{ id: string }} input
 * @returns {Promise<void>}
 */
export async function deleteTask({ id }) {
  try {
    const result = await execute("DELETE FROM tasks WHERE id = ?", [id]);
    if (result.rowsAffected === 0) {
      throw new Error(`Task ${id} not found`);
    }
  } catch (error) {
    console.error("[task.service:deleteTask]", error);
    throw new Error("Could not remove the task. Please try again.");
  }
}

/**
 * The single implementation of task status transitions — every status
 * change in the app goes through here.
 * @param {{ id: string, status: string }} input
 * @returns {Promise<void>}
 */
export async function setTaskStatus({ id, status }) {
  if (!Object.values(TASK_STATUS).includes(status)) {
    throw new Error("Invalid task status");
  }

  const now = new Date().toISOString();

  try {
    const result = await execute(
      "UPDATE tasks SET status = ?, updated_at = ? WHERE id = ?",
      [status, now, id],
    );
    if (result.rowsAffected === 0) {
      throw new Error(`Task ${id} not found`);
    }
  } catch (error) {
    console.error("[task.service:setTaskStatus]", error);
    throw new Error("Could not update the task status. Please try again.");
  }
}

/**
 * @param {string} taskId
 * @returns {Promise<Record<string, unknown>[]>}
 */
export async function listTaskSteps(taskId) {
  try {
    return await query(
      `SELECT id, title, is_completed AS isCompleted, sort_order AS sortOrder
       FROM task_steps
       WHERE task_id = ?
       ORDER BY sort_order, created_at`,
      [taskId],
    );
  } catch (error) {
    console.error("[task.service:listTaskSteps]", error);
    throw new Error("Could not load the task steps. Please try again.");
  }
}

/**
 * Append a step to the end of a task's step list.
 * @param {{ taskId: string, title: string }} input
 * @returns {Promise<string>} id of the created step
 */
export async function createTaskStep({ taskId, title }) {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) throw new Error("Step title is required");

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  try {
    await execute(
      `INSERT INTO task_steps
         (id, task_id, title, is_completed, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, 0,
         (SELECT COALESCE(MAX(sort_order), -1) + 1
          FROM task_steps WHERE task_id = ?),
         ?, ?)`,
      [id, taskId, trimmedTitle, taskId, now, now],
    );
  } catch (error) {
    console.error("[task.service:createTaskStep]", error);
    throw new Error("Could not add the step. Please try again.");
  }
  return id;
}

/**
 * Set a step's explicit target state so retries can never double-toggle.
 * @param {{ id: string, isCompleted: boolean }} input
 * @returns {Promise<void>}
 */
export async function setTaskStepCompleted({ id, isCompleted }) {
  const now = new Date().toISOString();

  try {
    const result = await execute(
      "UPDATE task_steps SET is_completed = ?, updated_at = ? WHERE id = ?",
      [isCompleted ? 1 : 0, now, id],
    );
    if (result.rowsAffected === 0) {
      throw new Error(`Task step ${id} not found`);
    }
  } catch (error) {
    console.error("[task.service:setTaskStepCompleted]", error);
    throw new Error("Could not update the step. Please try again.");
  }
}

/**
 * @param {{ id: string }} input
 * @returns {Promise<void>}
 */
export async function deleteTaskStep({ id }) {
  try {
    const result = await execute("DELETE FROM task_steps WHERE id = ?", [id]);
    if (result.rowsAffected === 0) {
      throw new Error(`Task step ${id} not found`);
    }
  } catch (error) {
    console.error("[task.service:deleteTaskStep]", error);
    throw new Error("Could not remove the step. Please try again.");
  }
}
