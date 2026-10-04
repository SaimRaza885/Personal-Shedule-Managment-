import { useState } from "react";
import { Lightbulb, Plus } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { IdeaCard } from "@/components/ideas/IdeaCard";
import { IdeaFormDialog } from "@/components/ideas/IdeaFormDialog";
import { Button } from "@/components/ui/button";
import {
  useCreateIdea,
  useDeleteIdea,
  useIdeas,
  useUpdateIdea,
} from "@/hooks/useIdeas";

function friendlyError(error) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export function Ideas() {
  const { data: ideas, isLoading, isError, refetch } = useIdeas();
  const [dialog, setDialog] = useState(null);
  const createIdea = useCreateIdea();
  const updateIdea = useUpdateIdea();
  const deleteIdea = useDeleteIdea();

  const handleSubmit = async (values) => {
    try {
      if (dialog.kind === "add") {
        await createIdea.mutateAsync(values);
        toast.success("Idea created");
      } else {
        await updateIdea.mutateAsync({ id: dialog.idea.id, ...values });
        toast.success("Idea updated");
      }
      setDialog(null);
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  const handleRemove = async (idea) => {
    try {
      await deleteIdea.mutateAsync({ id: idea.id });
      toast.success("Idea removed");
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Ideas</h1>
          <p className="text-sm text-text-muted">
            A vault for thoughts that are not tasks yet.
          </p>
        </div>
        <Button size="sm" onClick={() => setDialog({ kind: "add" })}>
          <Plus className="size-4" />
          New idea
        </Button>
      </div>

      {isLoading ? (
        <LoadingState message="Loading your ideas…" />
      ) : isError ? (
        <ErrorState
          title="Couldn't load your ideas"
          description="Something went wrong on the way to the database."
          onRetry={() => refetch()}
        />
      ) : ideas.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="No ideas yet"
          description="Keep ideas here so they don't compete with today's work."
          action={
            <Button size="sm" onClick={() => setDialog({ kind: "add" })}>
              <Plus className="size-4" />
              New idea
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {ideas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onEdit={(item) => setDialog({ kind: "edit", idea: item })}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}

      {dialog && (
        <IdeaFormDialog
          open
          onOpenChange={(open) => {
            if (!open) setDialog(null);
          }}
          mode={
            dialog.kind === "add"
              ? { kind: "add" }
              : {
                  kind: "edit",
                  title: dialog.idea.title,
                  description: dialog.idea.description,
                  status: dialog.idea.status,
                }
          }
          onSubmit={handleSubmit}
          isPending={createIdea.isPending || updateIdea.isPending}
        />
      )}
    </div>
  );
}
