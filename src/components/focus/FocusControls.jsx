import { useState } from "react";
import { Check, Pause, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FOCUS_STATUS } from "@/lib/constants";

export function FocusControls({
  status,
  pending,
  onPause,
  onResume,
  onComplete,
  onCancel,
}) {
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const running = status === FOCUS_STATUS.STARTED;

  const handleCancelClick = () => {
    setConfirmingCancel(false);
    onCancel();
  };

  if (confirmingCancel) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs text-text-muted">Discard this session?</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setConfirmingCancel(false)}
          disabled={pending}
        >
          Keep going
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleCancelClick}
          disabled={pending}
        >
          Cancel session
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {running ? (
        <Button variant="outline" onClick={onPause} disabled={pending}>
          <Pause className="size-4" />
          Pause
        </Button>
      ) : (
        <Button variant="outline" onClick={onResume} disabled={pending}>
          <Play className="size-4" />
          Resume
        </Button>
      )}
      <Button onClick={onComplete} disabled={pending}>
        <Check className="size-4" />
        Complete session
      </Button>
      <Button
        variant="ghost"
        onClick={() => setConfirmingCancel(true)}
        disabled={pending}
      >
        <X className="size-4" />
        Cancel
      </Button>
    </div>
  );
}
