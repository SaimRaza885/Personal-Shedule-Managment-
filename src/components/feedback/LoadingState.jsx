import { Loader2 } from "lucide-react";

/**
 * Centered loading indicator shown while page queries resolve.
 */
export function LoadingState({ message = "Loading…" }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-16 text-text-muted"
      role="status"
    >
      <Loader2 className="size-6 animate-spin text-accent" aria-hidden="true" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
