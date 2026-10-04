import { toast } from "sonner";
import { CaptureForm } from "@/components/captures/CaptureForm";
import { CaptureList } from "@/components/captures/CaptureList";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import {
  useCaptures,
  useConvertCaptureToTask,
  useCreateCapture,
  useDeleteCapture,
} from "@/hooks/useCaptures";

function friendlyError(error) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export function QuickCapture() {
  const { data, isLoading, isError, refetch } = useCaptures();
  const createCapture = useCreateCapture();
  const convertToTask = useConvertCaptureToTask();
  const removeCapture = useDeleteCapture();

  const captures = data ?? [];
  const waiting = captures.filter((capture) => !capture.convertedType).length;

  const handleCapture = async (content) => {
    try {
      await createCapture.mutateAsync({ content });
      toast.success("Captured");
      return true;
    } catch (error) {
      toast.error(friendlyError(error));
      return false;
    }
  };

  const handleConvert = async (capture) => {
    try {
      await convertToTask.mutateAsync({ id: capture.id });
      toast.success("Converted to a task");
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  const handleRemove = async (capture) => {
    try {
      await removeCapture.mutateAsync({ id: capture.id });
      toast.success("Capture deleted");
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  const convertingId = convertToTask.isPending
    ? convertToTask.variables?.id
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">
          Quick Capture
        </h1>
        <p className="text-sm text-text-muted">
          Get it out of your head now — organize it into tasks later.
        </p>
      </div>

      <CaptureForm onSubmit={handleCapture} isPending={createCapture.isPending} />

      {isLoading ? (
        <LoadingState message="Loading your captures…" />
      ) : isError ? (
        <ErrorState
          title="Couldn't load your captures"
          description="Something went wrong on the way to the database."
          onRetry={() => refetch()}
        />
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-text-primary">Inbox</h2>
            {waiting > 0 && (
              <p className="text-sm text-text-muted">
                {waiting} waiting to be organized
              </p>
            )}
          </div>
          <CaptureList
            captures={captures}
            onConvert={handleConvert}
            onRemove={handleRemove}
            convertingId={convertingId}
            removePending={removeCapture.isPending}
          />
        </div>
      )}
    </div>
  );
}
