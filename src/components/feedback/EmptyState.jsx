/**
 * Empty-state panel for pages and sections with no data yet.
 * Pass a lucide icon component via `icon`.
 */
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      {Icon && <Icon className="size-8 text-text-muted" aria-hidden="true" />}
      <h3 className="text-base font-semibold text-text-primary">{title}</h3>
      {description && (
        <p className="text-sm text-text-muted max-w-sm">{description}</p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
