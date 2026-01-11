import React, { useState } from "react";
import { Deliverable, QAStatus } from "./types";
import { initialDeliverables, runMockQA } from "./services/mockData";
import { DeliverableDetail } from "./components/DeliverableDetail";
import {
  ShieldCheck,
  AlertOctagon,
  Layers,
  Clock,
  ChevronRight,
  Shield,
} from "lucide-react";
import styles from "./App.module.css";

// Dashboard Component (inline for CSS module usage)
const Dashboard: React.FC<{
  deliverables: Deliverable[];
  onSelect: (deliverable: Deliverable) => void;
  isRunningId: string | null;
}> = ({ deliverables, onSelect, isRunningId }) => {
  const passedCount = deliverables.filter(
    (d) => d.lastResult.status === "passed"
  ).length;
  const failedCount = deliverables.filter(
    (d) => d.lastResult.status === "failed"
  ).length;

  const getStatusClass = (status: QAStatus) => {
    switch (status) {
      case "passed":
        return styles.passed;
      case "failed":
        return styles.failed;
      case "running":
        return styles.running;
      default:
        return "";
    }
  };

  return (
    <>
      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.success}`}>
          <div className={`${styles.statCard__icon} ${styles.success}`}>
            <ShieldCheck size={20} />
          </div>
          <div className={styles.statCard__content}>
            <div className={styles.statCard__value}>{passedCount}</div>
            <div className={styles.statCard__label}>Passed</div>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.danger}`}>
          <div className={`${styles.statCard__icon} ${styles.danger}`}>
            <AlertOctagon size={20} />
          </div>
          <div className={styles.statCard__content}>
            <div className={styles.statCard__value}>{failedCount}</div>
            <div className={styles.statCard__label}>Failed Gates</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statCard__icon} ${styles.accent}`}>
            <Layers size={20} />
          </div>
          <div className={styles.statCard__content}>
            <div className={styles.statCard__value}>{deliverables.length}</div>
            <div className={styles.statCard__label}>Active Assets</div>
          </div>
        </div>
      </div>

      {/* Deliverables List */}
      <div className={styles.deliverablesList}>
        <div className={styles.listHeader}>
          <span className={styles.listTitle}>Active Deliverables</span>
          <span className={styles.listMeta}>n8n:gatekeeper_active</span>
        </div>

        <div>
          {deliverables.map((item) => {
            const currentStatus =
              isRunningId === item.id ? "running" : item.lastResult.status;
            const issueCount = item.lastResult.checklist.filter(
              (c) => c.status === "failed"
            ).length;

            return (
              <div
                key={item.id}
                onClick={() => onSelect(item)}
                className={styles.deliverableItem}
              >
                <div className={styles.deliverableItem__main}>
                  <div
                    className={`${styles.statusIndicator} ${getStatusClass(
                      currentStatus
                    )}`}
                  />
                  <div className={styles.deliverableItem__content}>
                    <h3 className={styles.deliverableItem__name}>
                      {item.name}
                    </h3>
                    <div className={styles.deliverableItem__meta}>
                      <span className={styles.typeBadge}>{item.type}</span>
                      <span className={styles.timestamp}>
                        <Clock size={10} />
                        {new Date(
                          item.lastResult.timestamp
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.deliverableItem__result}>
                  <div className={styles.resultStatus}>
                    <div
                      className={`${
                        styles.resultStatus__label
                      } ${getStatusClass(currentStatus)}`}
                    >
                      {currentStatus === "running"
                        ? "Running..."
                        : currentStatus.toUpperCase()}
                    </div>
                    {currentStatus === "failed" && issueCount > 0 && (
                      <div className={styles.resultStatus__issues}>
                        {issueCount} issues found
                      </div>
                    )}
                  </div>
                  <ChevronRight size={16} className={styles.arrowIcon} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

// Main App
const App: React.FC = () => {
  const [deliverables, setDeliverables] =
    useState<Deliverable[]>(initialDeliverables);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [runningId, setRunningId] = useState<string | null>(null);

  const selectedDeliverable = deliverables.find((d) => d.id === selectedId);

  const handleRerun = async (id: string, type: string) => {
    setRunningId(id);
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
    <div className={styles.pageContainer}>
      {/* Main Content */}
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
    </div>
  );
};

export default App;
