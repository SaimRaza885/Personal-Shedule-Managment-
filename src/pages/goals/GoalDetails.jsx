import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, Target } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { MilestoneList } from "@/components/goals/MilestoneList";
import { MilestoneFormDialog } from "@/components/goals/MilestoneFormDialog";
import {
  goalStatusBadgeClass,
  goalStatusLabel,
} from "@/components/goals/goalStatus";
import { Button } from "@/components/ui/button";
import {
  useCreateMilestone,
  useDeleteMilestone,
  useGoal,
  useGoalMilestones,
  useUpdateMilestone,
} from "@/hooks/useGoals";

function friendlyError(error) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export function GoalDetails() {
  const { id } = useParams();
  const goalQuery = useGoal(id);
  const milestonesQuery = useGoalMilestones(id);
  const [dialog, setDialog] = useState(null);
  const createMilestone = useCreateMilestone();
  const updateMilestone = useUpdateMilestone();
  const deleteMilestone = useDeleteMilestone();

  const goal = goalQuery.data;
  const milestones = milestonesQuery.data ?? [];

  const handleSubmit = async (values) => {
    try {
      if (dialog.kind === "add") {
        await createMilestone.mutateAsync({ goalId: id, ...values });
        toast.success("Milestone added");
      } else {
        await updateMilestone.mutateAsync({
          id: dialog.milestone.id,
          goalId: id,
          ...values,
        });
        toast.success("Milestone updated");
      }
      setDialog(null);
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  const handleRemove = async (milestone) => {
    try {
      await deleteMilestone.mutateAsync({ id: milestone.id, goalId: id });
      toast.success("Milestone removed");
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  const isLoading = goalQuery.isLoading || milestonesQuery.isLoading;
  const isError = goalQuery.isError || milestonesQuery.isError;

  return (
    <div className="space-y-6">
      <Link
        to="/goals"
        className="inline-flex items-center gap-1 text-sm text-text-secondary transition-colors hover:text-text-primary"
      >
        <ChevronLeft className="size-4" />
        All goals
      </Link>

      {isLoading ? (
        <LoadingState message="Loading goal…" />
      ) : isError ? (
        <ErrorState
          title="Couldn't load this goal"
          description="Something went wrong on the way to the database."
          onRetry={() => {
            goalQuery.refetch();
            milestonesQuery.refetch();
          }}
        />
      ) : !goal ? (
        <section className="rounded-lg border border-border bg-surface">
          <EmptyState
            icon={Target}
            title="Goal not found"
            description="This goal may have been removed."
            action={
              <Button variant="outline" size="sm" asChild>
                <Link to="/goals">Back to goals</Link>
              </Button>
            }
          />
        </section>
      ) : (
        <>
          <section className="rounded-lg border border-border bg-surface p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-xl font-semibold text-text-primary">
                  {goal.title}
                </h1>
                {goal.description && (
                  <p className="mt-1 text-sm text-text-secondary">
                    {goal.description}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {goal.year && (
                  <span className="rounded-full bg-surface-tertiary px-2 py-0.5 text-xs font-medium text-text-secondary">
                    {goal.year}
                  </span>
                )}
                <span className={goalStatusBadgeClass(goal.status)}>
                  {goalStatusLabel(goal.status)}
                </span>
              </div>
            </div>
          </section>

          <MilestoneList
            items={milestones}
            onAdd={() => setDialog({ kind: "add" })}
            onEdit={(item) => setDialog({ kind: "edit", milestone: item })}
            onRemove={handleRemove}
          />
        </>
      )}

      {dialog && (
        <MilestoneFormDialog
          open
          onOpenChange={(open) => {
            if (!open) setDialog(null);
          }}
          mode={
            dialog.kind === "add"
              ? { kind: "add" }
              : {
                  kind: "edit",
                  title: dialog.milestone.title,
                  description: dialog.milestone.description,
                  periodType: dialog.milestone.periodType,
                  targetDate: dialog.milestone.targetDate,
                  status: dialog.milestone.status,
                }
          }
          onSubmit={handleSubmit}
          isPending={
            createMilestone.isPending || updateMilestone.isPending
          }
        />
      )}
    </div>
  );
}
