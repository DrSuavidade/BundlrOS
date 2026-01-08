import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { EventsPage } from "./pages/EventsPage";
import { RunsPage } from "./pages/RunsPage";
import { EventDetailPage } from "./pages/EventDetailPage";

const SettingsPlaceholder = () => (
  <div className="p-12 flex items-center justify-center h-full text-[var(--color-text-secondary)] bg-[var(--color-bg-subtle)] rounded-xl border border-[var(--color-border-subtle)]">
    <div className="text-center">
      <h2 className="text-xl font-semibold mb-2 text-[var(--color-text-primary)]">
        Settings
      </h2>
      <p>Webhook configurations and API keys would go here.</p>
    </div>
  </div>
);

function App() {
  return (
    <div className="h-full">
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="events/:id" element={<EventDetailPage />} />
        <Route path="runs" element={<RunsPage />} />
        <Route path="settings" element={<SettingsPlaceholder />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </div>
  );
}

export default App;
