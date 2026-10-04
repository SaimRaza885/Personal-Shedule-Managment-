import { subDays, startOfDay, endOfDay, format } from "date-fns";
import { query } from "@/lib/database";
import { DATE_FORMATS, FOCUS_STATUS } from "@/lib/constants";

/**
 * Read-only aggregates over the last N days for the Analytics screen.
 * Rows are bucketed into local calendar days in JS (the same approach the
 * project and goal rollups use), so day boundaries match what the user saw
 * on those screens — SQL date() would bucket in UTC instead.
 */

export const RANGE_OPTIONS = Object.freeze([7, 30]);

/**
 * @param {number} days
 * @returns {Promise<{
 *   points: Array<{ date: string, label: string, focusMinutes: number,
 *     tasksCompleted: number, distractions: number }>,
 *   totals: { focusMinutes: number, tasksCompleted: number,
 *     sessions: number, distractions: number },
 *   averageFocusMinutes: number
 * }>}
 */
export async function getAnalytics(days) {
  const dayCount = RANGE_OPTIONS.includes(days) ? days : 7;
  const today = new Date();
  const rangeStart = startOfDay(subDays(today, dayCount - 1));
  const rangeEnd = endOfDay(today);
  const startIso = rangeStart.toISOString();
  const endIso = rangeEnd.toISOString();

  const localDay = (isoTimestamp) =>
    format(new Date(isoTimestamp), DATE_FORMATS.ISO);

  try {
    const [sessions, completedTasks, distractions] = await Promise.all([
      query(
        `SELECT started_at AS startedAt, actual_minutes AS actualMinutes
         FROM focus_sessions
         WHERE status IN (?, ?) AND started_at >= ? AND started_at <= ?`,
        [FOCUS_STATUS.COMPLETED, FOCUS_STATUS.CANCELLED, startIso, endIso],
      ),
      query(
        `SELECT completed_at AS completedAt
         FROM tasks
         WHERE completed_at IS NOT NULL AND completed_at >= ? AND completed_at <= ?`,
        [startIso, endIso],
      ),
      query(
        `SELECT occurred_at AS occurredAt
         FROM distractions
         WHERE occurred_at >= ? AND occurred_at <= ?`,
        [startIso, endIso],
      ),
    ]);

    const byDay = new Map();
    for (let offset = 0; offset < dayCount; offset += 1) {
      const day = format(subDays(today, dayCount - 1 - offset), DATE_FORMATS.ISO);
      byDay.set(day, {
        date: day,
        label: format(subDays(today, dayCount - 1 - offset), DATE_FORMATS.SHORT),
        focusMinutes: 0,
        tasksCompleted: 0,
        distractions: 0,
      });
    }

    let totalFocusMinutes = 0;
    let totalDistractions = 0;

    for (const session of sessions) {
      const point = byDay.get(localDay(session.startedAt));
      if (!point) continue;
      point.focusMinutes += session.actualMinutes ?? 0;
      totalFocusMinutes += session.actualMinutes ?? 0;
    }
    for (const task of completedTasks) {
      const point = byDay.get(localDay(task.completedAt));
      if (point) point.tasksCompleted += 1;
    }
    for (const distraction of distractions) {
      const point = byDay.get(localDay(distraction.occurredAt));
      if (!point) continue;
      point.distractions += 1;
      totalDistractions += 1;
    }

    const points = [...byDay.values()];

    return {
      points,
      totals: {
        focusMinutes: totalFocusMinutes,
        tasksCompleted: completedTasks.length,
        sessions: sessions.length,
        distractions: totalDistractions,
      },
      averageFocusMinutes: Math.round(totalFocusMinutes / dayCount),
    };
  } catch (error) {
    console.error("[analytics.service:getAnalytics]", error);
    throw new Error("Could not load your analytics. Please try again.");
  }
}
