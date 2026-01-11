import React, { useState } from "react";
import { ViewState, KPIRecord, Report, ReportStatus } from "./types";
import { MOCK_KPIS, PERIODS } from "./data/mockData";
import { generateReportNarrative } from "./services/geminiService";
import {
  BarChart3,
  Calendar,
  Filter,
  TrendingUp,
  TrendingDown,
  FileText,
  Sparkles,
  Send,
  CheckCircle,
  Clock,
  ArrowLeft,
  Plus,
} from "lucide-react";
import { useLanguage } from "@bundlros/ui";
import styles from "./App.module.css";

// KPI Card Component
const KPICard: React.FC<{ kpi: KPIRecord; t: (key: string) => string }> = ({
  kpi,
  t,
}) => {
  const isUp = kpi.delta >= 0;

  return (
    <div className={styles.kpiCard}>
      <div className={styles.kpiCard__header}>
        <span className={styles.kpiCard__label}>{kpi.name}</span>
        <span
          className={`${styles.kpiCard__trend} ${
            isUp ? styles.up : styles.down
          }`}
        >
          {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {Math.abs(kpi.delta)}%
        </span>
      </div>
      <div className={styles.kpiCard__value}>{kpi.formatted}</div>
      <div className={styles.kpiCard__footer}>
        {t("reporting.vsLastPeriod")}
      </div>
    </div>
  );
};

// Dashboard View
const DashboardView: React.FC<{
  kpis: KPIRecord[];
  periods: string[];
  selectedPeriod: string;
  selectedPeriod: string;
  onSelectPeriod: (p: string) => void;
  t: (key: string) => string;
}> = ({ kpis, periods, selectedPeriod, onSelectPeriod, t }) => {
  const filteredKPIs = kpis.filter((k) => k.period === selectedPeriod);

  return (
    <>
      <div className={styles.dashboardHeader}>
        <div className={styles.dashboardTitle}>
          <h2>{t("reporting.dashboardTitle")}</h2>
          <p>
            {t("reporting.dashboardSubtitle")}{" "}
            <span className={styles.accentText}>{selectedPeriod}</span>
          </p>
        </div>
        <div className={styles.periodControls}>
          <div className={styles.periodSelect}>
            <Calendar size={12} className={styles.periodSelect__icon} />
            <select
              value={selectedPeriod}
              onChange={(e) => onSelectPeriod(e.target.value)}
            >
              {periods.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <div className={styles.periodSelect__arrow} />
          </div>
          <button className={styles.filterButton}>
            <Filter size={14} />
          </button>
        </div>
      </div>

      {filteredKPIs.length > 0 ? (
        <div className={styles.kpiGrid}>
          {filteredKPIs.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} t={t} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyState__icon}>
            <Calendar size={24} />
          </div>
          <p className={styles.emptyState__text}>
            {t("reporting.noTelemetry")}
          </p>
        </div>
      )}
    </>
  );
};

// Report List View
const ReportListView: React.FC<{
  reports: Report[];
  onSelectReport: (r: Report) => void;
  onRequestReport: () => void;
  isGenerating: boolean;
  t: (key: string) => string;
}> = ({ reports, onSelectReport, onRequestReport, isGenerating, t }) => {
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

  return (
    <>
      <div className={styles.dashboardHeader}>
        <div className={styles.dashboardTitle}>
          <h2>{t("reporting.analyticReports")}</h2>
          <p>{t("reporting.analyticReportsSubtitle")}</p>
        </div>
        <button
          onClick={onRequestReport}
          disabled={isGenerating}
          className={styles.generateButton}
        >
          {isGenerating ? (
            <>
              <Sparkles size={12} className="animate-spin" />
              {t("reporting.generating")}
            </>
          ) : (
            <>
              <Plus size={12} />
              {t("reporting.generateReport")}
            </>
          )}
        </button>
      </div>

      {reports.length > 0 ? (
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
              </div>
              <span
                className={`${styles.reportItem__status} ${getStatusClass(
                  report.status
                )}`}
              >
                {report.status === ReportStatus.GENERATED && (
                  <Clock size={10} />
                )}
                {report.status === ReportStatus.APPROVED && (
                  <CheckCircle size={10} />
                )}
                {report.status === ReportStatus.SENT && <Send size={10} />}
                {t(`reporting.status.${report.status.toLowerCase()}`)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyState__icon}>
            <FileText size={24} />
          </div>
          <p className={styles.emptyState__text}>No reports generated yet</p>
        </div>
      )}
    </>
  );
};

// Report Detail View
const ReportDetailView: React.FC<{
  report: Report;
  onBack: () => void;
  onApprove: (id: string) => void;
  onSend: (id: string) => void;
  t: (key: string) => string;
}> = ({ report, onBack, onApprove, onSend, t }) => (
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
        <h2 className={styles.reportDetailTitle}>{report.title}</h2>
        <span
          className={`${styles.reportItem__status} ${
            report.status === ReportStatus.SENT
              ? styles.sent
              : report.status === ReportStatus.APPROVED
              ? styles.approved
              : styles.generated
          }`}
        >
          {t(`reporting.status.${report.status.toLowerCase()}`)}
        </span>
      </div>
      <div className={styles.reportDetailBody}>
        <div className={styles.reportContent}>{report.content}</div>
      </div>
      <div className={styles.reportActions}>
        <button
          onClick={() => onApprove(report.id)}
          disabled={report.status !== ReportStatus.GENERATED}
          className={`${styles.actionButton} ${styles.approve}`}
        >
          <CheckCircle size={12} className="mr-1.5" />
          Approve
        </button>
        <button
          onClick={() => onSend(report.id)}
          disabled={report.status !== ReportStatus.APPROVED}
          className={`${styles.actionButton} ${styles.send}`}
        >
          <Send size={12} className="mr-1.5" />
          Send to Stakeholders
        </button>
      </div>
    </div>
  </div>
);

// Main App
const App: React.FC = () => {
  const { t } = useLanguage();
  const [view, setView] = useState<ViewState>("DASHBOARD");
  const [selectedPeriod, setSelectedPeriod] = useState<string>(PERIODS[0]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [kpis] = useState<KPIRecord[]>(MOCK_KPIS);
  const [reports, setReports] = useState<Report[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const activeReport = reports.find((r) => r.id === selectedReportId);

  const handleRequestReport = async () => {
    setIsGenerating(true);
    const relevantKpis = kpis.filter((k) => k.period === selectedPeriod);

    try {
      const narrative = await generateReportNarrative(
        selectedPeriod,
        relevantKpis
      );
      const newReport: Report = {
        id: crypto.randomUUID(),
        title: `Executive Summary - ${selectedPeriod}`,
        period: selectedPeriod,
        status: ReportStatus.GENERATED,
        content: narrative,
        createdAt: new Date().toISOString(),
        generatedAt: new Date().toISOString(),
        kpiSnapshot: relevantKpis,
      };
      setReports((prev) => [newReport, ...prev]);
    } catch (e) {
      console.error("Failed to generate report", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApproveReport = (id: string) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: ReportStatus.APPROVED } : r
      )
    );
  };

  const handleSendReport = (id: string) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: ReportStatus.SENT,
              sentAt: new Date().toISOString(),
            }
          : r
      )
    );
  };

  const handleSelectReport = (report: Report) => {
    setSelectedReportId(report.id);
    setView("REPORT_DETAIL");
  };

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.titleSection}>
          <h1>
            <BarChart3
              size={22}
              className="text-[var(--color-accent-primary)]"
            />
            {view === "DASHBOARD"
              ? t("reporting.dashboardTitle")
              : view === "REPORTS"
              ? t("reporting.analyticReports")
              : "Report Details"}
          </h1>
          <p>{t("reporting.dashboardSubtitle")}</p>
        </div>
      </header>

      {/* Tab Navigation */}
      {view !== "REPORT_DETAIL" && (
        <div className={styles.tabNav}>
          <button
            onClick={() => setView("DASHBOARD")}
            className={`${styles.tabButton} ${
              view === "DASHBOARD" ? styles.active : ""
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setView("REPORTS")}
            className={`${styles.tabButton} ${
              view === "REPORTS" ? styles.active : ""
            }`}
          >
            Reports
          </button>
        </div>
      )}

      {/* Content */}
      {view === "DASHBOARD" && (
        <DashboardView
          kpis={kpis}
          periods={PERIODS}
          selectedPeriod={selectedPeriod}
          onSelectPeriod={setSelectedPeriod}
          t={t}
        />
      )}
      {view === "REPORTS" && (
        <ReportListView
          reports={reports}
          onSelectReport={handleSelectReport}
          onRequestReport={handleRequestReport}
          isGenerating={isGenerating}
          t={t}
        />
      )}
      {view === "REPORT_DETAIL" && activeReport && (
        <ReportDetailView
          report={activeReport}
          onBack={() => setView("REPORTS")}
          onApprove={handleApproveReport}
          onSend={handleSendReport}
          t={t}
        />
      )}
    </div>
  );
};

export default App;
