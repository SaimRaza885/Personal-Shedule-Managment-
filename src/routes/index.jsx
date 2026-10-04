import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { Today } from "@/pages/today/Today";
import { Goals } from "@/pages/goals/Goals";
import { GoalDetails } from "@/pages/goals/GoalDetails";
import { Projects } from "@/pages/work/Projects";
import { ProjectDetails } from "@/pages/work/ProjectDetails";
import { Tasks } from "@/pages/work/Tasks";
import { Focus } from "@/pages/focus/Focus";
import { QuickCapture } from "@/pages/captures/QuickCapture";
import { Ideas } from "@/pages/ideas/Ideas";
import { Learning } from "@/pages/learning/Learning";
import { Concepts } from "@/pages/concepts/Concepts";
import { WatchLater } from "@/pages/watch-later/WatchLater";
import { Reviews } from "@/pages/reviews/Reviews";
import { Diary } from "@/pages/diary/Diary";
import { Placeholder } from "@/pages/Placeholder";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { path: "/", element: <Today /> },
      { path: "/goals", element: <Goals /> },
      { path: "/goals/:id", element: <GoalDetails /> },
      { path: "/projects", element: <Projects /> },
      { path: "/projects/:id", element: <ProjectDetails /> },
      { path: "/tasks", element: <Tasks /> },
      { path: "/focus", element: <Focus /> },
      { path: "/learning", element: <Learning /> },
      { path: "/concepts", element: <Concepts /> },
      { path: "/watch-later", element: <WatchLater /> },
      { path: "/ideas", element: <Ideas /> },
      { path: "/quick-capture", element: <QuickCapture /> },
      { path: "/diary", element: <Diary /> },
      { path: "/finance", element: <Placeholder title="Finance Tracker" /> },
      { path: "/reviews", element: <Reviews /> },
      { path: "/analytics", element: <Placeholder title="Analytics" /> },
      { path: "/settings", element: <Placeholder title="Settings" /> },
    ],
  },
]);
