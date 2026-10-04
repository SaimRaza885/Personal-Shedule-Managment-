import { execute } from "@/lib/database";
import { ENERGY_LEVEL, TASK_PRIORITY, TASK_STATUS } from "@/lib/constants";

/**
 * Write operations for daily schedule blocks. Reads live in
 * today.service.js; this module owns add/edit/remove of blocks.
 * A block is a daily_schedules row pointing at a task. Removing a block
 * never deletes the task itself.
 */

function minutesBetween(startTime, endTime) {
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  return endH * 60 + endM - (startH * 60 + startM);
}

function assertValidTimes(startTime, endTime) {
  if (endTime <= startTime) {
    throw new Error("End time must be after start time");
  }
}

function assertValidPriority(priority) {
  if (!Object.values(TASK_PRIORITY).includes(priority)) {
    throw new Error("Priority must be low, medium, or high");
  }
}

function assertValidEnergy(energyLevel) {
  if (energyLevel !== null && !Object.values(ENERGY_LEVEL).includes(energyLevel)) {
    throw new Error("Energy level must be high, medium, or low");
  }
}

/**
 * Create a task and place it in a fixed time block on the given date.
 * Task and schedule row are written together so a block can never point
 * at a missing task. planned_minutes always matches the block duration.
 * @param {{ date: string, title: string, startTime: string, endTime: string,
 *   priority?: string, energyLevel?: string | null }} input
 * @returns {Promise<string>} id of the created daily_schedules row
 */
export async function addScheduleBlock({
  date,
  title,
  startTime,
  endTime,
  priority = TASK_PRIORITY.MEDIUM,
  energyLevel = null,
}) {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) throw new Error("Task title is required");
  assertValidTimes(startTime, endTime);
  assertValidPriority(priority);
  assertValidEnergy(energyLevel);

  const taskId = crypto.randomUUID();
  const scheduleId = crypto.randomUUID();
  const plannedMinutes = minutesBetween(startTime, endTime);
  const now = new Date().toISOString();

  try {
    await execute("BEGIN");
    await execute(
      `INSERT INTO tasks (id, title, priority, energy_level, status, planned_minutes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        taskId,
        trimmedTitle,
        priority,
        energyLevel,
        TASK_STATUS.NOT_STARTED,
        plannedMinutes,
        now,
        now,
      ],
    );
    await execute(
      `INSERT INTO daily_schedules
         (id, task_id, date, start_time, end_time, planned_minutes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [scheduleId, taskId, date, startTime, endTime, plannedMinutes, now, now],
    );
    await execute("COMMIT");
  } catch (error) {
    await execute("ROLLBACK").catch(() => {});
    console.error("[schedule.service:addScheduleBlock]", error);
    throw new Error("Could not add the task to your schedule. Please try again.");
  }
  return scheduleId;
}

/**
 * Move a block to a new time range. The linked task's planned_minutes is
 * kept in sync with the block duration.
 * @param {{ id: string, startTime: string, endTime: string }} input
 * @returns {Promise<void>}
 */
export async function updateScheduleBlock({ id, startTime, endTime }) {
  assertValidTimes(startTime, endTime);
  const plannedMinutes = minutesBetween(startTime, endTime);
  const now = new Date().toISOString();

  try {
    await execute("BEGIN");
    const result = await execute(
      `UPDATE daily_schedules
       SET start_time = ?, end_time = ?, planned_minutes = ?, updated_at = ?
       WHERE id = ?`,
      [startTime, endTime, plannedMinutes, now, id],
    );
    if (result.rowsAffected === 0) {
      throw new Error(`Schedule block ${id} not found`);
    }
    await execute(
      `UPDATE tasks
       SET planned_minutes = ?, updated_at = ?
       WHERE id = (SELECT task_id FROM daily_schedules WHERE id = ?)`,
      [plannedMinutes, now, id],
    );
    await execute("COMMIT");
  } catch (error) {
    await execute("ROLLBACK").catch(() => {});
    console.error("[schedule.service:updateScheduleBlock]", error);
    throw new Error("Could not update the schedule. Please try again.");
  }
}

/**
 * Remove a block from the schedule. The task itself is kept — task
 * management is a separate concern and the schedule is not the task's owner.
 * @param {{ id: string }} input
 * @returns {Promise<void>}
 */
export async function removeScheduleBlock({ id }) {
  try {
    const result = await execute("DELETE FROM daily_schedules WHERE id = ?", [id]);
    if (result.rowsAffected === 0) {
      throw new Error(`Schedule block ${id} not found`);
    }
  } catch (error) {
    console.error("[schedule.service:removeScheduleBlock]", error);
    throw new Error("Could not remove the task from your schedule. Please try again.");
  }
}
