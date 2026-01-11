import React, { useState, useEffect } from "react";
import { Factory, Status } from "./types";
import {
  createFactory,
  advanceStage,
  updateDeliverableStatus,
  checkBlockers,
} from "./services/pipelineService";
import { PIPELINE_TEMPLATES } from "./constants";
import {
  Box,
  Play,
  AlertOctagon,
  CheckSquare,
  AlertTriangle,
  ArrowRight,
  Terminal,
  FileText,
  Anchor,
  CheckCircle,
  X,
} from "lucide-react";
import { Button, useLanguage } from "@bundlros/ui";
import styles from "./App.module.css";

// --- Factory List Component ---
const FactoryList: React.FC<{
  factories: Factory[];
  selectedFactoryId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  t: (key: string) => string;
}> = ({ factories, selectedFactoryId, onSelect, onCreate, t }) => (
  <div className={styles.sidebar}>
    <div className={styles.sidebarHeader}>
      <h2 className={styles.sidebarTitle}>
        <Box size={14} className="text-[var(--color-accent-primary)]" />
        {t("factories.factories")}
      </h2>
    </div>

    <div className={styles.sidebarContent}>
      {factories.length === 0 && (
        <div className={styles.emptyState}>
          {t("factories.noActiveFactories")}
          <br />
          {t("factories.bootstrapToBegin")}
        </div>
      )}
      {factories.map((factory) => (
        <button
          key={factory.id}
          onClick={() => onSelect(factory.id)}
          className={`${styles.factoryItem} ${
            selectedFactoryId === factory.id ? styles.selected : ""
          }`}
        >
          <div className={styles.factoryItem__header}>
            <span className={styles.factoryItem__id}>
              #{factory.contractId}
            </span>
            {factory.status === Status.BLOCKED && (
              <AlertOctagon size={12} className="text-amber-500" />
            )}
            {factory.status === Status.ACTIVE && (
              <Play size={12} className="text-emerald-500" />
            )}
            {factory.status === Status.COMPLETED && (
              <CheckSquare
                size={12}
                className="text-[var(--color-accent-primary)]"
              />
            )}
          </div>
          <div className={styles.factoryItem__name}>{factory.clientName}</div>
          <div className={styles.factoryItem__status}>{factory.status}</div>
        </button>
      ))}
    </div>

    <div className={styles.sidebarFooter}>
      <button onClick={onCreate} className={styles.bootstrapButton}>
        {t("factories.bootstrap")}
      </button>
    </div>
  </div>
);

// --- Stage Column Component ---
const StageColumn: React.FC<{
  stage: any;
  factory: Factory;
  isActive: boolean;
  isPast: boolean;
  onUpdateDeliverable: (id: string) => void;
  t: (key: string) => string;
}> = ({ stage, factory, isActive, isPast, onUpdateDeliverable, t }) => {
  const isBlocked = isActive && factory.status === Status.BLOCKED;
  const relevantDeliverables = factory.deliverables.filter((d) =>
    stage.requiredDeliverables.includes(d.id)
  );

  const stateClass = isBlocked
    ? "blocked"
    : isActive
    ? "active"
    : isPast
    ? "past"
    : "";

  return (
    <div className={`${styles.stageColumn} ${styles[stateClass] || ""}`}>
      <div className={styles.stageColumn__header}>
        <div className="flex items-center gap-2">
          <div className={styles.stageNumber}>{stage.order + 1}</div>
          <span className={styles.stageName}>{stage.name}</span>
        </div>
        {isBlocked && (
          <AlertTriangle size={14} className="text-amber-500 animate-pulse" />
        )}
        {isPast && <CheckCircle size={14} className="text-emerald-500" />}
      </div>

      <div className={styles.stageColumn__body}>
        {relevantDeliverables.length === 0 && (
          <div className={styles.emptyDeliverables}>
            {t("factories.noDeliverables")}
          </div>
        )}
        {relevantDeliverables.map((d) => (
          <div
            key={d.id}
            className={`${styles.deliverableCard} ${
              styles[d.status.toLowerCase()] || ""
            }`}
          >
            <div className={styles.deliverableCard__header}>
              <span className={styles.deliverableCard__name}>
                {d.type === "DOCUMENT" && <FileText size={12} />}
                {d.type === "COMPONENT" && <Box size={12} />}
                {d.type === "ASSET" && <Anchor size={12} />}
                {d.name}
              </span>
              <span className={styles.deliverableCard__status}>{d.status}</span>
            </div>
            {d.status !== "APPROVED" && (
              <button
                onClick={() => onUpdateDeliverable(d.id)}
                className={styles.deliverableCard__action}
              >
                {d.status === "PENDING" ? "Mark Ready" : "Approve"}
              </button>
            )}
          </div>
        ))}
      </div>

      <div className={styles.stageColumn__footer}>Stage: {stage.id}</div>
    </div>
  );
};

