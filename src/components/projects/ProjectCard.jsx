import { useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { projectStatusBadgeClass, projectStatusLabel } from "./projectStatus";

/**
 * @param {{ project: object, onEdit: (project: object) => void,
 *   onRemove: (project: object) => void }} props
 */
export function ProjectCard({ project, onEdit, onRemove }) {
  const [confirming, setConfirming] = useState(false);
  const total = project.tasksTotal ?? 0;
  const completed = project.tasksCompleted ?? 0;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-text-primary">
            {project.name}
          </h3>
          {project.description && (
            <p className="mt-1 line-clamp-2 text-sm text-text-secondary">
              {project.description}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {project.goalTitle && (
            <span className="max-w-40 truncate rounded-full bg-surface-tertiary px-2 py-0.5 text-xs font-medium text-text-secondary">
              {project.goalTitle}
            </span>
          )}
          <span className={projectStatusBadgeClass(project.status)}>
            {projectStatusLabel(project.status)}
          </span>
        </div>
      </div>

      {total > 0 ? (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted">
              {completed} of {total} tasks complete
            </span>
            <span className="text-text-secondary">{percent}%</span>
          </div>
          <div className="h-1 rounded-full bg-border-light">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      ) : (
        <p className="text-xs text-text-muted">No tasks yet</p>
      )}

      <div className="mt-auto pt-1">
        {confirming ? (
          <div className="flex items-center justify-end gap-2">
            <span className="text-xs text-text-muted">
              Remove project? Its tasks will be kept.
            </span>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setConfirming(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="xs"
              onClick={() => {
                setConfirming(false);
                onRemove(project);
              }}
            >
              Remove
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={`Edit ${project.name}`}
                onClick={() => onEdit(project)}
              >
                <Pencil className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={`Remove ${project.name}`}
                onClick={() => setConfirming(true)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/projects/${project.id}`}>View tasks</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
