import { NavLink } from "react-router-dom";
import {
  Calendar,
  Target,
  Folder,
  CheckSquare,
  Clock,
  BookOpen,
  Brain,
  Eye,
  Lightbulb,
  FileText,
  BarChart3,
  Settings,
} from "lucide-react";

const navItems = [
  { to: "/", label: "Today", icon: Calendar },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/projects", label: "Projects", icon: Folder },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/focus", label: "Focus", icon: Clock },
  { to: "/learning", label: "Learning", icon: BookOpen },
  { to: "/concepts", label: "Concepts", icon: Brain },
  { to: "/watch-later", label: "Watch Later", icon: Eye },
  { to: "/ideas", label: "Ideas", icon: Lightbulb },
  { to: "/diary", label: "Diary", icon: FileText },
  { to: "/finance", label: "Finance", icon: BarChart3 },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/reviews", label: "Reviews", icon: FileText },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-surface border-r border-border h-screen sticky top-0">
      <div className="p-4">
        <h1 className="text-xl font-semibold text-text-primary">Schedule</h1>
      </div>
      <nav className="px-2">
        <ul className="space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-accent-light text-accent"
                      : "text-text-secondary hover:bg-surface-secondary"
                  }`
                }
              >
                <Icon className="size-4" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
