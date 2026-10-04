import { useState } from "react";
import { ListTodo, Plus } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { statusLabel } from "@/components/today/taskStatus";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGoals } from "@/hooks/useGoals";
import { useProjects } from "@/hooks/useProjects";
import {
  useCreateTask,
  useCreateTaskStep,
  useDeleteTask,
  useDeleteTaskStep,
  useSetTaskStatus,
  useSetTaskStepCompleted,
  useTasks,
  useTaskSteps,
  useUpdateTask,
} from "@/hooks/useTasks";
import { TASK_STATUS } from "@/lib/constants";

const ALL_STATUSES = "all";

const STATUS_OPTIONS = Object.values(TASK_STATUS).map((value) => ({
  value,
  label: statusLabel(value),
}));

function friendlyError(error) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export function Tasks() {
  const [statusFilter, setStatusFilter] = useState(ALL_STATUSES);
  const [dialog, setDialog] = useState(null);
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  const status = statusFilter === ALL_STATUSES ? null : statusFilter;
  const { data: tasks, isLoading, isError, refetch } = useTasks(status);
  const { data: projects } = useProjects();
  const { data: goals } = useGoals();
  const stepsQuery = useTaskSteps(expandedTaskId);

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const setStatus = useSetTaskStatus();
  const addStep = useCreateTaskStep();
  const toggleStep = useSetTaskStepCompleted();
  const removeStep = useDeleteTaskStep();

  const projectOptions = (projects ?? []).map((project) => ({
    id: project.id,
    name: project.name,
  }));
  const goalOptions = (goals ?? []).map((goal) => ({
    id: goal.id,
    title: goal.title,
  }));

  const handleSubmit = async (values) => {
    try {
      if (dialog.kind === "add") {
        await createTask.mutateAsync(values);
        toast.success("Task created");
      } else {
        await updateTask.mutateAsync({ id: dialog.task.id, ...values });
        toast.success("Task updated");
      }
      setDialog(null);
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  const handleRemove = async (task) => {
    try {
      await deleteTask.mutateAsync({ id: task.id });
      if (expandedTaskId === task.id) setExpandedTaskId(null);
      toast.success("Task removed");
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  const handleToggleComplete = async (task, nextStatus) => {
    try {
      await setStatus.mutateAsync({ id: task.id, status: nextStatus });
      toast.success(
        nextStatus === TASK_STATUS.COMPLETED
          ? "Task completed"
          : "Task reopened",
      );
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  const handleAddStep = async (task, title) => {
    try {
      await addStep.mutateAsync({ taskId: task.id, title });
      return true;
    } catch (error) {
      toast.error(friendlyError(error));
      return false;
    }
  };

  const handleToggleStep = async (step) => {
    try {
      await toggleStep.mutateAsync({
        id: step.id,
        isCompleted: !step.isCompleted,
      });
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  const handleRemoveStep = async (step) => {
    try {
      await removeStep.mutateAsync({ id: step.id });
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  const isFiltered = statusFilter !== ALL_STATUSES;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Tasks</h1>
          <p className="text-sm text-text-muted">
            Everything you need to do, broken into steps.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setExpandedTaskId(null);
            }}
          >
            <SelectTrigger className="w-40" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_STATUSES}>All statuses</SelectItem>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={() => setDialog({ kind: "add" })}>
            <Plus className="size-4" />
            New task
          </Button>
        </div>
      </div>

      {isLoading ? (
        <LoadingState message="Loading tasks…" />
      ) : isError ? (
        <ErrorState
          title="Couldn't load your tasks"
          description="Something went wrong on the way to the database."
          onRetry={() => refetch()}
        />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          title={isFiltered ? "No tasks with this status" : "No tasks yet"}
          description={
            isFiltered
              ? "Pick another status or create a new task."
              : "Break your work into small, schedulable tasks."
          }
          action={
            <div className="flex items-center gap-2">
              {isFiltered && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStatusFilter(ALL_STATUSES)}
                >
                  Clear filter
                </Button>
              )}
              <Button size="sm" onClick={() => setDialog({ kind: "add" })}>
                <Plus className="size-4" />
                New task
              </Button>
            </div>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {tasks.map((task) => {
            const expanded = expandedTaskId === task.id;
            return (
              <TaskCard
                key={task.id}
                task={task}
                expanded={expanded}
                onToggleExpand={() =>
                  setExpandedTaskId(expanded ? null : task.id)
                }
                onEdit={(item) => setDialog({ kind: "edit", task: item })}
                onRemove={handleRemove}
                onToggleComplete={handleToggleComplete}
                statusPending={setStatus.isPending}
                steps={expanded ? stepsQuery.data : undefined}
                stepsLoading={expanded && stepsQuery.isLoading}
                stepsPending={
                  addStep.isPending ||
                  toggleStep.isPending ||
                  removeStep.isPending
                }
                onAddStep={(title) => handleAddStep(task, title)}
                onToggleStep={handleToggleStep}
                onRemoveStep={handleRemoveStep}
              />
            );
          })}
        </div>
      )}

      {dialog && (
        <TaskFormDialog
          open
          onOpenChange={(open) => {
            if (!open) setDialog(null);
          }}
          mode={
            dialog.kind === "add"
              ? { kind: "add" }
              : { kind: "edit", task: dialog.task }
          }
          projects={projectOptions}
          goals={goalOptions}
          onSubmit={handleSubmit}
          isPending={createTask.isPending || updateTask.isPending}
        />
      )}
    </div>
  );
}
