import React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import { AppShell } from "@bundlros/ui";

const App: React.FC = () => {
  return (
    <AppShell moduleName="Client 360">
      <Routes>
        <Route index element={<Navigate to="clients/c-101" replace />} />
        <Route path="clients/:id" element={<Dashboard />} />
      </Routes>
    </AppShell>
  );
};

export default App;
