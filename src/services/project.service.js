import { execute, query, queryOne } from "@/lib/database";
import { PROJECT_STATUS, TASK_STATUS } from "@/lib/constants";

/**
 * Read and write operations for projects. A project groups tasks that push
 * a goal forward. Deleting a project never deletes its tasks — the database
 * clears tasks.project_id and the work records survive unlinked.
 */

// Working projects surface first; archive sinks to the bottom.
const STATUS_ORDER = [
  PROJECT_STATUS.ACTIVE,
  PROJECT_STATUS.PAUSED,
  PROJECT_STATUS.COMPLETED,
  PROJECT_STATUS.ARCHIVED,
];

function byStatusRank(a, b) {
  return STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
}

/**
 * List all projects with their linked goal title and task counts so the
 * list renders progress without extra queries.
 * @returns {Promise<Record<string, unknown>[]>}
 */
export async function listProjects() {
  try {
    const rows = await query(
      `SELECT
         p.id, p.name, p.description, p.status,
         p.goal_id AS goalId, g.title AS goalTitle,
         p.created_at AS createdAt, p.updated_at AS updatedAt,
         (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id)
           AS tasksTotal,
         (SELECT COUNT(*) FROM tasks t
           WHERE t.project_id = p.id AND t.status = ?)
           AS tasksCompleted
       FROM projects p
       LEFT JOIN goals g ON g.id = p.goal_id
       ORDER BY p.created_at DESC`,
      [TASK_STATUS.COMPLETED],
    );
    return rows.sort(byStatusRank);
  } catch (error) {
    console.error("[project.service:listProjects]", error);
    throw new Error("Could not load your projects. Please try again.");
  }
}

/**
 * Fetch a single project.
 * @param {string} id
 * @returns {Promise<Record<string, unknown>|null>} null when not found
 */
export async function getProject(id) {
  try {
    const project = await queryOne(
      `SELECT
         p.id, p.name, p.description, p.status,
         p.goal_id AS goalId, g.title AS goalTitle,
         p.created_at AS createdAt, p.updated_at AS updatedAt
       FROM projects p
       LEFT JOIN goals g ON g.id = p.goal_id
       WHERE p.id = ?`,
      [id],
    );
    return project ?? null;
  } catch (error) {
    console.error("[project.service:getProject]", error);
    throw new Error("Could not load this project. Please try again.");
  }
}

/**
 * List the tasks linked to a project, scheduled ones first (soonest at the
 * top), unscheduled last.
 * @param {string} projectId
 * @returns {Promise<Record<string, unknown>[]>}
 */
export async function listProjectTasks(projectId) {
  try {
    return await query(
      `SELECT
         id, title, description,
         scheduled_date AS scheduledDate, start_time AS startTime,
         end_time AS endTime, planned_minutes AS plannedMinutes,
         actual_minutes AS actualMinutes, priority, status,
         created_at AS createdAt, updated_at AS updatedAt
       FROM tasks
       WHERE project_id = ?
       ORDER BY scheduled_date IS NULL, scheduled_date, created_at DESC`,
      [projectId],
    );
  } catch (error) {
    console.error("[project.service:listProjectTasks]", error);
    throw new Error("Could not load this project's tasks. Please try again.");
  }
}

/**
 * @param {{ name: string, description: string,
 *   goalId: string|null, status: string }} input
 * @returns {Promise<string>} id of the created project
 */
export async function createProject({ name, description, goalId, status }) {
  const trimmedName = name.trim();
  if (!trimmedName) throw new Error("Project name is required");

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  try {
    await execute(
      `INSERT INTO projects
         (id, goal_id, name, description, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, goalId, trimmedName, description.trim(), status, now, now],
    );
  } catch (error) {
    console.error("[project.service:createProject]", error);
    throw new Error("Could not create the project. Please try again.");
  }
  return id;
}

/**
 * @param {{ id: string, name: string, description: string,
 *   goalId: string|null, status: string }} input
 * @returns {Promise<void>}
 */
export async function updateProject({ id, name, description, goalId, status }) {
  const trimmedName = name.trim();
  if (!trimmedName) throw new Error("Project name is required");

  const now = new Date().toISOString();

  try {
    const result = await execute(
      `UPDATE projects
       SET goal_id = ?, name = ?, description = ?, status = ?, updated_at = ?
       WHERE id = ?`,
      [goalId, trimmedName, description.trim(), status, now, id],
    );
    if (result.rowsAffected === 0) {
      throw new Error(`Project ${id} not found`);
    }
  } catch (error) {
    console.error("[project.service:updateProject]", error);
    throw new Error("Could not update the project. Please try again.");
  }
}

/**
 * Delete a project. Its tasks keep their records and only lose the link
 * (tasks.project_id is cleared by the database).
 * @param {{ id: string }} input
 * @returns {Promise<void>}
 */
export async function deleteProject({ id }) {
  try {
    const result = await execute("DELETE FROM projects WHERE id = ?", [id]);
    if (result.rowsAffected === 0) {
      throw new Error(`Project ${id} not found`);
    }
  } catch (error) {
    console.error("[project.service:deleteProject]", error);
    throw new Error("Could not remove the project. Please try again.");
  }
}
