import { useState } from "react";
import { Inbox, ListPlus, Loader2, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/button";
import { CONVERTED_TYPE } from "@/lib/constants";
import { formatTimestamp } from "@/lib/datetime";

const CONVERTED_LABELS = {
  [CONVERTED_TYPE.TASK]: "Converted to task",
  [CONVERTED_TYPE.IDEA]: "Converted to idea",
};

/**
 * @param {{ captures: object[], onConvert: (capture: object) => void,
 *   onRemove: (capture: object) => void, convertingId?: string|null,
 *   removePending?: boolean }} props
 */
export function CaptureList({
  captures,
  onConvert,
  onRemove,
  convertingId = null,
  removePending = false,
}) {
  const [confirmingId, setConfirmingId] = useState(null);

  if (captures.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface p-6">
        <EmptyState
          icon={Inbox}
          title="Nothing captured yet"
          description="Type a thought above — it lands here instantly, no questions asked."
        />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <ul className="divide-y divide-border-light">
        {captures.map((capture) => {
          const converted = Boolean(capture.convertedType);
          const converting = convertingId === capture.id;
          const confirming = confirmingId === capture.id;

          return (
            <li
              key={capture.id}
              className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0 flex-1">
                <p
                  className={`whitespace-pre-wrap break-words text-sm ${
                    converted ? "text-text-secondary" : "text-text-primary"
                  }`}
                >
                  {capture.content}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-text-muted">
                    {formatTimestamp(capture.capturedAt)}
                  </span>
                  {converted && (
                    <span className="rounded-full bg-accent-light px-2 py-0.5 text-xs font-medium text-accent">
                      {CONVERTED_LABELS[capture.convertedType] ?? "Organized"}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {confirming ? (
                  <>
                    <span className="text-xs text-text-muted">
                      Delete this capture?
                    </span>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => setConfirmingId(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      size="xs"
                      onClick={() => {
                        setConfirmingId(null);
                        onRemove(capture);
                      }}
                    >
                      Delete
                    </Button>
                  </>
                ) : (
                  <>
                    {!converted && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onConvert(capture)}
                        disabled={converting || removePending}
                      >
                        {converting ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <ListPlus className="size-4" />
                        )}
                        Convert to task
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Delete capture"
                      onClick={() => setConfirmingId(capture.id)}
                      disabled={converting || removePending}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
