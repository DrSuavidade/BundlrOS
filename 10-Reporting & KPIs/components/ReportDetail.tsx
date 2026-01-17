import React from "react";
import ReactMarkdown from "react-markdown";
import { Report, ReportStatus } from "../types";
import {
  ArrowLeft,
  CheckCircle,
  Send,
  Printer,
  Share2,
  Trash2,
} from "lucide-react";
import styles from "../App.module.css";

interface ReportDetailProps {
  report: Report;
  onBack: () => void;
  onApprove: (id: string) => void;
  onSend: (id: string) => void;
  onDelete?: (id: string) => void;
}

const ReportDetail: React.FC<ReportDetailProps> = ({
  report,
  onBack,
  onApprove,
  onSend,
  onDelete,
}) => {
  return (
    <div className={styles.reportDetail}>
      <button
        onClick={onBack}
        className={styles.backButton}
        title="Back to Reports"
      >
        <ArrowLeft size={16} />
      </button>

      <div className={styles.reportDetailCard}>
        <div className={styles.reportDetailHeader}>
          <div>
            <h2 className={styles.reportDetailTitle}>{report.title}</h2>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "4px",
                fontSize: "12px",
                color: "var(--color-text-tertiary)",
              }}
            >
              <span>Status: {report.status}</span>
              {report.generatedAt && (
                <span>
                  • Generated: {new Date(report.generatedAt).toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            {onDelete && (
              <button
                onClick={() => onDelete(report.id)}
                className={`${styles.actionButton}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "transparent",
                  color: "var(--color-text-secondary)",
                  border: "1px solid var(--color-border-subtle)",
                }}
                title="Delete Report"
              >
                <Trash2 size={12} />
              </button>
            )}

            {report.status === ReportStatus.GENERATED && (
              <button
                onClick={() => onApprove(report.id)}
                className={`${styles.actionButton} ${styles.approve}`}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <CheckCircle size={12} />
                Approve Report
              </button>
            )}

            {report.status === ReportStatus.APPROVED && (
              <button
                onClick={() => onSend(report.id)}
                className={`${styles.actionButton} ${styles.send}`}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Send size={12} />
                Send to Stakeholders
              </button>
            )}
          </div>
        </div>

        <div className={styles.reportDetailBody}>
          <div className={styles.reportContent}>
            {report.content ? (
              <ReactMarkdown
                components={{
                  h1: ({ node, ...props }) => (
                    <h1
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        marginBottom: "1rem",
                        color: "var(--color-text-primary)",
                      }}
                      {...props}
                    />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        marginTop: "1.5rem",
                        marginBottom: "0.5rem",
                        color: "var(--color-text-primary)",
                      }}
                      {...props}
                    />
                  ),
                  p: ({ node, ...props }) => (
                    <p style={{ marginBottom: "1rem" }} {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul
                      style={{
                        marginLeft: "1.5rem",
                        marginBottom: "1rem",
                        listStyleType: "disc",
                      }}
                      {...props}
                    />
                  ),
                  li: ({ node, ...props }) => (
                    <li style={{ marginBottom: "0.25rem" }} {...props} />
                  ),
                }}
              >
                {report.content}
              </ReactMarkdown>
            ) : (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "2rem",
                  color: "var(--color-text-tertiary)",
                }}
              >
                <p>Report content is empty or loading...</p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.reportActions}>
          <span
            style={{ fontSize: "10px", color: "var(--color-text-tertiary)" }}
          >
            CONFIDENTIAL - INTERNAL USE ONLY • Generated by Narrative BI
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;
