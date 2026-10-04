import { useState } from "react";
import { Brain, Plus } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ConceptCard } from "@/components/concepts/ConceptCard";
import { ConceptFormDialog } from "@/components/concepts/ConceptFormDialog";
import { Button } from "@/components/ui/button";
import {
  useConcepts,
  useCreateConcept,
  useDeleteConcept,
  useUpdateConcept,
} from "@/hooks/useConcepts";

function friendlyError(error) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export function Concepts() {
  const { data, isLoading, isError, refetch } = useConcepts();
  const [dialog, setDialog] = useState(null);
  const createConcept = useCreateConcept();
  const updateConcept = useUpdateConcept();
  const deleteConcept = useDeleteConcept();

  const concepts = data ?? [];

  const handleSubmit = async (values) => {
    try {
      if (dialog.kind === "add") {
        await createConcept.mutateAsync(values);
        toast.success("Concept added");
      } else {
        await updateConcept.mutateAsync({ id: dialog.concept.id, ...values });
        toast.success("Concept updated");
      }
      setDialog(null);
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  const handleRemove = async (concept) => {
    try {
      await deleteConcept.mutateAsync({ id: concept.id });
      toast.success("Concept removed");
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">
            Tech Concepts
          </h1>
          <p className="text-sm text-text-muted">
            Concepts you want to actually know — tracked until they stick.
          </p>
        </div>
        <Button size="sm" onClick={() => setDialog({ kind: "add" })}>
          <Plus className="size-4" />
          New concept
        </Button>
      </div>

      {isLoading ? (
        <LoadingState message="Loading your concepts…" />
      ) : isError ? (
        <ErrorState
          title="Couldn't load your concepts"
          description="Something went wrong on the way to the database."
          onRetry={() => refetch()}
        />
      ) : concepts.length === 0 ? (
        <EmptyState
          icon={Brain}
          title="No concepts yet"
          description="Add the things you're learning so progress is visible."
          action={
            <Button size="sm" onClick={() => setDialog({ kind: "add" })}>
              <Plus className="size-4" />
              New concept
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {concepts.map((concept) => (
            <ConceptCard
              key={concept.id}
              concept={concept}
              onEdit={(item) => setDialog({ kind: "edit", concept: item })}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}

      {dialog && (
        <ConceptFormDialog
          open
          onOpenChange={(open) => {
            if (!open) setDialog(null);
          }}
          mode={
            dialog.kind === "add"
              ? { kind: "add" }
              : {
                  kind: "edit",
                  title: dialog.concept.title,
                  category: dialog.concept.category,
                  description: dialog.concept.description,
                  status: dialog.concept.status,
                }
          }
          onSubmit={handleSubmit}
          isPending={createConcept.isPending || updateConcept.isPending}
        />
      )}
    </div>
  );
}
