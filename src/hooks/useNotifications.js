import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { DATE_FORMATS, TASK_STATUS } from "@/lib/constants";
import { useDailyReview } from "@/hooks/useReviews";
import { useNotificationSettings } from "@/hooks/useSettings";
import { getTodaySchedule } from "@/services/today.service";
import { sendDesktopNotification } from "@/lib/notifications";

const TICK_MS = 30_000;
const START_GRACE_MINUTES = 5;
const REVIEW_WINDOW_MINUTES = 60;

/** @param {string} time "HH:mm" @returns {number} minutes since midnight */
function toMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * True while an actionable block is due for a reminder: from "lead minutes
 * before start" until shortly after the start. Blocks that already ended
 * never fire — a stale window must not produce a "starting soon" toast.
 * @param {{ startTime: string, endTime: string, status: string }} item
 * @param {number} nowMinutes
 * @param {number} leadMinutes
 * @returns {boolean}
 */
export function isBlockInReminderWindow(item, nowMinutes, leadMinutes) {
  if (
    item.status === TASK_STATUS.COMPLETED ||
    item.status === TASK_STATUS.CANCELLED
  ) {
    return false;
  }
  const start = toMinutes(item.startTime);
  if (toMinutes(item.endTime) <= nowMinutes) return false;
  return (
    nowMinutes >= start - leadMinutes &&
    nowMinutes <= start + START_GRACE_MINUTES
  );
}

/**
 * True when the evening review reminder is due: from the configured time
 * until an hour later.
 * @param {number} nowMinutes
 * @param {string} reviewTime "HH:mm"
 * @returns {boolean}
 */
export function isReviewDue(nowMinutes, reviewTime) {
  const at = toMinutes(reviewTime);
  return nowMinutes >= at && nowMinutes <= at + REVIEW_WINDOW_MINUTES;
}

/**
 * Watches today's schedule while the app is open and raises the two
 * reminders the app promises: "starting soon" for each scheduled block and
 * a once-a-day evening review nudge. Every reminder fires at most once per
 * session; moving or completing a block simply changes what fires next.
 * Mounted once, in the app shell — safe to leave running on every screen.
 */
export function useNotificationWatcher() {
  const [date, setDate] = useState(() => format(new Date(), DATE_FORMATS.ISO));
  const settingsQuery = useNotificationSettings();
  const scheduleQuery = useQuery({
    queryKey: ["today", "schedule", date],
    queryFn: () => getTodaySchedule(date),
  });
  const reviewQuery = useDailyReview(date);
  const firedRef = useRef(new Set());

  const settings = settingsQuery.data;
  const schedule = scheduleQuery.data ?? [];
  const reviewSaved = reviewQuery.data != null;

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const today = format(now, DATE_FORMATS.ISO);
      if (today !== date) {
        setDate(today);
        return;
      }
      if (!settings?.enabled) return;

      const nowMinutes = now.getHours() * 60 + now.getMinutes();

      for (const item of schedule) {
        const key = `block:${item.id}:${date}`;
        if (
          firedRef.current.has(key) ||
          !isBlockInReminderWindow(item, nowMinutes, settings.leadMinutes)
        ) {
          continue;
        }
        firedRef.current.add(key);
        sendDesktopNotification({
          title: `Starting soon: ${item.title}`,
          body: `${item.startTime}–${item.endTime} · ${item.plannedMinutes ?? 0} min planned`,
        });
      }

      const reviewKey = `review:${date}`;
      if (
        settings.eveningReviewTime &&
        !reviewSaved &&
        !firedRef.current.has(reviewKey) &&
        isReviewDue(nowMinutes, settings.eveningReviewTime)
      ) {
        firedRef.current.add(reviewKey);
        sendDesktopNotification({
          title: "Evening review",
          body: "Wrap up today — mark what got done and plan tomorrow.",
        });
      }
    };

    tick();
    const id = setInterval(tick, TICK_MS);
    return () => clearInterval(id);
  }, [date, settings, schedule, reviewSaved]);
}
