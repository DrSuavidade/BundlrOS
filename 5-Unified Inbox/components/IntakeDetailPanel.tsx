import React, { useState } from "react";
import { IntakeItem, Priority, Status, AIAnalysisResult } from "../types";
import { Badge } from "./Badge";
import {
  X,
  CheckCircle,
  AlertTriangle,
  User,
  Briefcase,
  Zap,
  ArrowRight,
  Link as LinkIcon,
  Activity,
  Sparkles,
} from "lucide-react";
import { analyzeIntakeItem } from "../services/geminiService";
import styles from "./Inbox.module.css";

interface IntakeDetailPanelProps {
  item: IntakeItem | null;
  onClose: () => void;
  onUpdate: (updatedItem: IntakeItem) => void;
}

export const IntakeDetailPanel: React.FC<IntakeDetailPanelProps> = ({
  item,
  onClose,
  onUpdate,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleTriage = async () => {
    if (!item) return;
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeIntakeItem(item);
      onUpdate({
        ...item,
        aiAnalysis: analysis,
        status: item.status === Status.NEW ? Status.TRIAGING : item.status,
      });
    } catch (e) {
      console.error("Analysis failed", e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyAiSuggestion = () => {
    if (item?.aiAnalysis) {
      onUpdate({
        ...item,
        priority: item.aiAnalysis.suggestedPriority,
        tags: [...new Set([...item.tags, item.aiAnalysis.suggestedCategory])],
      });
    }
  };

  // Calculate SLA values only if item exists
  const slaDate = item ? new Date(item.slaDueAt) : new Date();
  const now = new Date();
  const timeDiff = slaDate.getTime() - now.getTime();
  const hoursRemaining = Math.ceil(timeDiff / (1000 * 3600));

  const isSlaBreached = hoursRemaining < 0;
  const isSlaWarning = hoursRemaining > 0 && hoursRemaining < 4;

  // Calculate SLA progress (0-100)
  const maxHours = 48;
  const progressPercent = isSlaBreached
    ? 100
    : Math.max(
        0,
        Math.min(100, ((maxHours - hoursRemaining) / maxHours) * 100)
      );

  return (
    <div className={`${styles.panelContainer} ${item ? styles.open : ""}`}>
      {item && (
        <>
          {/* Header */}
          <div className={styles.panelHeader}>
            <div>
              <div className="flex gap-1.5 mb-1 items-center">
                <span className="text-[10px] font-mono text-[var(--color-text-tertiary)] bg-[var(--color-bg-subtle)] px-1.5 py-0.5 rounded">
                  {item.id}
                </span>
                <Badge type="status" value={item.status} />
              </div>
              <h1 className={styles.panelTitle}>{item.title}</h1>
            </div>
            <button onClick={onClose} className={styles.closeButton}>
              <X size={18} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className={styles.panelContent}>
            {/* Actions Bar */}
            <div className={styles.actionGrid}>
              <button
                onClick={() => onUpdate({ ...item, assignee: "Current User" })}
                className={styles.actionButton}
              >
                <User size={16} />
                Assign Me
              </button>
              <button
                onClick={() =>
                  onUpdate({ ...item, status: Status.IN_PROGRESS })
                }
                className={styles.actionButton}
              >
                <Activity size={16} />
                Start Work
              </button>
              <button className={styles.actionButton}>
                <LinkIcon size={16} />
                Link Project
              </button>
              <button
                onClick={() => onUpdate({ ...item, status: Status.CLOSED })}
                className={styles.actionButton}
              >
                <CheckCircle size={16} />
                Close
              </button>
            </div>

            {/* SLA Monitor Card */}
            <div
              className={`${styles.slaCard} ${
                isSlaBreached
                  ? styles.breached
                  : isSlaWarning
                  ? styles.warning
                  : ""
              }`}
            >
              <div className={styles.slaCard__header}>
                <AlertTriangle
                  size={14}
                  className={
                    isSlaBreached
                      ? "text-[var(--color-status-danger)]"
                      : "text-[var(--color-text-tertiary)]"
                  }
                />
                <span className={styles.slaCard__title}>SLA Monitor</span>
              </div>
              <div className={styles.slaCard__body}>
                <span
                  className={`${styles.slaCard__value} ${
                    isSlaBreached ? styles.breached : ""
                  }`}
                >
                  {isSlaBreached ? "BREACHED" : `${hoursRemaining}h`}
                </span>
                <span className={styles.slaCard__due}>
                  Due: {slaDate.toLocaleDateString()}{" "}
                  {slaDate.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className={styles.slaCard__progress}>
                <div
                  className={styles.slaCard__progressBar}
                  style={{
                    width: `${progressPercent}%`,
                    backgroundColor: isSlaBreached
                      ? "var(--color-status-danger)"
                      : isSlaWarning
                      ? "var(--color-status-warning)"
                      : "var(--color-status-success)",
                  }}
                />
              </div>
            </div>

            {/* Request Details */}
            <div className={styles.sectionBox}>
              <h3 className={styles.sectionTitle}>Request Details</h3>
              <p className={styles.sectionText}>{item.description}</p>
              {item.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <Badge key={tag} type="tag" value={tag} />
                  ))}
                </div>
              )}
            </div>

            {/* Meta Info Grid */}
            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Client</span>
                <span className={styles.metaValue}>
                  <Briefcase size={12} className="mr-1.5 text-cyan-400" />
                  {item.client}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Requestor</span>
                <span className={styles.metaValue}>
                  <User size={12} className="mr-1.5 text-purple-400" />
                  {item.requestor}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Priority</span>
                <Badge type="priority" value={item.priority} />
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Assignee</span>
                <span className={styles.metaValue}>
                  {item.assignee ? (
                    <>
                      <User size={12} className="mr-1.5 text-green-400" />
                      {item.assignee}
                    </>
                  ) : (
                    <span className="text-[var(--color-text-tertiary)] italic text-xs">
                      Unassigned
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* AI Triage Section */}
            <div className={styles.aiContainer}>
              <div className={styles.aiContainer__header}>
                <h3 className={styles.aiContainer__title}>
                  <Sparkles size={14} />
                  AI Triage Assistant
                </h3>
                {!item.aiAnalysis && (
                  <button
                    onClick={handleTriage}
                    disabled={isAnalyzing}
                    className={styles.aiButton}
                  >
                    <Zap size={12} />
                    {isAnalyzing ? "Analyzing..." : "Run Analysis"}
                  </button>
                )}
              </div>

              {item.aiAnalysis && (
                <div className={styles.aiResultBox}>
                  <div className="flex justify-between items-start mb-3">
                    <div className={styles.aiResultBox__section}>
                      <span className={styles.aiResultBox__label}>
                        Suggested Priority
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge
                          type="priority"
                          value={item.aiAnalysis.suggestedPriority}
                        />
                        {item.aiAnalysis.suggestedPriority !==
                          item.priority && (
                          <button
                            onClick={applyAiSuggestion}
                            className="text-xs text-[var(--color-accent-primary)] hover:text-white underline"
                          >
                            Apply
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={styles.aiResultBox__label}>
                        Confidence
                      </span>
                      <span className="text-xs font-mono text-emerald-400 font-semibold">
                        HIGH
                      </span>
                    </div>
                  </div>

                  <div className={styles.aiResultBox__section}>
                    <span className={styles.aiResultBox__label}>Reasoning</span>
                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                      {item.aiAnalysis.reasoning}
                    </p>
                  </div>

                  <div className={styles.aiResultBox__section}>
                    <span className={styles.aiResultBox__label}>
                      Next Steps
                    </span>
                    <ul className="text-xs text-[var(--color-text-secondary)] space-y-1 mt-1">
                      {item.aiAnalysis.nextSteps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-[var(--color-accent-primary)] text-white text-[9px] flex items-center justify-center flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button className={styles.generateButton}>
                    <Sparkles size={12} />
                    Generate Response Draft
                    <ArrowRight size={10} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
