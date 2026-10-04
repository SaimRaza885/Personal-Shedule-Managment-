import { useState } from "react";
import { BookOpen, Plus } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { LearningCard } from "@/components/learning/LearningCard";
import { LearningFormDialog } from "@/components/learning/LearningFormDialog";
import { Button } from "@/components/ui/button";
import {
  useCreateLearningEntry,
  useDeleteLearningEntry,
  useLearningEntries,
  useUpdateLearningEntry,
} from "@/hooks/useLearning";

function friendlyError(error) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export function Learning() {
  const { data, isLoading, isError, refetch } = useLearningEntries();
  const [dialog, setDialog] = useState(null);
  const createEntry = useCreateLearningEntry();
  const updateEntry = useUpdateLearningEntry();
  const deleteEntry = useDeleteLearningEntry();

  const entries = data ?? [];

  const handleSubmit = async (values) => {
    try {
      if (dialog.kind === "add") {
        await createEntry.mutateAsync(values);
        toast.success("Learning note saved");
      } else {
        await updateEntry.mutateAsync({ id: dialog.entry.id, ...values });
        toast.success("Learning note updated");
      }
      setDialog(null);
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  const handleRemove = async (entry) => {
    try {
      await deleteEntry.mutateAsync({ id: entry.id });
      toast.success("Learning note removed");
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">
            What I Learned
          </h1>
          <p className="text-sm text-text-muted">
            Notes on things you figured out — kept for yourself, not for tests.
          </p>
        </div>
        <Button size="sm" onClick={() => setDialog({ kind: "add" })}>
          <Plus className="size-4" />
          New note
        </Button>
      </div>

      {isLoading ? (
        <LoadingState message="Loading your learning notes…" />
      ) : isError ? (
        <ErrorState
          title="Couldn't load your learning notes"
          description="Something went wrong on the way to the database."
          onRetry={() => refetch()}
        />
      ) : entries.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Nothing here yet"
          description="When something clicks, write it down so future you can find it."
          action={
            <Button size="sm" onClick={() => setDialog({ kind: "add" })}>
              <Plus className="size-4" />
              New note
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {entries.map((entry) => (
            <LearningCard
              key={entry.id}
              entry={entry}
              onEdit={(item) => setDialog({ kind: "edit", entry: item })}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}

      {dialog && (
        <LearningFormDialog
          open
          onOpenChange={(open) => {
            if (!open) setDialog(null);
          }}
          mode={
            dialog.kind === "add"
              ? { kind: "add" }
              : {
                  kind: "edit",
                  title: dialog.entry.title,
                  date: dialog.entry.date,
                  content: dialog.entry.content,
                }
          }
          onSubmit={handleSubmit}
          isPending={createEntry.isPending || updateEntry.isPending}
        />
      )}
    </div>
  );
}
