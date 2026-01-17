import React, { useState, useMemo, useEffect } from "react";
import { Deliverable, QAStatus } from "../types";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Shield,
  CheckSquare,
  Square,
  AlertCircle,
  FileText,
  Paperclip,
  ExternalLink,
} from "lucide-react";
import styles from "../App.module.css";
import { QAService } from "../services";

// Checklists definition based on exampleQA.md
const CHECKLISTS = {
  SOFTWARE: {
    title: "Software QA (apps, automations, integrations)",
    blocks: [
      {
        name: "Build & deploy",
        items: [
          "builds without errors",
          "environment variables configured",
          "staging/production links correct",
        ],
      },
      {
        name: "Functional smoke tests",
        items: [
          "critical user flows work end-to-end",
          "auth, permissions, roles",
        ],
      },
      {
        name: "Edge cases",
        items: [
          "empty states, error handling, timeouts",
          "rate limits, retries, failure messages",
        ],
      },
      {
        name: "Integrations",
        items: [
          "webhook events verified",
          "API keys scopes verified",
          "logs + monitoring present",
        ],
      },
      {
        name: "Security & privacy basics",
        items: ["no secrets in repo", "PII handling sanity checks"],
      },
      {
        name: "Performance basics",
        items: ["page load thresholds / automation run time bounds"],
      },
      {
        name: "Docs & handoff",
        items: ["setup steps", "rollback / disable steps", "known limitations"],
      },
      {
        name: "Artifacts produced",
        items: [
          "QA report (auto-generated summary)",
          "Test evidence links (staging recordings / screenshots)",
          "Release notes",
        ],
      },
    ],
  },
  DESIGN: {
    title: "Design QA (brand identity, website design, social templates)",
    blocks: [
      {
        name: "Brand consistency",
        items: [
          "colors / type / spacing per brand guidelines",
          "logo usage rules respected",
        ],
      },
      {
        name: "Layout & responsiveness",
        items: ["key breakpoints covered", "spacing/alignments consistent"],
      },
      {
        name: "Content quality",
        items: [
          "spelling, grammar, tone",
          "image resolution, compression, licensing",
        ],
      },
      {
        name: "Accessibility basics",
        items: ["contrast checks", "legible font sizes"],
      },
      {
        name: "Export & delivery format",
        items: [
          "correct naming, correct file formats",
          "editable source included (Figma/AI) when promised",
        ],
      },
      {
        name: "Implementation readiness",
        items: [
          "components annotated",
          "assets organized",
          "handoff notes included",
        ],
      },
      {
        name: "Artifacts produced",
        items: [
          "QA annotations (Figma comments)",
          "Export pack + naming standards pass",
          "Handoff notes",
        ],
      },
    ],
  },
  REPORT: {
    title: "Report QA (strategy doc, analytics, marketing report)",
    blocks: [
      {
        name: "Structure & completeness",
        items: ["all required sections present", "executive summary included"],
      },
      {
        name: "Data accuracy",
        items: ["sources cited", "numbers reconcile across charts/tables/text"],
      },
      {
        name: "Narrative clarity",
        items: ["conclusions supported by data", "recommendations actionable"],
      },
      {
        name: "Formatting",
        items: [
          "consistent headings, spacing, page breaks",
          "client branding in cover/footer if needed",
        ],
      },
      {
        name: "Compliance / claims",
        items: ["no unverified claims", "disclaimers where appropriate"],
      },
      {
        name: "Artifacts produced",
        items: [
          "QA notes + corrected version",
          "Sources & assumptions section verified",
        ],
      },
    ],
  },
  DOCUMENT: {
    title: "Document fallback (generic)",
    blocks: [
      {
        name: "General Check",
        items: [
          "completeness, formatting, links work",
          "file opens, branding",
          "spelling/grammar, correct export",
        ],
      },
    ],
  },
};

interface ApprovalData {
  description: string;
  attachmentName?: string;
  attachmentUrl?: string;
  attachmentType?: string;
  attachmentSize?: number;
}

interface DeliverableDetailProps {
  deliverable: Deliverable;
  onBack: () => void;
  onRerun: (id: string, type: string) => void;
  isRunning: boolean;
}