// --- Main App Component ---
const App: React.FC = () => {
  const { t } = useLanguage();
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

    const blockers = checkBlockers(updated);
    if (blockers.length === 0 && updated.status === Status.BLOCKED) {
      updated.status = Status.ACTIVE;
    } else if (blockers.length > 0) {
      updated.status = Status.BLOCKED;
      updated.blockers = blockers;
    }

    setFactories(factories.map((f) => (f.id === updated.id ? updated : f)));
  };

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
  }, [selectedId, factories.length]);

  return (
    <div className={styles.pageContainer}>
      {/* Sidebar */}
      <FactoryList
        factories={factories}
        selectedFactoryId={selectedId}
        onSelect={setSelectedId}
        onCreate={() => setIsBootstrapOpen(true)}
        t={t}
      />

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Header */}
        <header className={styles.header}>
          <div className="flex items-center">
            <h1 className={styles.headerTitle}>
              <Terminal size={14} className="text-emerald-500" />
              Pipeline Manager
            </h1>
            {selectedFactory && (
              <>
                <div className={styles.headerDivider} />
                <div className={styles.headerContext}>
                  <span className={styles.headerContext__label}>Context</span>
                  <span className={styles.headerContext__value}>
                    {selectedFactory.clientName}{" "}
                    <span className="text-[var(--color-text-tertiary)]">
                      #{selectedFactory.contractId}
                    </span>
                  </span>
                </div>
              </>
            )}
          </div>

          <div className={styles.headerActions}>
            {selectedFactory && (
              <>
                {selectedFactory.status === Status.BLOCKED && (
                  <div className={styles.blockedBadge}>
                    <AlertTriangle size={10} />
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
                >
                  {t("factories.advanceStage")}
                  <ArrowRight size={12} className="ml-1.5" />
                </Button>
              </>
            )}
          </div>
        </header>

        {/* Board Area */}
        <main className={styles.boardArea}>
          {!selectedFactory ? (
            <div className={styles.emptyBoard}>
              <div className={styles.emptyBoard__icon}>
                <Terminal size={24} />
              </div>
              <p className={styles.emptyBoard__text}>
                {t("factories.selectOrBootstrap")}
              </p>
            </div>
          ) : (
            <div className={styles.pipelineView}>
              {/* Log Panel */}
              <div className={styles.logPanel}>
                <div className={styles.logPanel__header}>System Logs</div>
                <div className={styles.logPanel__content}>
                  {selectedFactory.logs.map((log) => (
                    <div key={log.id} className={styles.logItem}>
                      <div className={styles.logItem__time}>
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                      <div
                        className={`${styles.logItem__message} ${
                          styles[log.event.toLowerCase()] || ""
                        }`}
                      >
                        [{log.event}] {log.message}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stage Columns */}
              <div className={styles.stagesContainer}>
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
                      t={t}
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
        <div className="modal-overlay">
          <div className="modal w-96">
            <div className="modal__header">
              <h3 className="modal__title">{t("factories.bootstrap")}</h3>
              <button
                onClick={() => setIsBootstrapOpen(false)}
                className="modal__close"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleBootstrap} className="modal__body space-y-5">
              <div>
                <label className="form-label">
                  {t("factories.clientName")}
                </label>
                <input
                  type="text"
                  required
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="form-input"
                  placeholder="ACME Corp"
                />
              </div>
              <br />
              <div>
                <label className="form-label">
                  {t("factories.contractId")}
                </label>
                <input
                  type="text"
                  required
                  value={newContractId}
                  onChange={(e) => setNewContractId(e.target.value)}
                  className="form-input"
                  placeholder="CTR-2023-001"
                />
              </div>
              <br />
              <div>
                <label className="form-label">{t("factories.template")}</label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="form-select w-full"
                >
                  {PIPELINE_TEMPLATES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <br />
              <div className="pt-3">
                <Button type="submit" variant="primary" className="w-full">
                  {t("factories.createFactory")}
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
