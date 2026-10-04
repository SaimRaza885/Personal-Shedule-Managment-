import { useState } from "react";
import { Plus, Target } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { GoalCard } from "@/components/goals/GoalCard";
import { GoalFormDialog } from "@/components/goals/GoalFormDialog";
import { Button } from "@/components/ui/button";
import {
  useCreateGoal,
  useDeleteGoal,
  useGoals,
  useUpdateGoal,
} from "@/hooks/useGoals";

function friendlyError(error) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export function Goals() {
  const { data: goals, isLoading, isError, refetch } = useGoals();
  const [dialog, setDialog] = useState(null);
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();

  const handleSubmit = async (values) => {
    try {
      if (dialog.kind === "add") {
        await createGoal.mutateAsync(values);
        toast.success("Goal created");
      } else {
        await updateGoal.mutateAsync({ id: dialog.goal.id, ...values });
        toast.success("Goal updated");
      }
      setDialog(null);
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  const handleRemove = async (goal) => {
    try {
      await deleteGoal.mutateAsync({ id: goal.id });
      toast.success("Goal removed");
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Goals</h1>
          <p className="text-sm text-text-muted">
            Long-term targets, broken into milestones you can track.
          </p>
        </div>
        <Button size="sm" onClick={() => setDialog({ kind: "add" })}>
          <Plus className="size-4" />
          New goal
        </Button>
      </div>

      {isLoading ? (
        <LoadingState message="Loading goals…" />
      ) : isError ? (
        <ErrorState
          title="Couldn't load your goals"
          description="Something went wrong on the way to the database."
          onRetry={() => refetch()}
        />
      ) : goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No goals yet"
          description="Set a goal to track what you are working toward this year."
          action={
            <Button size="sm" onClick={() => setDialog({ kind: "add" })}>
              <Plus className="size-4" />
              New goal
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={(item) => setDialog({ kind: "edit", goal: item })}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}

      {dialog && (
        <GoalFormDialog
          open
          onOpenChange={(open) => {
            if (!open) setDialog(null);
          }}
          mode={
            dialog.kind === "add"
              ? { kind: "add" }
              : {
                  kind: "edit",
                  title: dialog.goal.title,
                  description: dialog.goal.description,
                  year: dialog.goal.year,
                  status: dialog.goal.status,
                }
          }
          onSubmit={handleSubmit}
          isPending={createGoal.isPending || updateGoal.isPending}
        />
      )}
    </div>
  );
}
