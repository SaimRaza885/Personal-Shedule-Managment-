import { CircleAlert, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMinutes } from "@/lib/datetime";

/**
 * Warns when today's remaining plan does not fit the user's available time.
 * Purely informational — the plan is never changed from here.
 * @param {{ overload: { remainingMinutes: number, availableMinutes: number, overloaded: boolean },
 *   onAdjust: () => void }} props
 */
export function OverloadBanner({ overload, onAdjust }) {
  if (!overload?.overloaded) return null;

  return (
    <section
      role="alert"
      className="rounded-lg border border-warning-light bg-warning-lightest p-4"
    >
      <div className="flex items-start gap-3">
        <CircleAlert className="mt-0.5 size-5 shrink-0 text-warning-dark" />
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-warning-foreground">
            Your plan is overloaded.
          </h2>
          <p className="mt-1 text-sm text-warning-foreground">
            Planned work: {formatMinutes(overload.remainingMinutes)} · Available
            time: {formatMinutes(overload.availableMinutes)}
          </p>
          <p className="mt-1 text-xs text-warning-foreground">
            Move, shorten, or remove tasks below to make the day fit —
            nothing changes unless you change it.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onAdjust}>
          <Pencil className="size-4" />
          Available time
        </Button>
      </div>
    </section>
  );
}
