export function Placeholder({ title }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
      <p className="text-sm text-text-muted mt-2">
        This section is under construction.
      </p>
    </div>
  );
}
