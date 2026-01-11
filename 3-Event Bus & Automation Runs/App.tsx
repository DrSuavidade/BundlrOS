import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { EventsPage } from "./pages/EventsPage";
import { RunsPage } from "./pages/RunsPage";
import { EventDetailPage } from "./pages/EventDetailPage";

function App() {
  return (
    <div style={{ height: "100%", overflow: "auto" }}>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="events/:id" element={<EventDetailPage />} />
        <Route path="runs" element={<RunsPage />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </div>
  );
}

export default App;
