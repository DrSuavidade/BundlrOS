import React, { useState, useEffect } from "react";
import { Factory, Status, Profile } from "./types";
import {
  createFactory,
  advanceStage,
  updateDeliverableStatus,
  checkBlockers,
  hydrateFactory,
  createFinalDeliverable,
} from "./services/pipelineService";
import { PIPELINE_TEMPLATES } from "./constants";
import TemplateSelector from "./components/TemplateSelector";
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
import { FactoryService } from "./services/supabaseService";
import styles from "./App.module.css";

// --- Factory List Component ---
const FactoryList: React.FC<{
  factories: Factory[];
  profiles: Profile[];
  selectedFactoryId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  t: (key: string) => string;
}> = ({ factories, profiles, selectedFactoryId, onSelect, onCreate, t }) => (
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
          className={`${styles.factoryItem} ${
            selectedFactoryId === factory.id ? styles.selected : ""
          }`}
          onClick={() => onSelect(factory.id)}
          style={{ position: "relative" }}
        >
          <div className={styles.factoryItem__header}>
            <span className={styles.factoryItem__id}>
              #{factory.id.slice(0, 8)}
            </span>
            {factory.status === Status.ACTIVE && (
              <Play size={12} className="text-emerald-500" />
            )}
            {factory.status === Status.COMPLETED && (
              <CheckSquare
                size={12}
                className="text-[var(--color-accent-primary)]"
              />
            )}
            {factory.assigneeId && (
              <div
                style={{
                  position: "absolute",
                  bottom: "8px",
                  right: "8px",
                  width: 16,
                  height: 16,
                }}
              >
                {(() => {
                  const assignee = profiles.find(
                    (p) => p.id === factory.assigneeId
                  );
                  return assignee ? (
                    <img
                      src={
                        assignee.avatar_url ||
                        `https://ui-avatars.com/api/?name=${assignee.name}`
                      }
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                      }}
                    />
                  ) : null;
                })()}
              </div>
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
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Modal State
  const [isBootstrapOpen, setIsBootstrapOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newContractId, setNewContractId] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    PIPELINE_TEMPLATES[0].id
  );
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const selectedFactory = factories.find((f) => f.id === selectedId);
  const currentTemplate = selectedFactory
    ? PIPELINE_TEMPLATES.find((t) => t.id === selectedFactory.templateId)
    : null;

  // Load factories and profiles on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [factoriesData, profilesData] = await Promise.all([
          FactoryService.getAll(),
          FactoryService.getProfiles(),
        ]);
        setFactories(factoriesData);
        setProfiles(profilesData);
      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Check for null template
  useEffect(() => {
    if (selectedFactory?.templateId === "null") {
      setIsTemplateModalOpen(true);
    } else {
      setIsTemplateModalOpen(false);
    }
  }, [selectedFactory]);

  const handleBootstrap = async (e: React.FormEvent) => {
    e.preventDefault();
    // Create local object using logic
    const newFactoryTemplate = createFactory(
      newContractId,
      newClientName,
      selectedTemplateId
    );

    // Save to DB
    const created = await FactoryService.create(newFactoryTemplate);
    if (created) {
      setFactories([created, ...factories]);
      setSelectedId(created.id);
      setIsBootstrapOpen(false);
      setNewClientName("");
      setNewContractId("");
    }
  };

  const handleAssign = async (profileId: string) => {
    if (!selectedFactory) return;
    const updated = { ...selectedFactory, assigneeId: profileId };
    const saved = await FactoryService.update(updated);
    if (saved) {
      setFactories(factories.map((f) => (f.id === saved.id ? saved : f)));
    }
  };

  const handleTemplateSelection = async (templateId: string) => {
    if (!selectedFactory) return;

    setIsLoading(true);
    try {
      const hydratedFactory = hydrateFactory(selectedFactory, templateId);
      const saved = await FactoryService.update(hydratedFactory);

      if (saved) {
        setFactories((prev) =>
          prev.map((f) => (f.id === saved.id ? saved : f))
        );
      }
    } catch (err) {
      console.error("Failed to update factory template", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdvance = async () => {
    if (!selectedFactory || !currentTemplate) return;

    const currentStageIndex = currentTemplate.stages.findIndex(
      (s) => s.id === selectedFactory.currentStageId
    );
    const isLastStage = currentStageIndex === currentTemplate.stages.length - 1;

    let updated: Factory;

    if (isLastStage) {
      setIsLoading(true);
      updated = await createFinalDeliverable(selectedFactory);
      setIsLoading(false);
    } else {
      updated = advanceStage(selectedFactory);
    }

    const saved = await FactoryService.update(updated);
    if (saved) {
      setFactories(factories.map((f) => (f.id === saved.id ? saved : f)));
    }
  };

  const handleDeliverableUpdate = async (deliverableId: string) => {
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

    const saved = await FactoryService.update(updated);
    if (saved) {
      setFactories(factories.map((f) => (f.id === saved.id ? saved : f)));
    }
  };

  // Poll for updates or external blockers every 10s
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!selectedId) return;
      const current = factories.find((f) => f.id === selectedId);
      if (current && current.status === Status.ACTIVE) {
        // Re-run blocker check to simulate external events
        const blockers = checkBlockers(current);
        if (
          blockers.length > 0 &&
          JSON.stringify(blockers) !== JSON.stringify(current.blockers)
        ) {
          console.log("New blockers detected:", blockers);
          const updated = {
            ...current,
            status: Status.BLOCKED,
            blockers,
          };
          const saved = await FactoryService.update(updated);
          if (saved) {
            setFactories((prev) =>
              prev.map((f) => (f.id === saved.id ? saved : f))
            );
          }
        }
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [selectedId, factories]);

  return (
    <div className={styles.pageContainer}>
      {/* Sidebar */}
      <FactoryList
        factories={factories}
        profiles={profiles}
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
                  {currentTemplate && (
                    <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider font-semibold mt-0.5 leading-tight opacity-75">
                      {currentTemplate.name}
                    </span>
                  )}
                </div>
                <div className={styles.headerDivider} />
                <div className={styles.headerContext}>
                  <span className={styles.headerContext__label}>Assignee</span>
                  <div
                    style={{ display: "flex", gap: "8px", marginTop: "4px" }}
                  >
                    {profiles.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleAssign(p.id)}
                        title={p.name}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          border:
                            selectedFactory.assigneeId === p.id
                              ? "2px solid var(--color-accent-primary)"
                              : "2px solid transparent",
                          opacity:
                            selectedFactory.assigneeId === p.id ? 1 : 0.5,
                          padding: 0,
                          overflow: "hidden",
                          cursor: "pointer",
                        }}
                      >
                        <img
                          src={
                            p.avatar_url ||
                            `https://ui-avatars.com/api/?name=${p.name}`
                          }
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </button>
                    ))}
                  </div>
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
                    selectedFactory.status === Status.COMPLETED ||
                    selectedFactory.status === Status.DELIVERED
                  }
                >
                  {currentTemplate &&
                  currentTemplate.stages.findIndex(
                    (s) => s.id === selectedFactory.currentStageId
                  ) ===
                    currentTemplate.stages.length - 1
                    ? "Create Deliverable"
                    : t("factories.advanceStage")}
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
              {selectedFactory.status === Status.DELIVERED ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <CheckSquare size={32} className="text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                      Work Delivered
                    </h3>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      Waiting for approval.
                    </p>
                  </div>
                </div>
              ) : (
                <>
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
                  <div
                    className={styles.stagesContainer}
                    onWheel={(e) => {
                      e.currentTarget.scrollLeft += e.deltaY;
                    }}
                  >
                    {currentTemplate?.stages.map((stage, index) => {
                      const currentStageIndex =
                        currentTemplate.stages.findIndex(
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
                </>
              )}
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

      {/* Template Selection Modal */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950">
          <TemplateSelector onSelect={handleTemplateSelection} />
        </div>
      )}
    </div>
  );
};

export default App;
