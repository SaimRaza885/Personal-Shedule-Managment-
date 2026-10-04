import { useState } from "react";
import { Eye, Plus } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { WatchLaterCard } from "@/components/watch-later/WatchLaterCard";
import { WatchLaterFormDialog } from "@/components/watch-later/WatchLaterFormDialog";
import { Button } from "@/components/ui/button";
import { WATCH_STATUS } from "@/lib/constants";
import {
  useCreateWatchItem,
  useDeleteWatchItem,
  useSetWatchItemStatus,
  useUpdateWatchItem,
  useWatchLater,
} from "@/hooks/useWatchLater";

function friendlyError(error) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export function WatchLater() {
  const { data: items, isLoading, isError, refetch } = useWatchLater();
  const [dialog, setDialog] = useState(null);
  const createItem = useCreateWatchItem();
  const updateItem = useUpdateWatchItem();
  const setItemStatus = useSetWatchItemStatus();
  const deleteItem = useDeleteWatchItem();

  const handleSubmit = async (values) => {
    try {
      if (dialog.kind === "add") {
        await createItem.mutateAsync(values);
        toast.success("Added to Watch Later");
      } else {
        await updateItem.mutateAsync({ id: dialog.item.id, ...values });
        toast.success("Link updated");
      }
      setDialog(null);
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  const handleToggleStatus = async (item) => {
    const nextStatus =
      item.status === WATCH_STATUS.WATCHED
        ? WATCH_STATUS.PENDING
        : WATCH_STATUS.WATCHED;
    try {
      await setItemStatus.mutateAsync({ id: item.id, status: nextStatus });
      toast.success(
        nextStatus === WATCH_STATUS.WATCHED
          ? "Marked as watched"
          : "Marked as unwatched",
      );
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  const handleRemove = async (item) => {
    try {
      await deleteItem.mutateAsync({ id: item.id });
      toast.success("Link removed");
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">
            Watch Later
          </h1>
          <p className="text-sm text-text-muted">
            Links worth your time — scheduled for a real moment, not an
            endless backlog.
          </p>
        </div>
        <Button size="sm" onClick={() => setDialog({ kind: "add" })}>
          <Plus className="size-4" />
          New link
        </Button>
      </div>

      {isLoading ? (
        <LoadingState message="Loading your watch list…" />
      ) : isError ? (
        <ErrorState
          title="Couldn't load your watch list"
          description="Something went wrong on the way to the database."
          onRetry={() => refetch()}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Eye}
          title="Nothing saved yet"
          description="Save videos and articles here with a date, so watching them actually happens."
          action={
            <Button size="sm" onClick={() => setDialog({ kind: "add" })}>
              <Plus className="size-4" />
              New link
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {items.map((item) => (
            <WatchLaterCard
              key={item.id}
              item={item}
              onToggleStatus={handleToggleStatus}
              onEdit={(entry) => setDialog({ kind: "edit", item: entry })}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}

      {dialog && (
        <WatchLaterFormDialog
          open
          onOpenChange={(open) => {
            if (!open) setDialog(null);
          }}
          mode={
            dialog.kind === "add"
              ? { kind: "add" }
              : {
                  kind: "edit",
                  title: dialog.item.title,
                  url: dialog.item.url,
                  scheduledDate: dialog.item.scheduledDate,
                  status: dialog.item.status,
                }
          }
          onSubmit={handleSubmit}
          isPending={createItem.isPending || updateItem.isPending}
        />
      )}
    </div>
  );
}
