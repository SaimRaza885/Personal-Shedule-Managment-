import { useState } from "react";
import { FolderKanban, Plus } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectFormDialog } from "@/components/projects/ProjectFormDialog";
import { Button } from "@/components/ui/button";
import { useGoals } from "@/hooks/useGoals";
import {
  useCreateProject,
  useDeleteProject,
  useProjects,
  useUpdateProject,
} from "@/hooks/useProjects";

function friendlyError(error) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export function Projects() {
  const { data: projects, isLoading, isError, refetch } = useProjects();
  const { data: goals } = useGoals();
  const [dialog, setDialog] = useState(null);
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const goalOptions = (goals ?? []).map((goal) => ({
    id: goal.id,
    title: goal.title,
  }));

  const handleSubmit = async (values) => {
    try {
      if (dialog.kind === "add") {
        await createProject.mutateAsync(values);
        toast.success("Project created");
      } else {
        await updateProject.mutateAsync({ id: dialog.project.id, ...values });
        toast.success("Project updated");
      }
      setDialog(null);
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  const handleRemove = async (project) => {
    try {
      await deleteProject.mutateAsync({ id: project.id });
      toast.success("Project removed");
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Projects</h1>
          <p className="text-sm text-text-muted">
            Groups of tasks that move your goals forward.
          </p>
        </div>
        <Button size="sm" onClick={() => setDialog({ kind: "add" })}>
          <Plus className="size-4" />
          New project
        </Button>
      </div>

      {isLoading ? (
        <LoadingState message="Loading projects…" />
      ) : isError ? (
        <ErrorState
          title="Couldn't load your projects"
          description="Something went wrong on the way to the database."
          onRetry={() => refetch()}
        />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create a project to organize the work behind a goal."
          action={
            <Button size="sm" onClick={() => setDialog({ kind: "add" })}>
              <Plus className="size-4" />
              New project
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={(item) => setDialog({ kind: "edit", project: item })}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}

      {dialog && (
        <ProjectFormDialog
          open
          onOpenChange={(open) => {
            if (!open) setDialog(null);
          }}
          mode={
            dialog.kind === "add"
              ? { kind: "add" }
              : {
                  kind: "edit",
                  name: dialog.project.name,
                  description: dialog.project.description,
                  goalId: dialog.project.goalId,
                  status: dialog.project.status,
                }
          }
          goals={goalOptions}
          onSubmit={handleSubmit}
          isPending={createProject.isPending || updateProject.isPending}
        />
      )}
    </div>
  );
}
