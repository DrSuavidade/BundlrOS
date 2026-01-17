import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate } from "react-router-dom";
import { ApprovalService } from "../services";
import { GeminiService } from "../services/geminiService";
import { ApprovalRequest, ApprovalStatus } from "../types";
import { StatusBadge } from "../components/StatusBadge";
import {
  ArrowLeft,
  Clock,
  Paperclip,
  Share2,
  Sparkles,
  Loader2,
  FileText,
  User,
  CheckCircle,
  Bell,
  AlertCircle,
  XCircle,
  ThumbsUp,
  AlertTriangle,
} from "lucide-react";
import { Button, useLanguage } from "@bundlros/ui";
import { format } from "date-fns";
import styles from "./ApprovalDetail.module.css";

export const ApprovalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [approval, setApproval] = useState<ApprovalRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<string>("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // For drafting
  const [aiDraftOpen, setAiDraftOpen] = useState(false);
  const [draftType, setDraftType] = useState<"APPROVE" | "REJECT">("APPROVE");
  const [draftContent, setDraftContent] = useState("");
  const [drafting, setDrafting] = useState(false);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    action: ApprovalStatus | null;
  }>({ isOpen: false, action: null });

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;

      const [data, user] = await Promise.all([
        ApprovalService.getById(id),
        ApprovalService.getCurrentUser(),
      ]);

      if (data) setApproval(data);
      if (user) setCurrentUserId(user.id);

      setLoading(false);
    };
    fetch();
  }, [id]);

  const handleQuickAction = (status: ApprovalStatus) => {
    if (!approval) return;
    setConfirmModal({ isOpen: true, action: status });
  };

  const performAction = async () => {
    if (!approval || !confirmModal.action) return;

    setLoading(true);
    setConfirmModal({ isOpen: false, action: null });

    await ApprovalService.updateStatus(
      approval.id,
      confirmModal.action,
      "",
      "Admin",
    );
    const updated = await ApprovalService.getById(approval.id);
    if (updated) setApproval(updated);
    setLoading(false);
  };

  const handleGenerateSummary = async () => {
    if (!approval) return;
    setSummaryLoading(true);
    const text = await GeminiService.summarizeRequest(approval.description);
    setSummary(text);
    setSummaryLoading(false);
  };

  const handleCopyLink = () => {
    if (!approval) return;
    const url = `${window.location.origin}/#/verify/${approval.token}`;
    navigator.clipboard.writeText(url);
    alert(t("approvals.details.clipboard"));
  };

  const handleSendReminder = async () => {
    if (!approval) return;
    await ApprovalService.sendReminder(approval.id);
    const updated = await ApprovalService.getById(approval.id);
    if (updated) setApproval(updated);
  };

  const openDraft = async (type: "APPROVE" | "REJECT") => {
    setDraftType(type);
    setAiDraftOpen(true);
    setDrafting(true);
    setDraftContent(t("approvals.details.aiThinking"));
    const text = await GeminiService.draftResponse(
      type,
      approval?.title + " - " + approval?.description || "",
    );
    setDraftContent(text);
    setDrafting(false);
  };

  const handleDecision = async () => {
    if (!approval) return;
    setLoading(true);
    await ApprovalService.updateStatus(
      approval.id,
      draftType === "APPROVE"
        ? ApprovalStatus.APPROVED
        : ApprovalStatus.REJECTED,
      draftContent,
      "Admin",
    );
    const updated = await ApprovalService.getById(approval.id);
    if (updated) setApproval(updated);
    setAiDraftOpen(false);
    setLoading(false);
  };

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-[var(--color-accent-primary)]" />
      </div>
    );
  if (!approval)
    return (
      <div className={styles.pageContainer}>
        {t("approvals.details.notFound")}
      </div>
    );

  const isAssignee =
    currentUserId &&
    approval.assigneeId &&
    currentUserId === approval.assigneeId;

  return (
    <div className={styles.pageContainer}>
      {/* Header (Simplified) */}
      <div className={styles.header} style={{ marginBottom: "1.5rem" }}>
        <div className={styles.titleSection}>
          <button
            onClick={() => navigate("/approvals")}
            className={styles.backButton}
            title={t("approvals.details.back")}
          >
            <ArrowLeft size={16} />
          </button>
          <h1>{approval.title}</h1>
          <p className="flex items-center gap-2">
            {t("approvals.details.reference")}:{" "}
            <span className="font-mono text-[var(--color-text-secondary)]">
              #{approval.id.slice(0, 8)}
            </span>
            <span className="text-[var(--color-text-tertiary)]">•</span>
            <span className="text-[var(--color-text-tertiary)]">
              Created {format(new Date(approval.createdAt), "MMM d, yyyy")}
            </span>
            <span className="text-[var(--color-text-tertiary)]">•</span>
            {isAssignee && (
              <span className="text-amber-500 font-medium text-xs border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 rounded">
                {t("approvals.details.assignee")}
              </span>
            )}
          </p>
        </div>
        <div>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Share2 size={14} />}
            onClick={handleCopyLink}
          >
            {t("approvals.details.share")}
          </Button>
        </div>
      </div>

      {/* ACTION HERO BANNER */}
      {approval.status === ApprovalStatus.PENDING && !isAssignee && (
        <div className={`${styles.statusBanner} ${styles.pending}`}>
          <div className={styles.bannerContent}>
            <h2>
              <AlertCircle className="text-white" />{" "}
              {t("approvals.details.actionRequired")}
            </h2>
            <p>{t("approvals.details.pendingDesc")}</p>
          </div>
          <div className={styles.bannerActions}>
            <Button
              variant="danger"
              onClick={() => handleQuickAction(ApprovalStatus.REJECTED)}
              isLoading={loading}
              className="!bg-white/10 !border-white/20 !text-white hover:!bg-white/20"
            >
              {t("approvals.details.reject")}
            </Button>
            <Button
              variant="primary"
              onClick={() => handleQuickAction(ApprovalStatus.APPROVED)}
              isLoading={loading}
              className="!bg-white !text-emerald-600 hover:!bg-white/90 !border-white shadow-lg"
            >
              {t("approvals.details.approveDeliverable")}
            </Button>
          </div>
        </div>
      )}

      {approval.status === ApprovalStatus.PENDING && isAssignee && (
        <div
          className={`${styles.statusBanner} ${styles.pending}`}
          style={{
            background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
          }}
        >
          <div className={styles.bannerContent}>
            <h2>
              <AlertTriangle className="text-white" />{" "}
              {t("approvals.details.awaitingReview")}
            </h2>
            <p>{t("approvals.details.assigneeWarning")}</p>
          </div>
        </div>
      )}

      {approval.status === ApprovalStatus.APPROVED && (
        <div className={`${styles.statusBanner} ${styles.approved}`}>
          <div className={styles.bannerContent}>
            <h2>
              <CheckCircle className="text-white" />{" "}
              {t("approvals.details.approvedTitle")}
            </h2>
            <p>{t("approvals.details.approvedDesc")}</p>
          </div>
          <div className={styles.bannerActions}>
            {/* View Certificate or Next Steps could go here */}
          </div>
        </div>
      )}

      {approval.status === ApprovalStatus.REJECTED && (
        <div className={`${styles.statusBanner} ${styles.rejected}`}>
          <div className={styles.bannerContent}>
            <h2>
              <XCircle className="text-white" />{" "}
              {t("approvals.details.rejectedTitle")}
            </h2>
            <p>{t("approvals.details.rejectedDesc")}</p>
          </div>
        </div>
      )}

      <div className={styles.contentGrid}>
        {/* Left Column - Document Card spanning full height */}
        <div className={styles.leftColumn}>
          {/* Main Document Card */}
          <div className={styles.documentCard}>
            {/* Description Section */}
            <div className={styles.documentSection}>
              <h3 className={styles.docSectionTitle}>
                <FileText size={16} />
                {t("approvals.details.description")}
              </h3>
              <div className={styles.docContent}>
                <p className="leading-relaxed whitespace-pre-wrap text-[var(--color-text-primary)]">
                  {approval.description}
                </p>
              </div>
            </div>

            <div className={styles.separator} />

            {/* Attachments Section */}
            <div className={styles.documentSection}>
              <h3 className={styles.docSectionTitle}>
                <Paperclip size={16} />
                {t("approvals.details.attachments")}
              </h3>
              <div className={styles.docContent}>
                {approval.attachmentName ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      className={styles.attachmentCard}
                      onClick={() => {
                        if (!approval.attachmentUrl) return;
                        let url = approval.attachmentUrl;
                        if (!/^https?:\/\//i.test(url)) {
                          url = "https://" + url;
                        }
                        window.open(url, "_blank");
                      }}
                    >
                      <div className={styles.attachmentIcon}>
                        <FileText size={24} />
                      </div>
                      <div className={styles.attachmentInfo}>
                        <div className={styles.attachmentName}>
                          {approval.attachmentName}
                        </div>
                        <div className={styles.attachmentMeta}>
                          {approval.attachmentType
                            ? approval.attachmentType
                                .split("/")[1]
                                ?.toUpperCase()
                            : "FILE"}{" "}
                          •{" "}
                          {approval.attachmentSize
                            ? (approval.attachmentSize / (1024 * 1024)).toFixed(
                                1,
                              ) + " MB"
                            : "Unknown Size"}
                        </div>
                      </div>
                      <div className={styles.attachmentAction}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="!p-1 !h-8 !w-8"
                        >
                          <Share2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyState__icon}>
                      <Paperclip size={20} />
                    </div>
                    <span className={styles.emptyState__text}>
                      {t("approvals.details.noAttachments")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Details & Timeline */}
        <div className={styles.rightColumn}>
          {/* Details Card */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>
                <User
                  size={14}
                  style={{ color: "var(--color-accent-primary)" }}
                />
                {t("approvals.viewDetails")}
              </div>
            </div>
            <div className={styles.sectionBody}>
              <div className={styles.detailGrid}>
                <div className={styles.detailCard}>
                  <div
                    className={styles.detailCard__icon}
                    style={{ background: "rgba(34, 211, 238, 0.1)" }}
                  >
                    <User size={16} style={{ color: "rgb(34, 211, 238)" }} />
                  </div>
                  <div className={styles.detailCard__content}>
                    <span className={styles.detailCard__label}>
                      {t("approvals.details.client")}
                    </span>
                    <span className={styles.detailCard__value}>
                      {approval.clientName}
                    </span>
                  </div>
                </div>

                <div className={styles.detailCard}>
                  <div
                    className={styles.detailCard__icon}
                    style={{ background: "rgba(251, 191, 36, 0.1)" }}
                  >
                    <Clock size={16} style={{ color: "rgb(251, 191, 36)" }} />
                  </div>
                  <div className={styles.detailCard__content}>
                    <span className={styles.detailCard__label}>
                      {t("approvals.details.dueDate")}
                    </span>
                    <span className={styles.detailCard__value}>
                      {format(new Date(approval.dueDate), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
              </div>

              {approval.status === ApprovalStatus.PENDING && (
                <div
                  style={{
                    marginTop: "1.25rem",
                    paddingTop: "1rem",
                    borderTop: "1px solid var(--color-border-subtle)",
                  }}
                >
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    leftIcon={<Bell size={14} />}
                    onClick={handleSendReminder}
                  >
                    {t("approvals.details.sendReminder")}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Activity Timeline Card */}
          <div className={`${styles.sectionCard} ${styles.activityCard}`}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>
                <Clock
                  size={14}
                  style={{ color: "var(--color-accent-primary)" }}
                />
                {t("approvals.details.activity")}
              </div>
            </div>
            <div className={styles.sectionBody}>
              <div className="relative">
                {approval.history.map((event, idx) => (
                  <div key={event.id} className={styles.timelineItem}>
                    <div
                      className={styles.timelineIcon}
                      style={{
                        background:
                          event.type === "STATUS_CHANGED"
                            ? "rgba(16, 185, 129, 0.1)"
                            : "var(--color-bg-card)",
                        borderColor:
                          event.type === "STATUS_CHANGED"
                            ? "rgba(16, 185, 129, 0.3)"
                            : "var(--color-border-subtle)",
                      }}
                    >
                      {event.type === "STATUS_CHANGED" ? (
                        <CheckCircle
                          size={14}
                          style={{ color: "rgb(16, 185, 129)" }}
                        />
                      ) : (
                        <Clock size={14} />
                      )}
                    </div>
                    <div className={styles.timelineContent}>
                      <h4>{event.description}</h4>
                      <p>{event.actor}</p>
                      <span className={styles.timelineTime}>
                        {format(new Date(event.timestamp), "MMM d, h:mm a")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Draft Modal */}
      {aiDraftOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className={styles.sectionCard}
            style={{
              width: "100%",
              maxWidth: "500px",
              margin: 0,
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
            }}
          >
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>
                <Sparkles
                  size={14}
                  className={
                    draftType === "APPROVE" ? "text-indigo-400" : "text-red-400"
                  }
                />
                {t("approvals.details.aiDraft")}
              </div>
              <button
                onClick={() => setAiDraftOpen(false)}
                className="text-[var(--color-text-secondary)] hover:text-white"
              >
                &times;
              </button>
            </div>
            <div className={styles.sectionBody}>
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                {t("approvals.details.reviewMessage")}
              </p>
              <textarea
                className="w-full h-32 bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] rounded-lg p-3 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)] resize-none"
                value={draftContent}
                onChange={(e) => setDraftContent(e.target.value)}
                disabled={drafting}
              />
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAiDraftOpen(false)}
                >
                  {t("approvals.details.cancel")}
                </Button>
                <Button
                  variant={draftType === "APPROVE" ? "primary" : "danger"}
                  size="sm"
                  onClick={handleDecision}
                  isLoading={drafting}
                >
                  {t("approvals.details.confirm")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.isOpen &&
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
            onClick={() => setConfirmModal({ isOpen: false, action: null })}
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
                {confirmModal.action === ApprovalStatus.APPROVED
                  ? t("approvals.details.confirmApproval")
                  : t("approvals.details.confirmRejection")}
              </h3>
              <p
                style={{
                  margin: "0 0 1.25rem",
                  fontSize: "0.75rem",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.5,
                }}
              >
                {confirmModal.action === ApprovalStatus.APPROVED
                  ? t("approvals.details.approvalBody")
                  : t("approvals.details.rejectionBody")}
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={() =>
                    setConfirmModal({ isOpen: false, action: null })
                  }
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
                  {t("approvals.details.cancel")}
                </button>
                <button
                  onClick={performAction}
                  style={{
                    padding: "0.5rem 1rem",
                    background:
                      confirmModal.action === ApprovalStatus.APPROVED
                        ? "var(--color-accent-success, #10b981)"
                        : "var(--color-accent-danger, #ef4444)",
                    border: "none",
                    borderRadius: "0.375rem",
                    color: "white",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {t("approvals.details.confirm")}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};
