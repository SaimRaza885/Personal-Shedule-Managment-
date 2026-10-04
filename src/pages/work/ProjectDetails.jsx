import { Link, useParams } from "react-router-dom";
import { ChevronLeft, FolderKanban } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ProjectTasks } from "@/components/projects/ProjectTasks";
import {
  projectStatusBadgeClass,
  projectStatusLabel,
} from "@/components/projects/projectStatus";
import { Button } from "@/components/ui/button";
import { useProject, useProjectTasks } from "@/hooks/useProjects";

export function ProjectDetails() {
  const { id } = useParams();
  const projectQuery = useProject(id);
  const tasksQuery = useProjectTasks(id);

  const project = projectQuery.data;
  const tasks = tasksQuery.data ?? [];

  const isLoading = projectQuery.isLoading || tasksQuery.isLoading;
  const isError = projectQuery.isError || tasksQuery.isError;

  return (
    <div className="space-y-6">
      <Link
        to="/projects"
        className="inline-flex items-center gap-1 text-sm text-text-secondary transition-colors hover:text-text-primary"
      >
        <ChevronLeft className="size-4" />
        All projects
      </Link>

      {isLoading ? (
        <LoadingState message="Loading project…" />
      ) : isError ? (
        <ErrorState
          title="Couldn't load this project"
          description="Something went wrong on the way to the database."
          onRetry={() => {
            projectQuery.refetch();
            tasksQuery.refetch();
          }}
        />
      ) : !project ? (
        <section className="rounded-lg border border-border bg-surface">
          <EmptyState
            icon={FolderKanban}
            title="Project not found"
            description="This project may have been removed."
            action={
              <Button variant="outline" size="sm" asChild>
                <Link to="/projects">Back to projects</Link>
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
                  {project.name}
                </h1>
                {project.description && (
                  <p className="mt-1 text-sm text-text-secondary">
                    {project.description}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {project.goalTitle && (
                  <Link
                    to={`/goals/${project.goalId}`}
                    className="max-w-40 truncate rounded-full bg-surface-tertiary px-2 py-0.5 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary"
                  >
                    {project.goalTitle}
                  </Link>
                )}
                <span className={projectStatusBadgeClass(project.status)}>
                  {projectStatusLabel(project.status)}
                </span>
              </div>
            </div>
          </section>

          <ProjectTasks items={tasks} />
        </>
      )}
    </div>
  );
}
