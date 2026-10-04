import { format } from "date-fns";
import { Bell } from "lucide-react";

export function Topbar() {
  const today = format(new Date(), "EEEE, MMMM d, yyyy");

  return (
    <header className="h-16 border-b border-border bg-surface px-6 flex items-center justify-between">
      <div className="text-sm text-text-muted">{today}</div>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-md hover:bg-surface-secondary">
          <Bell className="size-5 text-text-muted" />
        </button>
      </div>
    </header>
  );
}
