import React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";

const App: React.FC = () => {
  return (
    <div className="h-full">
      <Routes>
        <Route index element={<Navigate to="clients/c-101" replace />} />
        <Route path="clients/:id" element={<Dashboard />} />
      </Routes>
    </div>
  );
};

export default App;
