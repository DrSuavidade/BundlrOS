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
  Box,
  Activity,
} from "lucide-react";
import { analyzeIntakeItem } from "../services/geminiService";

interface IntakeDetailPanelProps {
  item: IntakeItem | null;
  onClose: () => void;
  onUpdate: (updatedItem: IntakeItem) => void;
}

import styles from "./Inbox.module.css";
// ... existing imports ...

export const IntakeDetailPanel: React.FC<IntakeDetailPanelProps> = ({
  item,
  onClose,
  onUpdate,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Note: We don't render null here because we need the panel to stay mounted for animation out
  // But for simple "if not item return null" logic in parent, this is fine if parent handles mounting.
  // The parent implementation conditionally mounts this component.
  if (!item) return null;

  const handleTriage = async () => {
    // ... existing logic ...
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
    // ... existing logic ...
    if (item.aiAnalysis) {
      onUpdate({
        ...item,
        priority: item.aiAnalysis.suggestedPriority,
        tags: [...new Set([...item.tags, item.aiAnalysis.suggestedCategory])],
      });
    }
  };

  const slaDate = new Date(item.slaDueAt);
  const now = new Date();
  const timeDiff = slaDate.getTime() - now.getTime();
  const hoursRemaining = Math.ceil(timeDiff / (1000 * 3600));

  const isSlaBreached = hoursRemaining < 0;
  const isSlaWarning = hoursRemaining > 0 && hoursRemaining < 4;

  return (
    <div className={`${styles.panelContainer} ${styles.open}`}>
      {/* Header */}
      <div className={styles.panelHeader}>
        <div>
          <div className="flex gap-2 mb-2 items-center">
            <h2 className="text-xs font-mono text-[var(--color-text-tertiary)]">
              #{item.id}
            </h2>
            <Badge type="status" value={item.status} />
          </div>
          <h1 className={styles.panelTitle}>{item.title}</h1>
        </div>
        <button onClick={onClose} className={styles.closeButton}>
          <X size={24} />
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
            <User size={16} className="mb-1" />
            Assign Me
          </button>
          <button
            onClick={() => onUpdate({ ...item, status: Status.IN_PROGRESS })}
            className={styles.actionButton}
          >
            <Activity size={16} className="mb-1" />
            Start Work
          </button>
          <button className={styles.actionButton}>
            <LinkIcon size={16} className="mb-1" />
            Link Project
          </button>
          <button
            onClick={() => onUpdate({ ...item, status: Status.CLOSED })}
            className={styles.actionButton}
          >
            <CheckCircle size={16} className="mb-1" />
            Close
          </button>
        </div>

        {/* SLA Monitor */}
        <div
          className={`p-4 rounded border ${
            isSlaBreached
              ? "bg-red-950/30 border-red-900"
              : isSlaWarning
              ? "bg-yellow-950/30 border-yellow-900"
              : "bg-[var(--color-bg-subtle)] border-[var(--color-border-subtle)]"
          }`}
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-2 flex items-center">
            <AlertTriangle size={14} className="mr-2" />
            SLA Monitor
          </h3>
          <div className="flex justify-between items-end mb-2">
            <span
              className={`text-2xl font-mono font-bold ${
                isSlaBreached
                  ? "text-[var(--color-status-danger)]"
                  : "text-[var(--color-text-primary)]"
              }`}
            >
              {isSlaBreached ? "BREACHED" : `${hoursRemaining}h remaining`}
            </span>
            <span className="text-xs text-[var(--color-text-tertiary)]">
              Due: {slaDate.toLocaleDateString()} {slaDate.toLocaleTimeString()}
            </span>
          </div>
          <div className="w-full bg-[var(--color-bg-app)] h-2 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                isSlaBreached
                  ? "bg-[var(--color-status-danger)]"
                  : isSlaWarning
                  ? "bg-[var(--color-status-warning)]"
                  : "bg-[var(--color-status-success)]"
              }`}
              style={{ width: isSlaBreached ? "100%" : "75%" }}
            />
          </div>
        </div>

        {/* Description */}
        <div className={styles.sectionBox}>
          <h3 className={styles.sectionTitle}>Request Details</h3>
          <p className={styles.sectionText}>{item.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <Badge key={tag} type="tag" value={tag} />
            ))}
          </div>
        </div>

        {/* Meta Info */}
        <div className={styles.metaGrid}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Client</span>
            <span className={styles.metaValue}>
              <Briefcase size={14} className="mr-2 text-cyan-500" />
              {item.client}
            </span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Requestor</span>
            <span className={styles.metaValue}>
              <User size={14} className="mr-2 text-purple-500" />
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
              {item.assignee || "Unassigned"}
            </span>
          </div>
        </div>

        {/* AI Triage Section */}
        <div className={styles.aiContainer}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center">
              <Zap
                size={16}
                className="text-[var(--color-accent-primary)] mr-2"
              />
              AI Triage Assistant
            </h3>
            {!item.aiAnalysis && (
              <button
                onClick={handleTriage}
                disabled={isAnalyzing}
                className={styles.aiButton}
              >
                {isAnalyzing ? "Analyzing..." : "Run Analysis"}
              </button>
            )}
          </div>

          {item.aiAnalysis && (
            <div className={styles.aiResultBox}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-xs text-[var(--color-accent-primary)] uppercase block mb-1">
                    Suggested Priority
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge
                      type="priority"
                      value={item.aiAnalysis.suggestedPriority}
                    />
                    {item.aiAnalysis.suggestedPriority !== item.priority && (
                      <button
                        onClick={applyAiSuggestion}
                        className="text-xs text-[var(--color-accent-primary)] hover:text-white underline"
                      >
                        Apply Update
                      </button>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[var(--color-accent-primary)] uppercase block mb-1">
                    Confidence
                  </span>
                  <span className="text-xs font-mono text-[var(--color-text-primary)]">
                    HIGH
                  </span>
                </div>
              </div>

              <div className="mb-3">
                <span className="text-xs text-[var(--color-accent-primary)] uppercase block mb-1">
                  Reasoning
                </span>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {item.aiAnalysis.reasoning}
                </p>
              </div>

              <div>
                <span className="text-xs text-[var(--color-accent-primary)] uppercase block mb-1">
                  Recommended Next Steps
                </span>
                <ul className="list-disc list-inside text-sm text-[var(--color-text-secondary)] space-y-1">
                  {item.aiAnalysis.nextSteps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-4">
                <button className="w-full bg-[var(--color-bg-subtle)] hover:bg-[var(--color-bg-elevated)] border border-[var(--color-accent-primary)] text-[var(--color-accent-primary)] text-xs py-2 rounded flex items-center justify-center transition-all">
                  Generate Response Draft{" "}
                  <ArrowRight size={12} className="ml-2" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
