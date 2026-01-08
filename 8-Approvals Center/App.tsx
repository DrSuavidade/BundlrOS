import React from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { ApprovalDetail } from "./pages/ApprovalDetail";
import { ClientView } from "./pages/ClientView";

import { AppShell } from "@bundlros/ui";

const App: React.FC = () => {
  return (
    <AppShell moduleName="Approvals Center">
      <Layout>
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="approvals" element={<Dashboard />} />
          <Route path="approval/:id" element={<ApprovalDetail />} />
          <Route path="verify/:token" element={<ClientView />} />
          <Route
            path="settings"
            element={
              <div className="p-8 text-center text-slate-400">
                Settings not implemented in this demo.
              </div>
            }
          />
          <Route path="*" element={<Navigate to="." replace />} />
        </Routes>
      </Layout>
    </AppShell>
  );
};

export default App;
