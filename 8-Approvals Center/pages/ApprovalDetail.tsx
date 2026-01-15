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
import { Button } from "@bundlros/ui";
import { format } from "date-fns";
import styles from "./ApprovalDetail.module.css";

export const ApprovalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
      "Admin"
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
    alert("Client verification link copied to clipboard!");
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
    setDraftContent("AI is thinking...");
    const text = await GeminiService.draftResponse(
      type,
      approval?.title + " - " + approval?.description || ""
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
      "Admin"
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
  if (!approval) return <div className={styles.pageContainer}>Not Found</div>;

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
            title="Back to Approvals"
          >
            <ArrowLeft size={16} />
          </button>
          <h1>{approval.title}</h1>
          <p className="flex items-center gap-2">
            Reference:{" "}
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
                You are Assignee
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
            Share
          </Button>
        </div>
      </div>

      {/* ACTION HERO BANNER */}
      {approval.status === ApprovalStatus.PENDING && !isAssignee && (
        <div className={`${styles.statusBanner} ${styles.pending}`}>
          <div className={styles.bannerContent}>
            <h2>
              <AlertCircle className="text-white" /> Action Required
            </h2>
            <p>
              This item is currently pending approval. Please review the details
              below.
            </p>
          </div>
          <div className={styles.bannerActions}>
            <Button
              variant="danger"
              onClick={() => handleQuickAction(ApprovalStatus.REJECTED)}
              isLoading={loading}
              className="!bg-white/10 !border-white/20 !text-white hover:!bg-white/20"
            >
              Reject
            </Button>
            <Button
              variant="primary"
              onClick={() => handleQuickAction(ApprovalStatus.APPROVED)}
              isLoading={loading}
              className="!bg-white !text-emerald-600 hover:!bg-white/90 !border-white shadow-lg"
            >
              Approve Deliverable
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
              <AlertTriangle className="text-white" /> Awaiting Review
            </h2>
            <p>
              This item is pending approval. As the assignee, you cannot approve
              your own work. It must be reviewed by another team member or the
              client.
            </p>
          </div>
        </div>
      )}

      {approval.status === ApprovalStatus.APPROVED && (
        <div className={`${styles.statusBanner} ${styles.approved}`}>
          <div className={styles.bannerContent}>
            <h2>
              <CheckCircle className="text-white" /> Approved
            </h2>
            <p>
              This deliverable has been approved and moved to the next stage.
            </p>
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
              <XCircle className="text-white" /> Rejected
            </h2>
            <p>
              This request has been rejected. It has been returned to drafts.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Helper Tool */}
          <div className={styles.aiTool}>
            <div className={styles.aiToolIcon}>
              <Sparkles size={16} />
            </div>
            <div className="flex-1">
              <div className={styles.aiToolContent}>
                <h4>AI Assistant</h4>
              </div>

              {summary ? (
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {summary}
                </p>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[var(--color-text-secondary)] m-0">
                    Need a quick overview? Generate a summary of this request.
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="!text-[var(--color-accent-primary)] !border-[var(--color-accent-primary)]/30 hover:!bg-[var(--color-accent-primary)]/5"
                    onClick={handleGenerateSummary}
                    isLoading={summaryLoading}
                  >
                    Summarize
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Description Card */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>
                <FileText
                  size={14}
                  className="text-[var(--color-accent-primary)]"
                />
                Description
              </div>
            </div>
            <div className={styles.sectionBody}>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">
                {approval.description}
              </p>
            </div>
          </div>

          {/* Attachments Card */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>
                <Paperclip
                  size={14}
                  className="text-[var(--color-accent-primary)]"
                />
                Attachments
              </div>
            </div>
            <div className={styles.sectionBody}>
              {approval.attachmentName ? (
                <div className="flex items-center gap-3 p-3 border border-[var(--color-border-subtle)] rounded-lg bg-[var(--color-bg-subtle)] hover:border-[var(--color-accent-primary)] transition-colors cursor-pointer w-full">
                  <div className="w-10 h-10 bg-[var(--color-bg-elevated)] rounded flex items-center justify-center text-[var(--color-text-secondary)] shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-[var(--color-text-primary)]">
                      {approval.attachmentName}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-bold bg-[var(--color-bg-elevated)] px-1.5 py-0.5 rounded">
                        {approval.attachmentType
                          ? approval.attachmentType
                              .split("/")[1]
                              ?.toUpperCase()
                              .slice(0, 4)
                          : "FILE"}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-tertiary)]">
                        {approval.attachmentSize
                          ? (approval.attachmentSize / (1024 * 1024)).toFixed(
                              1
                            ) + " MB"
                          : ""}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="!h-8"
                    onClick={() =>
                      approval.attachmentUrl &&
                      window.open(approval.attachmentUrl, "_blank")
                    }
                    disabled={!approval.attachmentUrl}
                  >
                    View
                  </Button>
                </div>
              ) : (
                <div className="text-sm text-[var(--color-text-tertiary)] italic p-4 text-center border dashed border-[var(--color-border-subtle)] rounded-lg">
                  No attachments provided.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Timeline & Meta */}
        <div className="space-y-6">
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>
                <User
                  size={14}
                  className="text-[var(--color-accent-primary)]"
                />
                Details
              </div>
            </div>
            <div className={styles.sectionBody}>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--color-text-secondary)]">
                    Client
                  </span>
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    {approval.clientName}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--color-text-secondary)]">
                    Due Date
                  </span>
                  <span className="font-medium text-[var(--color-text-primary)]">
                    {format(new Date(approval.dueDate), "MMM d, yyyy")}
                  </span>
                </div>
              </div>

              {approval.status === ApprovalStatus.PENDING && (
                <div className="mt-6 pt-4 border-t border-[var(--color-border-subtle)]">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    leftIcon={<Bell size={14} />}
                    onClick={handleSendReminder}
                  >
                    Send Reminder
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>
                <Clock
                  size={14}
                  className="text-[var(--color-accent-primary)]"
                />
                Activity
              </div>
            </div>
            <div className={styles.sectionBody}>
              <div className="relative pl-2">
                {approval.history.map((event, idx) => (
                  <div key={event.id} className={styles.timelineItem}>
                    <div className={styles.timelineIcon}>
                      {event.type === "STATUS_CHANGED" ? (
                        <CheckCircle size={12} className="text-emerald-500" />
                      ) : (
                        <Clock size={12} />
                      )}
                    </div>
                    <div className={styles.timelineContent}>
                      <h4>{event.description}</h4>
                      <p className="text-xs">{event.actor}</p>
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
                AI Draft Assistant
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
                Review the generated message before sending.
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
                  Cancel
                </Button>
                <Button
                  variant={draftType === "APPROVE" ? "primary" : "danger"}
                  size="sm"
                  onClick={handleDecision}
                  isLoading={drafting}
                >
                  Confirm
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
                  ? "Confirm Approval"
                  : "Confirm Rejection"}
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
                  ? "Are you sure you want to approve this deliverable? This action will notify the client."
                  : "Are you sure you want to reject this deliverable? It will be returned to the draft stage."}
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
                  Cancel
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
                  Confirm
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
