import React from "react";
import { Report, ReportStatus } from "../types";
import {
  FileText,
  CheckCircle2,
  Clock,
  Send,
  Plus,
  Sparkles,
  ChevronRight,
  Trash2,
} from "lucide-react";
import styles from "../App.module.css";
import { useLanguage } from "@bundlros/ui";

interface ReportListProps {
  reports: Report[];
  onSelectReport: (report: Report) => void;
  onRequestReport: () => void;
  onClearAll?: () => void;
  isGenerating: boolean;
}

const ReportList: React.FC<ReportListProps> = ({
  reports,
  onSelectReport,
  onRequestReport,
  onClearAll,
  isGenerating,
}) => {
  const { t } = useLanguage();

  const getStatusClass = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.GENERATED:
        return styles.generated;
      case ReportStatus.APPROVED:
        return styles.approved;
      case ReportStatus.SENT:
        return styles.sent;
      default:
        return "";
    }
  };

  const getStatusIcon = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.APPROVED:
        return <CheckCircle2 size={12} />;
      case ReportStatus.SENT:
        return <Send size={12} />;
      case ReportStatus.GENERATED:
        return <FileText size={12} />;
      default:
        return <Clock size={12} />;
    }
  };

  return (
    <div className={styles.reportList}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h2>{t("reporting.list.title")}</h2>
          <p>{t("reporting.list.subtitle")}</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {onClearAll && reports.length > 0 && (
            <button
              onClick={onClearAll}
              className={styles.secondaryButton || styles.generateButton}
              style={{
                background: "transparent",
                border: "1px solid var(--color-border-subtle)",
                color: "var(--color-text-secondary)",
                padding: "0 8px",
              }}
              title={t("reporting.list.clearAll")}
            >
              <Trash2 size={14} />
            </button>
          )}
          <button
            onClick={onRequestReport}
            disabled={isGenerating}
            className={styles.generateButton}
          >
            {isGenerating ? (
              <>
                <Sparkles size={12} className="animate-spin" />
                {t("reporting.list.generating")}
              </>
            ) : (
              <>
                <Plus size={12} />
                {t("reporting.list.generate")}
              </>
            )}
          </button>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyState__icon}>
            <FileText size={24} />
          </div>
          <p className={styles.emptyState__text}>{t("reporting.list.empty")}</p>
        </div>
      ) : (
        <div className={styles.reportList}>
          {reports.map((report) => (
            <div
              key={report.id}
              onClick={() => onSelectReport(report)}
              className={styles.reportItem}
            >
              <div className={styles.reportItem__info}>
                <h3 className={styles.reportItem__title}>{report.title}</h3>
                <span className={styles.reportItem__meta}>
                  {new Date(report.createdAt).toLocaleDateString()}
                </span>
                <span
                  className={styles.reportItem__meta}
                  style={{ marginLeft: "10px" }}
                >
                  {report.period}
                </span>
              </div>

              <span
                className={`${styles.reportItem__status} ${getStatusClass(
                  report.status,
                )}`}
              >
                {getStatusIcon(report.status)}
                {t(`reporting.status.${report.status.toLowerCase()}`)}
              </span>
              <ChevronRight
                size={16}
                style={{
                  marginLeft: "10px",
                  color: "var(--color-text-tertiary)",
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportList;
