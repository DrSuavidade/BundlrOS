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

const App: React.FC = () => {
  return (
    <div className="h-full">
      <Layout>
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="approvals" element={<Dashboard />} />
          <Route path="approval/:id" element={<ApprovalDetail />} />
          <Route path="verify/:token" element={<ClientView />} />
          <Route
            path="settings"
            element={
              <div className="empty-state">
                <div className="empty-state__icon">⚙️</div>
                <p className="empty-state__title">Settings</p>
                <p className="empty-state__description">
                  Not implemented in this demo.
                </p>
              </div>
            }
          />
          <Route path="*" element={<Navigate to="." replace />} />
        </Routes>
      </Layout>
    </div>
  );
};

export default App;
