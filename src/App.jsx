import { Routes, Route } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import Today from "./pages/today/Today";
import Goals from "./pages/goals/Goals";
import Projects from "./pages/work/Projects";
import Tasks from "./pages/work/Tasks";

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Today />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/tasks" element={<Tasks />} />
      </Routes>
    </AppShell>
  );
}

export default App;
