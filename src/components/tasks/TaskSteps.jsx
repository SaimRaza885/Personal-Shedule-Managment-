import { useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Steps turn a task into a checklist. Rendering only — the parent owns the
 * queries and mutations.
 * @param {{ steps?: object[], isLoading?: boolean, disabled?: boolean,
 *   onAdd: (title: string) => Promise<boolean>,
 *   onToggle: (step: object) => void, onRemove: (step: object) => void }} props
 */
export function TaskSteps({
  steps,
  isLoading = false,
  disabled = false,
  onAdd,
  onToggle,
  onRemove,
}) {
  const [title, setTitle] = useState("");
  const [confirmingId, setConfirmingId] = useState(null);
  const items = steps ?? [];

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    const saved = await onAdd(trimmed);
    if (saved) setTitle("");
  };

  return (
    <div className="space-y-3">
      {isLoading ? (
        <p className="text-xs text-text-muted">Loading steps…</p>
      ) : items.length === 0 ? (
        <p className="text-xs text-text-muted">
          No steps yet. Break this task into smaller pieces.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((step) => (
            <li key={step.id} className="flex items-center gap-2">
              <button
                type="button"
                aria-label={
                  step.isCompleted
                    ? `Mark "${step.title}" not done`
                    : `Mark "${step.title}" done`
                }
                onClick={() => onToggle(step)}
                disabled={disabled}
                className={
                  step.isCompleted
                    ? "flex size-4 shrink-0 items-center justify-center rounded border border-transparent bg-success-light text-success-foreground"
                    : "flex size-4 shrink-0 items-center justify-center rounded border border-border-muted text-transparent transition-colors hover:border-accent"
                }
              >
                <Check className="size-3" />
              </button>
              <span
                className={
                  step.isCompleted
                    ? "flex-1 truncate text-sm text-text-muted line-through"
                    : "flex-1 truncate text-sm text-text-primary"
                }
              >
                {step.title}
              </span>
              {confirmingId === step.id ? (
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs text-text-muted">Remove step?</span>
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
                      onRemove(step);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Remove step ${step.title}`}
                  onClick={() => setConfirmingId(step.id)}
                >
                  <X className="size-3.5" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Add a step…"
          className="h-8 flex-1"
          disabled={disabled}
        />
        <Button
          type="submit"
          variant="outline"
          size="icon-sm"
          aria-label="Add step"
          disabled={disabled || !title.trim()}
        >
          <Plus className="size-4" />
        </Button>
      </form>
    </div>
  );
}
