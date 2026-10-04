import { query } from "@/lib/database";
import { DEFAULT_VALUES, ENERGY_LEVEL, TASK_STATUS } from "@/lib/constants";

/**
 * A scheduled block joined with its task, as consumed by the Today screen.
 * @typedef {{ id: string, taskId: string, title: string, startTime: string, endTime: string, plannedMinutes: number, status: string, priority: string, energyLevel: string|null, stepsTotal: number, stepsRemaining: number }} ScheduleItem
 */

/** @param {string} date @returns {Promise<ScheduleItem[]>} */
export async function getTodaySchedule(date) {
  return query(
    `SELECT
       ds.id AS id,
       ds.task_id AS taskId,
       t.title AS title,
       ds.start_time AS startTime,
       ds.end_time AS endTime,
       ds.planned_minutes AS plannedMinutes,
       t.status AS status,
       t.priority AS priority,
       t.energy_level AS energyLevel,
       (SELECT COUNT(*) FROM task_steps ts WHERE ts.task_id = ds.task_id) AS stepsTotal,
       (SELECT COUNT(*) FROM task_steps ts WHERE ts.task_id = ds.task_id AND ts.is_completed = 0) AS stepsRemaining
     FROM daily_schedules ds
     JOIN tasks t ON t.id = ds.task_id
     WHERE ds.date = ?
     ORDER BY ds.start_time`,
    [date],
  );
}

/** @param {string} date @returns {Promise<Array<{ id: string, taskId: string, position: number, title: string, status: string }>>} */
export async function getTopThree(date) {
  return query(
    `SELECT
       dt.id AS id,
       dt.task_id AS taskId,
       dt.position AS position,
       t.title AS title,
       t.status AS status
     FROM daily_top_three dt
     JOIN tasks t ON t.id = dt.task_id
     WHERE dt.date = ?
     ORDER BY dt.position`,
    [date],
  );
}

/**
 * Times are stored as "HH:mm" strings, so lexicographic comparison matches
 * chronological order. "Now" is the scheduled block containing timeNow;
 * when none matches, the next upcoming block is the suggestion.
 */
export function determineNowState(schedule, timeNow) {
  const actionable = schedule.filter(
    (item) => item.status !== TASK_STATUS.COMPLETED && item.status !== TASK_STATUS.CANCELLED,
  );
  const current =
    actionable.find(
      (item) => item.startTime <= timeNow && timeNow < item.endTime,
    ) ?? null;
  const upcoming = current
    ? null
    : (actionable.find((item) => item.startTime > timeNow) ?? null);
  return { current, upcoming };
}

export function summarizeProgress(schedule) {
  const total = schedule.length;
  const completedItems = schedule.filter(
    (item) => item.status === TASK_STATUS.COMPLETED,
  );
  return {
    completed: completedItems.length,
    total,
    minutesPlanned: schedule.reduce((sum, item) => sum + (item.plannedMinutes ?? 0), 0),
    minutesDone: completedItems.reduce((sum, item) => sum + (item.plannedMinutes ?? 0), 0),
  };
}

const UNKNOWN_ENERGY_RANK = 2;
const ENERGY_RANK = {
  [ENERGY_LEVEL.LOW]: 0,
  [ENERGY_LEVEL.MEDIUM]: 1,
  [ENERGY_LEVEL.HIGH]: 3,
};

/**
 * Ranks already-planned tasks by how light they are for a low-energy moment:
 * lower energy level first, then shorter planned duration, then earlier start.
 * Purely a suggestion list — it never modifies the schedule.
 * @param {ScheduleItem[]} schedule
 * @param {string} timeNow
 * @param {{ excludeTaskId?: string|null, limit?: number }} [options]
 * @returns {ScheduleItem[]}
 */
export function findLighterOptions(schedule, timeNow, options = {}) {
  const {
    excludeTaskId = null,
    limit = DEFAULT_VALUES.LIGHTER_OPTIONS_MAX,
  } = options;

  return schedule
    .filter(
      (item) =>
        item.status !== TASK_STATUS.COMPLETED &&
        item.status !== TASK_STATUS.CANCELLED &&
        item.endTime > timeNow &&
        item.taskId !== excludeTaskId,
    )
    .sort((a, b) => {
      const rankA = ENERGY_RANK[a.energyLevel] ?? UNKNOWN_ENERGY_RANK;
      const rankB = ENERGY_RANK[b.energyLevel] ?? UNKNOWN_ENERGY_RANK;
      if (rankA !== rankB) return rankA - rankB;
      if (a.plannedMinutes !== b.plannedMinutes) {
        return a.plannedMinutes - b.plannedMinutes;
      }
      return a.startTime.localeCompare(b.startTime);
    })
    .slice(0, limit);
}
