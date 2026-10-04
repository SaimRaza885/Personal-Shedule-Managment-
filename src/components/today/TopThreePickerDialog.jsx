import { Loader2, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/datetime";

/**
 * @param {{ open: boolean, onOpenChange: (open: boolean) => void,
 *   candidates: Array<{ id: string, title: string, startTime: string, endTime: string }>,
 *   canAdd: boolean, isPending: boolean,
 *   onAdd: (candidate: object) => void }} props
 */
export function TopThreePickerDialog({
  open,
  onOpenChange,
  candidates,
  canAdd,
  isPending,
  onAdd,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Add to Daily Top 3</DialogTitle>
          <DialogDescription>
            {canAdd
              ? "Pick one of today's scheduled tasks to focus on."
              : "Your Top 3 is full. Remove a task before adding another."}
          </DialogDescription>
        </DialogHeader>
        {candidates.length === 0 ? (
          <p className="py-6 text-center text-sm text-text-muted">
            Every available task is already in your Top 3.
          </p>
        ) : (
          <ul className="divide-y divide-border-light">
            {candidates.map((candidate) => (
              <li
                key={candidate.id}
                className="flex items-center gap-4 py-3"
              >
                <div className="w-28 shrink-0 text-sm text-text-secondary">
                  {formatTime(candidate.startTime)} — {formatTime(candidate.endTime)}
                </div>
                <p className="min-w-0 flex-1 truncate text-sm font-medium text-text-primary">
                  {candidate.title}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!canAdd || isPending}
                  onClick={() => onAdd(candidate)}
                >
                  {isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Star className="size-4" />
                  )}
                  Add
                </Button>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
