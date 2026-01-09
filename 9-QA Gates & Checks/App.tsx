import React, { useState, useEffect } from "react";
import { Deliverable } from "./types";
import { initialDeliverables, runMockQA } from "./services/mockData";
import { Dashboard } from "./components/Dashboard";
import { DeliverableDetail } from "./components/DeliverableDetail";
import { Layout, Terminal } from "lucide-react";

import { AppShell } from "@bundlros/ui";

const App: React.FC = () => {
  const [deliverables, setDeliverables] =
    useState<Deliverable[]>(initialDeliverables);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [runningId, setRunningId] = useState<string | null>(null);

  const selectedDeliverable = deliverables.find((d) => d.id === selectedId);

  const handleRerun = async (id: string, type: string) => {
    setRunningId(id);
    // Optimistic update to show running state
    setDeliverables((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, lastResult: { ...d.lastResult, status: "running" } }
          : d
      )
    );

    try {
      const newResult = await runMockQA(id, type);
      setDeliverables((prev) =>
        prev.map((d) => (d.id === id ? { ...d, lastResult: newResult } : d))
      );
    } catch (error) {
      console.error("QA Rerun failed", error);
    } finally {
      setRunningId(null);
    }
  };

  return (
    <div className="page-container">
      {/* Module Sub-Header */}
      <header className="page-header">
        <div className="page-header__content">
          <h1 className="page-header__title">Quality Assurance Monitor</h1>
          <p className="page-header__subtitle">
            Automated gatekeeper for system deliverables and asset validation.
          </p>
        </div>

        <div className="page-header__actions">
          <div className="status-pill status-pill--live">
            <div className="status-pill__dot" />
            SYSTEM OPERATIONAL
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {selectedDeliverable ? (
          <DeliverableDetail
            deliverable={selectedDeliverable}
            onBack={() => setSelectedId(null)}
            onRerun={handleRerun}
            isRunning={runningId === selectedDeliverable.id}
          />
        ) : (
          <Dashboard
            deliverables={deliverables}
            onSelect={(d) => setSelectedId(d.id)}
            isRunningId={runningId}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="page-footer">
        <p className="page-footer__text">
          QA Nexus System • n8n Integration Active • Gemini Analysis Enabled
        </p>
      </footer>
    </div>
  );
};

export default App;
