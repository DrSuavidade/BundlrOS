import React, { useState } from "react";
import { createPortal } from "react-dom";
import { IntakeItem, Priority, Status, AIAnalysisResult } from "../types";
import { Badge } from "./Badge";
import { InboxService } from "../services";
import { useAuth, useLanguage } from "@bundlros/ui";
import {
  X,
  CheckCircle,
  AlertTriangle,
  User,
  Briefcase,
  Zap,
  ArrowRight,
  CheckSquare,
  Activity,
  Sparkles,
  Trash2,
} from "lucide-react";
import { analyzeIntakeItem } from "../services/geminiService";
import styles from "./Inbox.module.css";

interface IntakeDetailPanelProps {
  item: IntakeItem | null;
  onClose: () => void;
  onUpdate: (updatedItem: IntakeItem) => void;
  onDelete?: (id: string) => void;
}

export const IntakeDetailPanel: React.FC<IntakeDetailPanelProps> = ({
  item,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAssignConfirm, setShowAssignConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Handle Assign Me button
  const handleAssignMe = async () => {
    if (!item || !user) return;

    // If already assigned to someone else, show confirmation
    if (item.assigneeId && item.assigneeId !== user.id) {
      setShowAssignConfirm(true);
      return;
    }

    await performAssignment();
  };

  const performAssignment = async () => {
    if (!item || !user) return;
    try {
      await InboxService.update(item.id, { assignee: user.id });
      onUpdate({
        ...item,
        assignee: user.name || user.id,
        assigneeId: user.id,
        assigneeAvatarUrl: user.avatarUrl,
      });
      setShowAssignConfirm(false);
    } catch (error) {
      console.error("[Inbox] Failed to assign:", error);
    }
  };

  // Handle Start Work button
  const handleStartWork = async () => {
    if (!item || item.status !== Status.NEW) return;
    try {
      const updated = await InboxService.update(item.id, {
        status: Status.IN_PROGRESS,
      });
      onUpdate({ ...item, status: Status.IN_PROGRESS });
    } catch (error) {
      console.error("[Inbox] Failed to start work:", error);
    }
  };

  // Handle Mark Resolved button
  const handleMarkResolved = async () => {
    if (!item || item.status !== Status.IN_PROGRESS) return;
    try {
      const updated = await InboxService.update(item.id, {
        status: Status.RESOLVED,
      });
      onUpdate({ ...item, status: Status.RESOLVED });
    } catch (error) {
      console.error("[Inbox] Failed to mark resolved:", error);
    }
  };

  // Handle Close/Delete button
  const handleDelete = async () => {
    if (!item) return;
    setIsDeleting(true);
    try {
      await InboxService.delete(item.id);
      setShowDeleteConfirm(false);
      onDelete?.(item.id);
      onClose();
    } catch (error) {
      console.error("[Inbox] Failed to delete:", error);
    } finally {
      setIsDeleting(false);
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

  // Check if Start Work should be disabled
  // Can only start work if: status is NEW and current user is the assignee
  const isStartWorkDisabled =
    !user || item?.status !== Status.NEW || item?.assigneeId !== user.id;

  // Check if Assign Me should be disabled (if already assigned to self)
  const isAssignMeDisabled = !user || item?.assigneeId === user.id;

  // Check if Mark Resolved should be disabled
  // Enabled only if: status is IN_PROGRESS and current user is the assignee
  const isMarkResolvedDisabled =
    !user ||
    item?.status !== Status.IN_PROGRESS ||
    item?.assigneeId !== user.id;

  return (
    <>
      <div className={`${styles.panelContainer} ${item ? styles.open : ""}`}>
        {item && (
          <>
            {/* Header */}
            <div className={styles.panelHeader}>
              <div>
                <div className="flex gap-1.5 mb-1 items-center">
                  <span
                    className="text-[10px] font-mono text-[var(--color-text-tertiary)] bg-[var(--color-bg-subtle)] px-1.5 py-0.5 rounded"
                    title={item.id}
                  >
                    #{item.id.slice(-6)}
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
                  onClick={handleAssignMe}
                  disabled={isAssignMeDisabled}
                  className={`${styles.actionButton} ${
                    isAssignMeDisabled ? styles.disabled : ""
                  }`}
                  style={
                    isAssignMeDisabled
                      ? { opacity: 0.5, cursor: "not-allowed" }
                      : {}
                  }
                >
                  <User size={16} />
                  {t("inbox.panel.assignMe")}
                </button>
                <button
                  onClick={handleStartWork}
                  disabled={isStartWorkDisabled}
                  className={`${styles.actionButton} ${
                    isStartWorkDisabled ? styles.disabled : ""
                  }`}
                  style={
                    isStartWorkDisabled
                      ? { opacity: 0.5, cursor: "not-allowed" }
                      : {}
                  }
                >
                  <Activity size={16} />
                  {t("inbox.panel.startWork")}
                </button>
                <button
                  onClick={handleMarkResolved}
                  disabled={isMarkResolvedDisabled}
                  className={`${styles.actionButton} ${
                    isMarkResolvedDisabled ? styles.disabled : ""
                  }`}
                  style={
                    isMarkResolvedDisabled
                      ? { opacity: 0.5, cursor: "not-allowed" }
                      : {}
                  }
                >
                  <CheckSquare size={16} />
                  {t("inbox.panel.markResolved")}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className={styles.actionButton}
                  style={{ color: "rgb(244, 63, 94)" }}
                >
                  <Trash2 size={16} />
                  {t("inbox.panel.delete")}
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
                  <span className={styles.slaCard__title}>
                    {t("inbox.panel.slaMonitor")}
                  </span>
                </div>
                <div className={styles.slaCard__body}>
                  <span
                    className={`${styles.slaCard__value} ${
                      isSlaBreached ? styles.breached : ""
                    }`}
                  >
                    {isSlaBreached
                      ? t("inbox.panel.breached")
                      : `${hoursRemaining}h`}
                  </span>
                  <span className={styles.slaCard__due}>
                    {t("inbox.panel.due")} {slaDate.toLocaleDateString()}{" "}
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
                <h3 className={styles.sectionTitle}>
                  {t("inbox.panel.requestDetails")}
                </h3>
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
                  <span className={styles.metaLabel}>
                    {t("inbox.form.client")}
                  </span>
                  <span className={styles.metaValue}>
                    <Briefcase size={12} className="mr-1.5 text-cyan-400" />
                    {item.client}
                  </span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>
                    {t("inbox.form.requestor")}
                  </span>
                  <span className={styles.metaValue}>
                    <User size={12} className="mr-1.5 text-purple-400" />
                    {item.requestor}
                  </span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>
                    {t("inbox.form.priority")}
                  </span>
                  <Badge type="priority" value={item.priority} />
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>
                    {t("inbox.panel.assignee")}
                  </span>
                  <span className={styles.metaValue}>
                    {item.assignee ? (
                      <>
                        <User size={12} className="mr-1.5 text-green-400" />
                        {item.assignee}
                      </>
                    ) : (
                      <span className="text-[var(--color-text-tertiary)] italic text-xs">
                        {t("inbox.panel.unassigned")}
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
                    {t("inbox.panel.aiTriage.title")}
                  </h3>
                  {!item.aiAnalysis && (
                    <button
                      onClick={handleTriage}
                      disabled={isAnalyzing}
                      className={styles.aiButton}
                    >
                      <Zap size={12} />
                      {isAnalyzing
                        ? t("inbox.panel.aiTriage.analyzing")
                        : t("inbox.panel.aiTriage.run")}
                    </button>
                  )}
                </div>

                {item.aiAnalysis && (
                  <div className={styles.aiResultBox}>
                    <div className="flex justify-between items-start mb-3">
                      <div className={styles.aiResultBox__section}>
                        <span className={styles.aiResultBox__label}>
                          {t("inbox.panel.aiTriage.suggestedPriority")}
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
                              {t("inbox.panel.aiTriage.apply")}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={styles.aiResultBox__label}>
                          {t("inbox.panel.aiTriage.confidence")}
                        </span>
                        <span className="text-xs font-mono text-emerald-400 font-semibold">
                          HIGH
                        </span>
                      </div>
                    </div>

                    <div className={styles.aiResultBox__section}>
                      <span className={styles.aiResultBox__label}>
                        {t("inbox.panel.aiTriage.reasoning")}
                      </span>
                      <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                        {item.aiAnalysis.reasoning}
                      </p>
                    </div>

                    <div className={styles.aiResultBox__section}>
                      <span className={styles.aiResultBox__label}>
                        {t("inbox.panel.aiTriage.nextSteps")}
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
                      {t("inbox.panel.aiTriage.generateDraft")}
                      <ArrowRight size={10} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Assign Confirmation Modal */}
      {showAssignConfirm &&
        item &&
        createPortal(
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              backdropFilter: "blur(4px)",
            }}
            onClick={() => setShowAssignConfirm(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border-subtle)",
                borderRadius: "0.75rem",
                boxShadow: "0 24px 64px rgba(0, 0, 0, 0.5)",
                width: "100%",
                maxWidth: "360px",
                padding: "1.5rem",
              }}
            >
              <h3
                style={{
                  margin: "0 0 0.75rem",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                }}
              >
                {t("inbox.panel.confirmations.reassignTitle")}
              </h3>
              <p
                style={{
                  margin: "0 0 1.25rem",
                  fontSize: "0.75rem",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.5,
                }}
              >
                {/* We need to interpolate the name manually since our simple t function might not support it fully or we want safe innerHTML substitute */}
                {t("inbox.panel.confirmations.reassignBody")
                  .split("{name}")
                  .map((part, i, arr) => (
                    <React.Fragment key={i}>
                      {part}
                      {i < arr.length - 1 && <strong>{item.assignee}</strong>}
                    </React.Fragment>
                  ))}
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={() => setShowAssignConfirm(false)}
                  style={{
                    padding: "0.5rem 1rem",
                    background: "transparent",
                    border: "1px solid var(--color-border-subtle)",
                    borderRadius: "0.375rem",
                    color: "var(--color-text-secondary)",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                  }}
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={performAssignment}
                  style={{
                    padding: "0.5rem 1rem",
                    background: "var(--color-accent-primary)",
                    border: "none",
                    borderRadius: "0.375rem",
                    color: "white",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {t("inbox.panel.confirmations.reassignConfirm")}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm &&
        item &&
        createPortal(
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              backdropFilter: "blur(4px)",
            }}
            onClick={() => setShowDeleteConfirm(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border-subtle)",
                borderRadius: "0.75rem",
                boxShadow: "0 24px 64px rgba(0, 0, 0, 0.5)",
                width: "100%",
                maxWidth: "360px",
                padding: "1.5rem",
              }}
            >
              <h3
                style={{
                  margin: "0 0 0.75rem",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "rgb(244, 63, 94)",
                }}
              >
                {t("inbox.panel.confirmations.deleteTitle")}
              </h3>
              <p
                style={{
                  margin: "0 0 1.25rem",
                  fontSize: "0.75rem",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.5,
                }}
                dangerouslySetInnerHTML={{
                  __html: t("inbox.panel.confirmations.deleteBody")
                    .replace("**", "<strong>")
                    .replace("**", "</strong>"),
                }} // Simple markdown replacement for bold
              />
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    padding: "0.5rem 1rem",
                    background: "transparent",
                    border: "1px solid var(--color-border-subtle)",
                    borderRadius: "0.375rem",
                    color: "var(--color-text-secondary)",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                  }}
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  style={{
                    padding: "0.5rem 1rem",
                    background: "rgb(244, 63, 94)",
                    border: "none",
                    borderRadius: "0.375rem",
                    color: "white",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: isDeleting ? "not-allowed" : "pointer",
                    opacity: isDeleting ? 0.7 : 1,
                  }}
                >
                  {isDeleting
                    ? t("common.loading")
                    : t("inbox.panel.confirmations.deleteConfirm")}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
