import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { AppErrorBoundary } from "@/components/feedback/AppErrorBoundary";

export function AppShell() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="flex-1 p-6">
            <AppErrorBoundary>
              <Outlet />
            </AppErrorBoundary>
          </main>
        </div>
      </div>
    </div>
  );
}
