import { query } from "@/lib/database";
import { TASK_STATUS } from "@/lib/constants";

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
       (SELECT COUNT(*) FROM task_steps ts WHERE ts.task_id = ds.task_id) AS stepsTotal,
       (SELECT COUNT(*) FROM task_steps ts WHERE ts.task_id = ds.task_id AND ts.is_completed = 0) AS stepsRemaining
     FROM daily_schedules ds
     JOIN tasks t ON t.id = ds.task_id
     WHERE ds.date = ?
     ORDER BY ds.start_time`,
    [date],
  );
}

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
