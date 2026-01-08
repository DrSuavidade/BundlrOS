import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { Deliverables } from "./pages/Deliverables";
import { Clients } from "./pages/Clients";
import { MockAPI } from "./services/mockBackend";

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-12 bg-[var(--color-bg-subtle)] rounded-xl border border-[var(--color-border-subtle)]">
    <div className="w-16 h-16 bg-[var(--color-bg-elevated)] rounded-full flex items-center justify-center mb-4 text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]">
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        ></path>
      </svg>
    </div>
    <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
      {title}
    </h2>
    <p className="text-[var(--color-text-secondary)] mt-2 max-w-sm">
      This module is part of the Nexus suite but hasn't been implemented in this
      demo view.
    </p>
  </div>
);

const App: React.FC = () => {
  useEffect(() => {
    MockAPI.init();
  }, []);

  return (
    <div className="h-full">
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="clients" element={<Clients />} />
        <Route path="deliverables" element={<Deliverables />} />

        <Route
          path="contracts"
          element={<PlaceholderPage title="Contracts Management" />}
        />
        <Route
          path="projects"
          element={<PlaceholderPage title="Projects & Integrations" />}
        />

        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </div>
  );
};

export default App;
