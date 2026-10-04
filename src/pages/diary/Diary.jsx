import { useState } from "react";
import { NotebookPen, Plus } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { DiaryCard } from "@/components/diary/DiaryCard";
import { DiaryFormDialog } from "@/components/diary/DiaryFormDialog";
import { Button } from "@/components/ui/button";
import {
  useCreateDiaryEntry,
  useDeleteDiaryEntry,
  useDiaryEntries,
  useUpdateDiaryEntry,
} from "@/hooks/useDiary";

function friendlyError(error) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export function Diary() {
  const { data, isLoading, isError, refetch } = useDiaryEntries();
  const [dialog, setDialog] = useState(null);
  const createEntry = useCreateDiaryEntry();
  const updateEntry = useUpdateDiaryEntry();
  const deleteEntry = useDeleteDiaryEntry();

  const entries = data ?? [];

  const handleSubmit = async (values) => {
    try {
      if (dialog.kind === "add") {
        await createEntry.mutateAsync(values);
        toast.success("Diary entry saved");
      } else {
        await updateEntry.mutateAsync({ id: dialog.entry.id, ...values });
        toast.success("Diary entry updated");
      }
      setDialog(null);
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  const handleRemove = async (entry) => {
    try {
      await deleteEntry.mutateAsync({ id: entry.id });
      toast.success("Diary entry removed");
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">
            Digital Diary
          </h1>
          <p className="text-sm text-text-muted">
            Free-form writing, separate from reviews — just for you.
          </p>
        </div>
        <Button size="sm" onClick={() => setDialog({ kind: "add" })}>
          <Plus className="size-4" />
          New entry
        </Button>
      </div>

      {isLoading ? (
        <LoadingState message="Loading your diary…" />
      ) : isError ? (
        <ErrorState
          title="Couldn't load your diary"
          description="Something went wrong on the way to the database."
          onRetry={() => refetch()}
        />
      ) : entries.length === 0 ? (
        <EmptyState
          icon={NotebookPen}
          title="Your diary is empty"
          description="Write freely about how the day went — entries are private and stay on this device."
          action={
            <Button size="sm" onClick={() => setDialog({ kind: "add" })}>
              <Plus className="size-4" />
              New entry
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {entries.map((entry) => (
            <DiaryCard
              key={entry.id}
              entry={entry}
              onEdit={(item) => setDialog({ kind: "edit", entry: item })}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}

      {dialog && (
        <DiaryFormDialog
          open
          onOpenChange={(open) => {
            if (!open) setDialog(null);
          }}
          mode={
            dialog.kind === "add"
              ? { kind: "add" }
              : {
                  kind: "edit",
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
