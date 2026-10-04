import { execute, query, queryOne } from "@/lib/database";
import { MILESTONE_STATUS } from "@/lib/constants";

/**
 * Read and write operations for goals and their milestones. A goal owns
 * its milestones: deleting a goal cascades to them in the database, while
 * projects and tasks only lose the goal reference and are kept.
 */

/**
 * List all goals ordered by year (newest first, no-year goals last) so the
 * current year's goals surface at the top. Each row carries milestone
 * counts so the list can render progress without extra queries.
 * @returns {Promise<Record<string, unknown>[]>}
 */
export async function listGoals() {
  try {
    return await query(
      `SELECT
         g.id, g.title, g.description, g.year, g.status,
         g.created_at AS createdAt, g.updated_at AS updatedAt,
         (SELECT COUNT(*) FROM milestones m WHERE m.goal_id = g.id)
           AS milestonesTotal,
         (SELECT COUNT(*) FROM milestones m
           WHERE m.goal_id = g.id AND m.status = ?)
           AS milestonesCompleted
       FROM goals g
       ORDER BY g.year IS NULL, g.year DESC, g.created_at DESC`,
      [MILESTONE_STATUS.COMPLETED],
    );
  } catch (error) {
    console.error("[goal.service:listGoals]", error);
    throw new Error("Could not load your goals. Please try again.");
  }
}

/**
 * Fetch a single goal.
 * @param {string} id
 * @returns {Promise<Record<string, unknown>|null>} null when not found
 */
export async function getGoal(id) {
  try {
    const goal = await queryOne(
      `SELECT id, title, description, year, status,
              created_at AS createdAt, updated_at AS updatedAt
       FROM goals WHERE id = ?`,
      [id],
    );
    return goal ?? null;
  } catch (error) {
    console.error("[goal.service:getGoal]", error);
    throw new Error("Could not load this goal. Please try again.");
  }
}

/**
 * List milestones of a goal ordered by target date (dated first, soonest
 * at the top; undated last).
 * @param {string} goalId
 * @returns {Promise<Record<string, unknown>[]>}
 */
export async function listMilestones(goalId) {
  try {
    return await query(
      `SELECT id, title, description,
              period_type AS periodType, target_date AS targetDate, status,
              created_at AS createdAt, updated_at AS updatedAt
       FROM milestones
       WHERE goal_id = ?
       ORDER BY target_date IS NULL, target_date, created_at`,
      [goalId],
    );
  } catch (error) {
    console.error("[goal.service:listMilestones]", error);
    throw new Error("Could not load milestones. Please try again.");
  }
}

/**
 * @param {{ title: string, description: string, year: number|null, status: string }} input
 * @returns {Promise<string>} id of the created goal
 */
export async function createGoal({ title, description, year, status }) {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) throw new Error("Goal title is required");

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  try {
    await execute(
      `INSERT INTO goals (id, title, description, year, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, trimmedTitle, description.trim(), year, status, now, now],
    );
  } catch (error) {
    console.error("[goal.service:createGoal]", error);
    throw new Error("Could not create the goal. Please try again.");
  }
  return id;
}

/**
 * @param {{ id: string, title: string, description: string, year: number|null, status: string }} input
 * @returns {Promise<void>}
 */
export async function updateGoal({ id, title, description, year, status }) {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) throw new Error("Goal title is required");

  const now = new Date().toISOString();

  try {
    const result = await execute(
      `UPDATE goals
       SET title = ?, description = ?, year = ?, status = ?, updated_at = ?
       WHERE id = ?`,
      [trimmedTitle, description.trim(), year, status, now, id],
    );
    if (result.rowsAffected === 0) {
      throw new Error(`Goal ${id} not found`);
    }
  } catch (error) {
    console.error("[goal.service:updateGoal]", error);
    throw new Error("Could not update the goal. Please try again.");
  }
}

/**
 * Delete a goal. Milestones cascade with it; projects and tasks that
 * referenced it keep their own records and just lose the link.
 * @param {{ id: string }} input
 * @returns {Promise<void>}
 */
export async function deleteGoal({ id }) {
  try {
    const result = await execute("DELETE FROM goals WHERE id = ?", [id]);
    if (result.rowsAffected === 0) {
      throw new Error(`Goal ${id} not found`);
    }
  } catch (error) {
    console.error("[goal.service:deleteGoal]", error);
    throw new Error("Could not remove the goal. Please try again.");
  }
}

/**
 * @param {{ goalId: string, title: string, description: string,
 *   periodType: string, targetDate: string|null, status: string }} input
 * @returns {Promise<string>} id of the created milestone
 */
export async function createMilestone({
  goalId,
  title,
  description,
  periodType,
  targetDate,
  status,
}) {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) throw new Error("Milestone title is required");

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  try {
    await execute(
      `INSERT INTO milestones
         (id, goal_id, title, description, period_type, target_date, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        goalId,
        trimmedTitle,
        description.trim(),
        periodType,
        targetDate,
        status,
        now,
        now,
      ],
    );
  } catch (error) {
    console.error("[goal.service:createMilestone]", error);
    throw new Error("Could not add the milestone. Please try again.");
  }
  return id;
}

/**
 * @param {{ id: string, title: string, description: string,
 *   periodType: string, targetDate: string|null, status: string }} input
 * @returns {Promise<void>}
 */
export async function updateMilestone({
  id,
  title,
  description,
  periodType,
  targetDate,
  status,
}) {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) throw new Error("Milestone title is required");

  const now = new Date().toISOString();

  try {
    const result = await execute(
      `UPDATE milestones
       SET title = ?, description = ?, period_type = ?, target_date = ?,
           status = ?, updated_at = ?
       WHERE id = ?`,
      [
        trimmedTitle,
        description.trim(),
        periodType,
        targetDate,
        status,
        now,
        id,
      ],
    );
    if (result.rowsAffected === 0) {
      throw new Error(`Milestone ${id} not found`);
    }
  } catch (error) {
    console.error("[goal.service:updateMilestone]", error);
    throw new Error("Could not update the milestone. Please try again.");
  }
}

/**
 * @param {{ id: string }} input
 * @returns {Promise<void>}
 */
export async function deleteMilestone({ id }) {
  try {
    const result = await execute("DELETE FROM milestones WHERE id = ?", [id]);
    if (result.rowsAffected === 0) {
      throw new Error(`Milestone ${id} not found`);
    }
  } catch (error) {
    console.error("[goal.service:deleteMilestone]", error);
    throw new Error("Could not remove the milestone. Please try again.");
  }
}
