import { format } from "date-fns";
import { execute, query, queryOne } from "@/lib/database";
import { DATE_FORMATS, TASK_STATUS } from "@/lib/constants";
import { getTodaySchedule } from "@/services/today.service";

/**
 * Read + write operations for the end-of-day review. The numbers are a
 * snapshot derived from the day's schedule and focus sessions; the notes
 * are the user's own words. One review per day — saving again updates
 * the same row instead of adding duplicates.
 */

/**
 * @typedef {Object} DailyReview
 * @property {string} id
 * @property {string} date
 * @property {number} plannedTasks
 * @property {number} completedTasks
 * @property {number} partialTasks
 * @property {number} missedTasks
 * @property {number} focusMinutes
 * @property {string} reviewNotes
 * @property {string} createdAt
 * @property {string} updatedAt
 */

function toDailyReview(row) {
  return {
    id: row.id,
    date: row.date,
    plannedTasks: row.planned_tasks,
    completedTasks: row.completed_tasks,
    partialTasks: row.partial_tasks,
    missedTasks: row.missed_tasks,
    focusMinutes: row.focus_minutes,
    reviewNotes: row.review_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * The stored review for a date, or null when none exists yet.
 * @param {string} date
 * @returns {Promise<DailyReview|null>}
 */
export async function getDailyReview(date) {
  try {
    const row = await queryOne("SELECT * FROM daily_reviews WHERE date = ?", [
      date,
    ]);
    return row ? toDailyReview(row) : null;
  } catch (error) {
    console.error("[review.service:getDailyReview]", error);
    throw new Error("Could not load your review. Please try again.");
  }
}

/**
 * @typedef {Object} WeeklyReview
 * @property {string} id
 * @property {string} weekStart   yyyy-MM-dd (Monday)
 * @property {string} weekEnd     yyyy-MM-dd (Sunday)
 * @property {string} whatWentWell
 * @property {string} whatDidNotGoWell
 * @property {string} accomplishments
 * @property {string} changesForNextWeek
 * @property {string} priorities
 * @property {string} createdAt
 * @property {string} updatedAt
 */

function toWeeklyReview(row) {
  return {
    id: row.id,
    weekStart: row.week_start,
    weekEnd: row.week_end,
    whatWentWell: row.what_went_well,
    whatDidNotGoWell: row.what_did_not_go_well,
    accomplishments: row.accomplishments,
    changesForNextWeek: row.changes_for_next_week,
    priorities: row.priorities,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * The stored review for a week (keyed by its Monday), or null when none
 * exists yet.
 * @param {string} weekStart  yyyy-MM-dd
 * @returns {Promise<WeeklyReview|null>}
 */
export async function getWeeklyReview(weekStart) {
  try {
    const row = await queryOne(
      "SELECT * FROM weekly_reviews WHERE week_start = ?",
      [weekStart],
    );
    return row ? toWeeklyReview(row) : null;
  } catch (error) {
    console.error("[review.service:getWeeklyReview]", error);
    throw new Error("Could not load your weekly review. Please try again.");
  }
}

/**
 * Save (or update) the review for a week. One review per week — saving
 * again updates the same row instead of adding duplicates.
 * @param {{ weekStart: string, weekEnd: string, whatWentWell?: string,
 *   whatDidNotGoWell?: string, accomplishments?: string,
 *   changesForNextWeek?: string, priorities?: string }} input
 * @returns {Promise<string>} id of the saved review
 */
export async function saveWeeklyReview({
  weekStart,
  weekEnd,
  whatWentWell = "",
  whatDidNotGoWell = "",
  accomplishments = "",
  changesForNextWeek = "",
  priorities = "",
}) {
  if (!weekStart) throw new Error("Missing week start date");
  if (!weekEnd) throw new Error("Missing week end date");

  const now = new Date().toISOString();
  const texts = [
    whatWentWell.trim(),
    whatDidNotGoWell.trim(),
    accomplishments.trim(),
    changesForNextWeek.trim(),
    priorities.trim(),
  ];

  try {
    const existing = await queryOne(
      "SELECT id FROM weekly_reviews WHERE week_start = ?",
      [weekStart],
    );
    if (existing) {
      await execute(
        `UPDATE weekly_reviews
         SET week_end = ?, what_went_well = ?, what_did_not_go_well = ?, accomplishments = ?, changes_for_next_week = ?, priorities = ?, updated_at = ?
         WHERE id = ?`,
        [weekEnd, ...texts, now, existing.id],
      );
      return existing.id;
    }

    const id = crypto.randomUUID();
    await execute(
      `INSERT INTO weekly_reviews (id, week_start, week_end, what_went_well, what_did_not_go_well, accomplishments, changes_for_next_week, priorities, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, weekStart, weekEnd, ...texts, now, now],
    );
    return id;
  } catch (error) {
    console.error("[review.service:saveWeeklyReview]", error);
    throw new Error("Could not save your weekly review. Please try again.");
  }
}

/**
 * Derive today's numbers from the plan and the focus log. "Partial" means
 * started but not finished; cancelled blocks were deliberately called off,
 * so they count as neither partial nor missed.
 * @param {import("@/services/today.service").ScheduleItem[]} schedule
 * @param {Array<{ startedAt: string, actualMinutes: number }>} sessions
 * @param {string} date
 * @returns {{ plannedTasks: number, completedTasks: number, partialTasks: number, missedTasks: number, focusMinutes: number }}
 */
export function summarizeDailyStats(schedule, sessions, date) {
  const countBy = (predicate) => schedule.filter(predicate).length;
  const completedTasks = countBy(
    (item) => item.status === TASK_STATUS.COMPLETED,
  );
  const partialTasks = countBy(
    (item) =>
      item.status === TASK_STATUS.IN_PROGRESS ||
      item.status === TASK_STATUS.PAUSED,
  );
  const missedTasks = countBy(
    (item) => item.status === TASK_STATUS.NOT_STARTED,
  );

  let focusMinutes = 0;
  for (const session of sessions) {
    // started_at is a UTC timestamp; compare against the local calendar
    // day so an evening session still counts for today.
    const localDate = format(new Date(session.startedAt), DATE_FORMATS.ISO);
    if (localDate === date) {
      focusMinutes += session.actualMinutes ?? 0;
    }
  }

  return {
    plannedTasks: schedule.length,
    completedTasks,
    partialTasks,
    missedTasks,
    focusMinutes,
  };
}

/**
 * Live stats for the review screen — always derived from current data,
 * never from the stored snapshot.
 * @param {string} date
 * @returns {Promise<{ plannedTasks: number, completedTasks: number, partialTasks: number, missedTasks: number, focusMinutes: number }>}
 */
export async function getDailyReviewStats(date) {
  try {
    const [schedule, sessions] = await Promise.all([
      getTodaySchedule(date),
      query(
        "SELECT started_at AS startedAt, actual_minutes AS actualMinutes FROM focus_sessions",
      ),
    ]);
    return summarizeDailyStats(schedule, sessions, date);
  } catch (error) {
    console.error("[review.service:getDailyReviewStats]", error);
    throw new Error("Could not load today's numbers. Please try again.");
  }
}

/**
 * Save (or update) the review for a date. The stats passed in are stored
 * as a snapshot; the live screen keeps recomputing from current data.
 * @param {{ date: string, plannedTasks?: number, completedTasks?: number,
 *   partialTasks?: number, missedTasks?: number, focusMinutes?: number,
 *   reviewNotes?: string }} input
 * @returns {Promise<string>} id of the saved review
 */
export async function saveDailyReview({
  date,
  plannedTasks = 0,
  completedTasks = 0,
  partialTasks = 0,
  missedTasks = 0,
  focusMinutes = 0,
  reviewNotes = "",
}) {
  if (!date) throw new Error("Missing review date");

  const notes = reviewNotes.trim();
  const now = new Date().toISOString();

  try {
    const existing = await queryOne(
      "SELECT id FROM daily_reviews WHERE date = ?",
      [date],
    );
    if (existing) {
      await execute(
        `UPDATE daily_reviews
         SET planned_tasks = ?, completed_tasks = ?, partial_tasks = ?, missed_tasks = ?, focus_minutes = ?, review_notes = ?, updated_at = ?
         WHERE id = ?`,
        [
          plannedTasks,
          completedTasks,
          partialTasks,
          missedTasks,
          focusMinutes,
          notes,
          now,
          existing.id,
        ],
      );
      return existing.id;
    }

    const id = crypto.randomUUID();
    await execute(
      `INSERT INTO daily_reviews (id, date, planned_tasks, completed_tasks, partial_tasks, missed_tasks, focus_minutes, review_notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        date,
        plannedTasks,
        completedTasks,
        partialTasks,
        missedTasks,
        focusMinutes,
        notes,
        now,
        now,
      ],
    );
    return id;
  } catch (error) {
    console.error("[review.service:saveDailyReview]", error);
    throw new Error("Could not save your review. Please try again.");
  }
}