export const DeliverableDetail: React.FC<DeliverableDetailProps> = ({
  deliverable,
  onBack,
  onRerun,
  isRunning,
}) => {
  // Initialize from persisted state if available
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(
    deliverable.qa_checklist_state || {}
  );
  const [approvalData, setApprovalData] = useState<ApprovalData | null>(null);
  const [loadingApproval, setLoadingApproval] = useState(true);

  // Fetch approval data on mount
  useEffect(() => {
    const fetchApproval = async () => {
      try {
        const data = await QAService.getApprovalByDeliverableId(deliverable.id);
        setApprovalData(data);
      } catch (error) {
        console.error("[QA] Error fetching approval:", error);
      } finally {
        setLoadingApproval(false);
      }
    };
    fetchApproval();
  }, [deliverable.id]);

  // Determine which checklist to use
  const activeChecklist = useMemo(() => {
    const type = (deliverable.type || "").toLowerCase();

    if (
      type.includes("api") ||
      type.includes("widget") ||
      type.includes("software")
    ) {
      return CHECKLISTS.SOFTWARE;
    }
    if (
      type.includes("landing") ||
      type.includes("email") ||
      type.includes("design")
    ) {
      return CHECKLISTS.DESIGN;
    }
    if (type.includes("report") || type.includes("strategy")) {
      return CHECKLISTS.REPORT;
    }
    return CHECKLISTS.DOCUMENT;
  }, [deliverable.type]);

  // Calculate progress
  const totalItems = activeChecklist.blocks.reduce(
    (acc, block) => acc + block.items.length,
    0
  );
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const progress = Math.round((checkedCount / totalItems) * 100);
  const isComplete = checkedCount === totalItems;

  const toggleItem = (id: string) => {
    const newState = {
      ...checkedItems,
      [id]: !checkedItems[id],
    };
    setCheckedItems(newState);

    // Save to DB
    QAService.saveChecklistState(deliverable.id, newState).catch((err) => {
      console.error("Failed to save checklist state:", err);
    });
  };

  const handleMarkAll = () => {
    const allChecked: Record<string, boolean> = {};
    activeChecklist.blocks.forEach((block, bIdx) => {
      block.items.forEach((_, iIdx) => {
        allChecked[`${bIdx}-${iIdx}`] = true;
      });
    });
    setCheckedItems(allChecked);
    QAService.saveChecklistState(deliverable.id, allChecked).catch((err) => {
      console.error("Failed to save checklist state (Mark All):", err);
    });
  };

  return (
    <div className={styles.detailContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <button
            onClick={onBack}
            className={styles.backButton}
            title="Back to Overview"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1>
              <Shield
                size={22}
                style={{ color: "var(--color-accent-primary)" }}
              />
              {deliverable.name}
            </h1>
            <p>
              {deliverable.type} • ID: {deliverable.id} • Version:{" "}
              {deliverable.version}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid - 2/3 + 1/3 Layout */}
      <div className={styles.detailContentGrid}>
        {/* Left Column - Description & Attachments (2/3) */}
        <div className={styles.detailLeftColumn}>
          <div className={styles.detailCard}>
            {/* Description Section */}
            <div className={styles.detailCard__section}>
              <h3 className={styles.detailCard__sectionTitle}>
                <FileText
                  size={16}
                  style={{ color: "var(--color-accent-primary)" }}
                />
                Description
              </h3>
              <div className={styles.detailCard__content}>
                {loadingApproval ? (
                  <p
                    style={{
                      color: "var(--color-text-tertiary)",
                      fontStyle: "italic",
                    }}
                  >
                    Loading...
                  </p>
                ) : approvalData?.description ? (
                  <p
                    style={{
                      color: "var(--color-text-primary)",
                      whiteSpace: "pre-wrap",
                      lineHeight: 1.75,
                    }}
                  >
                    {approvalData.description}
                  </p>
                ) : (
                  <p
                    style={{
                      color: "var(--color-text-tertiary)",
                      fontStyle: "italic",
                    }}
                  >
                    No description available for this deliverable.
                  </p>
                )}
              </div>
            </div>

            <div className={styles.detailCard__separator} />

            {/* Attachments Section */}
            <div className={styles.detailCard__section}>
              <h3 className={styles.detailCard__sectionTitle}>
                <Paperclip
                  size={16}
                  style={{ color: "var(--color-accent-primary)" }}
                />
                Attachments
              </h3>
              <div className={styles.detailCard__content}>
                {loadingApproval ? (
                  <p
                    style={{
                      color: "var(--color-text-tertiary)",
                      fontStyle: "italic",
                    }}
                  >
                    Loading...
                  </p>
                ) : approvalData?.attachmentName ? (
                  <div
                    className={styles.attachmentCard}
                    onClick={() => {
                      if (!approvalData.attachmentUrl) return;
                      let url = approvalData.attachmentUrl;
                      if (!/^https?:\/\//i.test(url)) {
                        url = "https://" + url;
                      }
                      window.open(url, "_blank");
                    }}
                  >
                    <div className={styles.attachmentCard__icon}>
                      <FileText size={24} />
                    </div>
                    <div className={styles.attachmentCard__info}>
                      <div className={styles.attachmentCard__name}>
                        {approvalData.attachmentName}
                      </div>
                      <div className={styles.attachmentCard__meta}>
                        {approvalData.attachmentType
                          ? approvalData.attachmentType
                              .split("/")[1]
                              ?.toUpperCase()
                          : "FILE"}
                        {approvalData.attachmentSize && (
                          <>
                            {" "}
                            •{" "}
                            {(
                              approvalData.attachmentSize /
                              (1024 * 1024)
                            ).toFixed(1)}{" "}
                            MB
                          </>
                        )}
                      </div>
                    </div>
                    <div className={styles.attachmentCard__action}>
                      <ExternalLink size={16} />
                    </div>
                  </div>
                ) : (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyState__icon}>
                      <Paperclip size={20} />
                    </div>
                    <span className={styles.emptyState__text}>
                      No attachments available.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Checklist (1/3) */}
        <div className={styles.detailRightColumn}>
          <div className={styles.detailCard}>
            {/* Progress Header */}
            <div className={styles.cardHeader}>
              <div className={styles.cardHeader__info}>
                <div className={styles.cardHeader__type}>
                  {activeChecklist.title}
                </div>
                <div
                  style={{
                    marginTop: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      height: "6px",
                      background: "var(--color-bg-elevated)",
                      borderRadius: "3px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${progress}%`,
                        height: "100%",
                        background: isComplete
                          ? "rgb(16, 185, 129)"
                          : "var(--color-accent-primary)",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {progress}%
                  </span>
                </div>
              </div>

              <div className={styles.cardHeader__status}>
                <button
                  onClick={handleMarkAll}
                  className={styles.analyzeButton}
                  style={{ marginRight: 0, fontSize: "0.6875rem" }}
                >
                  Mark All
                </button>
              </div>
            </div>

            {/* Checklist */}
            <div className={styles.validationMatrix}>
              {activeChecklist.blocks.map((block, blockIndex) => (
                <div key={blockIndex} style={{ marginBottom: "1.5rem" }}>
                  <div className={styles.matrixHeader}>
                    <span className={styles.matrixHeader__title}>
                      {block.name}
                    </span>
                    <div className={styles.matrixHeader__line} />
                  </div>

                  <div>
                    {block.items.map((item, itemIndex) => {
                      const id = `${blockIndex}-${itemIndex}`;
                      const isChecked = checkedItems[id];

                      return (
                        <div
                          key={id}
                          className={styles.checkItem}
                          onClick={() => toggleItem(id)}
                          style={{
                            cursor: "pointer",
                            borderColor: isChecked
                              ? "rgb(16, 185, 129, 0.3)"
                              : undefined,
                          }}
                        >
                          <div
                            className={`${styles.checkItem__icon} ${
                              isChecked ? styles.passed : ""
                            }`}
                            style={{
                              color: isChecked
                                ? "rgb(16, 185, 129)"
                                : "var(--color-text-tertiary)",
                            }}
                          >
                            {isChecked ? (
                              <CheckSquare size={16} />
                            ) : (
                              <Square size={16} />
                            )}
                          </div>
                          <div className={styles.checkItem__content}>
                            <div
                              className={styles.checkItem__header}
                              style={{ alignItems: "center" }}
                            >
                              <h4
                                className={styles.checkItem__label}
                                style={{
                                  fontSize: "0.8125rem",
                                  fontWeight: 500,
                                }}
                              >
                                {item}
                              </h4>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Action Footer */}
            <div className={styles.detailCard__footer}>
              <button
                className={styles.analyzeButton}
                onClick={() => {
                  QAService.saveChecklistState(
                    deliverable.id,
                    checkedItems
                  ).finally(() => {
                    onBack();
                  });
                }}
                style={{
                  background: "transparent",
                  border: "1px solid var(--color-border-subtle)",
                }}
              >
                Save Draft & Exit
              </button>
              <button
                className={styles.rerunButton}
                disabled={!isComplete}
                style={{
                  padding: "0.625rem 1rem",
                  fontSize: "0.8125rem",
                  background: isComplete ? "rgb(16, 185, 129)" : undefined,
                  opacity: isComplete ? 1 : 0.5,
                }}
              >
                {isComplete ? (
                  <>
                    <CheckCircle size={14} />
                    Approve & Deliver
                  </>
                ) : (
                  <>
                    <AlertCircle size={14} />
                    {totalItems - checkedCount} Remaining
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
