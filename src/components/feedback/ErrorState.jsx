import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Error panel for failed queries or crashed screens.
 */
export function ErrorState({ title = "Something went wrong", description, onRetry }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 py-16 text-center"
      role="alert"
    >
      <CircleAlert className="size-8 text-destructive" aria-hidden="true" />
      <h3 className="text-base font-semibold text-text-primary">{title}</h3>
      {description && (
        <p className="text-sm text-text-muted max-w-sm">{description}</p>
      )}
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
