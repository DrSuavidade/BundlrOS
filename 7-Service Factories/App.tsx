import React, { useState, useEffect } from "react";
import { Factory, Status } from "./types";
import {
  createFactory,
  advanceStage,
  updateDeliverableStatus,
  checkBlockers,
} from "./services/pipelineService";
import { PIPELINE_TEMPLATES } from "./constants";
import FactoryList from "./components/FactoryList";
import StageColumn from "./components/StageColumn";
import {
  Settings,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  Terminal,
} from "lucide-react";

import { AppShell, Button } from "@bundlros/ui";

const App: React.FC = () => {
  const [factories, setFactories] = useState<Factory[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Modal State
  const [isBootstrapOpen, setIsBootstrapOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newContractId, setNewContractId] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    PIPELINE_TEMPLATES[0].id
  );

  const selectedFactory = factories.find((f) => f.id === selectedId);
  const currentTemplate = selectedFactory
    ? PIPELINE_TEMPLATES.find((t) => t.id === selectedFactory.templateId)
    : null;

  // Handlers
  const handleBootstrap = (e: React.FormEvent) => {
    e.preventDefault();
    const newFactory = createFactory(
      newContractId,
      newClientName,
      selectedTemplateId
    );
    setFactories([...factories, newFactory]);
    setSelectedId(newFactory.id);
    setIsBootstrapOpen(false);
    setNewClientName("");
    setNewContractId("");
  };

  const handleAdvance = () => {
    if (!selectedFactory) return;
    const updated = advanceStage(selectedFactory);
    setFactories(factories.map((f) => (f.id === updated.id ? updated : f)));
  };

  const handleDeliverableUpdate = (deliverableId: string) => {
    if (!selectedFactory) return;

    // Cycle status: PENDING -> READY -> APPROVED
    const deliverable = selectedFactory.deliverables.find(
      (d) => d.id === deliverableId
    );
    if (!deliverable) return;

    let nextStatus: "PENDING" | "READY" | "APPROVED" = "PENDING";
    if (deliverable.status === "PENDING") nextStatus = "READY";
    else if (deliverable.status === "READY") nextStatus = "APPROVED";

    const updated = updateDeliverableStatus(
      selectedFactory,
      deliverableId,
      nextStatus
    );

    // Also re-check blockers immediately for UI feedback
    const blockers = checkBlockers(updated);
    if (blockers.length === 0 && updated.status === Status.BLOCKED) {
      updated.status = Status.ACTIVE; // Unblock if clear
    } else if (blockers.length > 0) {
      updated.status = Status.BLOCKED;
      updated.blockers = blockers;
    }

    setFactories(factories.map((f) => (f.id === updated.id ? updated : f)));
  };

  // Re-check blockers logic on mount or change (simplified simulation)
  useEffect(() => {
    if (selectedFactory && selectedFactory.status === Status.ACTIVE) {
      const blockers = checkBlockers(selectedFactory);
      if (blockers.length > 0) {
        const updated = {
          ...selectedFactory,
          status: Status.BLOCKED,
          blockers,
        };
        setFactories((prev) =>
          prev.map((f) => (f.id === updated.id ? updated : f))
        );
      }
    }
  }, [selectedId, factories.length]); // Dependencies simplified for demo

  return (
    <div className="flex h-full text-[var(--color-text-primary)] font-sans border border-[var(--color-border-subtle)] rounded-lg overflow-hidden bg-[var(--color-bg-card)]">
      {/* Sidebar */}
      <FactoryList
        factories={factories}
        selectedFactoryId={selectedId}
        onSelect={setSelectedId}
        onCreate={() => setIsBootstrapOpen(true)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[var(--color-bg-app)]/50">
        {/* Header */}
        <header className="h-14 border-b border-[var(--color-border-subtle)] flex justify-between items-center px-6 bg-[var(--color-bg-card)]">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-bold tracking-tight text-[var(--color-text-primary)] uppercase flex items-center gap-2">
              <Terminal className="text-emerald-500" size={16} />
              Pipeline Manager
            </h1>
            {selectedFactory && (
              <>
                <div className="h-4 w-px bg-[var(--color-border-subtle)] mx-2"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-[var(--color-text-tertiary)] font-mono uppercase">
                    Context
                  </span>
                  <span className="text-xs font-semibold">
                    {selectedFactory.clientName}{" "}
                    <span className="text-[var(--color-text-tertiary)]">
                      #{selectedFactory.contractId}
                    </span>
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-4">
            {selectedFactory && (
              <div className="flex items-center gap-3">
                {selectedFactory.status === Status.BLOCKED && (
                  <div className="px-2 py-0.5 bg-amber-900/10 border border-amber-700/50 rounded flex items-center gap-2 text-amber-500 text-[10px] font-bold uppercase animate-pulse">
                    <AlertTriangle size={12} />
                    Blocked
                  </div>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAdvance}
                  disabled={
                    selectedFactory.status === Status.BLOCKED ||
                    selectedFactory.status === Status.COMPLETED
                  }
                  className="!text-[10px] !h-8"
                >
                  Advance Stage
                  <ArrowRight size={14} className="ml-2" />
                </Button>
              </div>
            )}
          </div>
        </header>

        {/* Board Area */}
        <main className="flex-1 overflow-x-auto overflow-y-hidden bg-[var(--color-bg-app)]/30 relative">
          {!selectedFactory ? (
            <div className="absolute inset-0 flex items-center justify-center text-[var(--color-text-tertiary)] flex-col gap-4">
              <div className="w-16 h-16 border-2 border-dashed border-[var(--color-border-subtle)] rounded-full flex items-center justify-center">
                <Terminal size={32} />
              </div>
              <p className="uppercase tracking-widest text-[10px]">
                Select a factory to view pipeline
              </p>
            </div>
          ) : (
            <div className="h-full flex px-4 py-4 gap-0">
              {/* Log Panel (Left) */}
              <div className="w-56 border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] rounded-lg mr-4 flex flex-col">
                <div className="p-2 border-b border-[var(--color-border-subtle)] text-[10px] font-bold uppercase text-[var(--color-text-tertiary)] tracking-wider">
                  System Logs
                </div>
                <div className="flex-1 overflow-y-auto p-2 font-mono text-[9px] space-y-1.5">
                  {selectedFactory.logs.map((log) => (
                    <div
                      key={log.id}
                      className="border-l border-[var(--color-border-subtle)] pl-2 py-0.5"
                    >
                      <div className="text-[var(--color-text-tertiary)]">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                      <div
                        className={`
                                ${log.event === "BLOCK" ? "text-amber-500" : ""}
                                ${
                                  log.event === "ADVANCE"
                                    ? "text-emerald-500"
                                    : ""
                                }
                                ${
                                  log.event === "BOOTSTRAP"
                                    ? "text-blue-500"
                                    : ""
                                }
                                ${
                                  log.event === "UPDATE"
                                    ? "text-[var(--color-text-secondary)]"
                                    : ""
                                }
                            `}
                      >
                        [{log.event}] {log.message}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Kanban Stages */}
              <div className="flex h-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)]/50 rounded-lg overflow-hidden">
                {currentTemplate?.stages.map((stage, index) => {
                  const currentStageIndex = currentTemplate.stages.findIndex(
                    (s) => s.id === selectedFactory.currentStageId
                  );
                  const isPast = index < currentStageIndex;
                  const isActive = index === currentStageIndex;

                  return (
                    <StageColumn
                      key={stage.id}
                      stage={stage}
                      factory={selectedFactory}
                      isActive={isActive}
                      isPast={isPast}
                      onUpdateDeliverable={handleDeliverableUpdate}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Bootstrap Modal */}
      {isBootstrapOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] shadow-2xl w-80 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] flex justify-between items-center">
              <h3 className="text-[var(--color-text-primary)] font-bold uppercase tracking-wider text-xs">
                Bootstrap Factory
              </h3>
              <button
                onClick={() => setIsBootstrapOpen(false)}
                className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleBootstrap} className="p-4 space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-[var(--color-text-tertiary)] mb-1 uppercase">
                  Client Name
                </label>
                <input
                  type="text"
                  required
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full bg-[var(--color-bg-app)] border border-[var(--color-border-subtle)] p-2 text-[var(--color-text-primary)] focus:border-[var(--color-accent-primary)] focus:outline-none text-xs rounded-md"
                  placeholder="ACME Corp"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-[var(--color-text-tertiary)] mb-1 uppercase">
                  Contract ID
                </label>
                <input
                  type="text"
                  required
                  value={newContractId}
                  onChange={(e) => setNewContractId(e.target.value)}
                  className="w-full bg-[var(--color-bg-app)] border border-[var(--color-border-subtle)] p-2 text-[var(--color-text-primary)] focus:border-[var(--color-accent-primary)] focus:outline-none text-xs rounded-md"
                  placeholder="CTR-2023-001"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-[var(--color-text-tertiary)] mb-1 uppercase">
                  Pipeline Template
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full bg-[var(--color-bg-app)] border border-[var(--color-border-subtle)] p-2 text-[var(--color-text-primary)] focus:border-[var(--color-accent-primary)] focus:outline-none text-xs rounded-md"
                >
                  {PIPELINE_TEMPLATES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full !text-xs !h-10"
                >
                  Initialize
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
