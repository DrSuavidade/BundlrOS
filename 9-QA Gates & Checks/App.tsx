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
    <div className="flex flex-col h-full bg-[var(--color-bg-app)] text-[var(--color-text-primary)]">
      {/* Module Sub-Header */}
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
            Quality Assurance Monitor
          </h1>
          <p className="text-xs text-[var(--color-text-tertiary)] font-medium">
            Automated gatekeeper for system deliverables and asset validation.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[10px] text-[var(--color-text-secondary)] font-mono bg-[var(--color-bg-subtle)] px-3 py-1.5 rounded-full border border-[var(--color-border-subtle)]">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          SYSTEM OPERATIONAL
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
      <footer className="py-6 text-center text-[var(--color-text-tertiary)] text-[10px] border-t border-[var(--color-border-subtle)] mt-8">
        <p className="uppercase tracking-widest font-bold">
          QA Nexus System • n8n Integration Active • Gemini Analysis Enabled
        </p>
      </footer>
    </div>
  );
};

export default App;
