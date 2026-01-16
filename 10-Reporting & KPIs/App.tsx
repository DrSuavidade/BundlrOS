import React, { useState, useEffect } from "react";
import { ViewState, KPIRecord, KPIUnit, Report, ReportStatus } from "./types";
import { ReportingService } from "./services";
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
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// KPI Card Component
const KPICard: React.FC<{
  kpi: KPIRecord;
  t: (key: string) => string;
  selected?: boolean;
  onClick?: () => void;
}> = ({ kpi, t, selected, onClick }) => {
  // Calculate delta percentage
  const delta =
    kpi.previousValue !== 0
      ? ((kpi.value - kpi.previousValue) / kpi.previousValue) * 100
      : 0;
  const isUp = delta >= 0;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatValue = (value: number, unit: KPIUnit): string => {
    switch (unit) {
      case KPIUnit.CURRENCY:
        return `€${value.toLocaleString()}`;
      case KPIUnit.PERCENTAGE:
        return `${value.toFixed(1)}%`;
      case KPIUnit.BYTES:
        return formatBytes(value);
      case KPIUnit.NUMBER:
      default:
        return value.toLocaleString();
    }
  };

  const formatted = formatValue(kpi.value, kpi.unit);

  return (
    <div
      className={`${styles.kpiCard} ${selected ? styles.selected : ""}`}
      onClick={onClick}
    >
      <div className={styles.kpiCard__header}>
        <span className={styles.kpiCard__label}>{kpi.name}</span>
        <span
          className={`${styles.kpiCard__trend} ${
            isUp ? styles.up : styles.down
          }`}
        >
          {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {Math.abs(delta).toFixed(1)}%
        </span>
      </div>
      <div className={styles.kpiCard__value}>{formatted}</div>
    </div>
  );
};

// Dashboard View
const DashboardView: React.FC<{
  kpis: KPIRecord[];
  t: (key: string) => string;
}> = ({ kpis, t }) => {
  const [selectedKPIId, setSelectedKPIId] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<"1W" | "1M" | "6M" | "1Y">("1W");

  // Filter keys doesn't apply the same way as before since we aren't using "selectedPeriod" from the dropdown.
  // Instead, we show the snapshot for the current moment, but we might want to filter history by range.
  // For now, let's just use all KPIs as the "current" view since the period selector is gone.
  // We assume kpis passed in are the latest snapshot.

  const filteredKPIs = kpis;

  // Initialize selection
  useEffect(() => {
    if (filteredKPIs.length > 0 && !selectedKPIId) {
      setSelectedKPIId(filteredKPIs[0].id);
    }
  }, [filteredKPIs, selectedKPIId]);

  const activeKPI =
    filteredKPIs.find((k) => k.id === selectedKPIId) || filteredKPIs[0];

  // Filter history based on time range
  const chartData = React.useMemo(() => {
    if (!activeKPI?.history) return [];

    const now = new Date();
    const cutoff = new Date();

    switch (timeRange) {
      case "1W":
        cutoff.setDate(now.getDate() - 7);
        break;
      case "1M":
        cutoff.setDate(now.getDate() - 30);
        break;
      case "6M":
        cutoff.setDate(now.getDate() - 180);
        break;
      case "1Y":
        cutoff.setDate(now.getDate() - 365);
        break;
      default:
        cutoff.setDate(now.getDate() - 7);
    }

    return activeKPI.history.filter((point) => new Date(point.date) >= cutoff);
  }, [activeKPI, timeRange]);

  return (
    <>
      {filteredKPIs.length > 0 ? (
        <>
          {/* Scrollable KPI Line */}
          <div className={styles.kpiGrid}>
            {filteredKPIs.map((kpi) => (
              <KPICard
                key={kpi.id}
                kpi={kpi}
                t={t}
                selected={kpi.id === activeKPI?.id}
                onClick={() => setSelectedKPIId(kpi.id)}
              />
            ))}
          </div>

          {/* Chart Section */}
          {activeKPI && (
            <div className={styles.mainChartSection}>
              <div
                className={styles.chartHeader}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingRight: "16px",
                }}
              >
                <h3 className={styles.chartTitle}>
                  {activeKPI.name} - Trend Analysis
                </h3>
                <div
                  style={{
                    display: "flex",
                    background: "var(--color-bg-subtle)",
                    padding: "2px",
                    borderRadius: "6px",
                    border: "1px solid var(--color-border-subtle)",
                  }}
                >
                  {(["1W", "1M", "6M", "1Y"] as const).map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      style={{
                        border: "none",
                        background:
                          timeRange === range
                            ? "var(--color-bg-elevated)"
                            : "transparent",
                        color:
                          timeRange === range
                            ? "var(--color-text-primary)"
                            : "var(--color-text-tertiary)",
                        fontSize: "10px",
                        fontWeight: 500,
                        padding: "4px 8px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        lineHeight: "1",
                        boxShadow:
                          timeRange === range
                            ? "0 1px 2px rgba(0,0,0,0.1)"
                            : "none",
                      }}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorValue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="var(--color-accent-primary)"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-accent-primary)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      stroke="var(--color-text-tertiary)"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis
                      stroke="var(--color-text-tertiary)"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) =>
                        activeKPI.unit === KPIUnit.CURRENCY
                          ? `€${value.toLocaleString()}`
                          : activeKPI.unit === KPIUnit.BYTES
                          ? value > 1073741824
                            ? `${(value / 1073741824).toFixed(1)}GB`
                            : `${(value / 1048576).toFixed(1)}MB`
                          : value.toLocaleString()
                      }
                    />
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                      vertical={false}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "var(--color-bg-elevated)",
                        border: "1px solid var(--color-border-subtle)",
                        borderRadius: "8px",
                      }}
                      itemStyle={{ color: "var(--color-text-primary)" }}
                      labelStyle={{ color: "var(--color-text-tertiary)" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="var(--color-accent-primary)"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorValue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
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
  t: (key: string) => string;
}> = ({ reports, onSelectReport, t }) => {
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
  const [periods, setPeriods] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [kpis, setKpis] = useState<KPIRecord[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const availablePeriods = ReportingService.getPeriods();
        setPeriods(availablePeriods);
        setSelectedPeriod(availablePeriods[0] || "");

        const kpiData = await ReportingService.getKPIs(availablePeriods[0]);
        setKpis(kpiData);

        const reportsData = await ReportingService.getReports();
        setReports(reportsData);
      } catch (error) {
        console.error("[Reporting] Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Reload KPIs when period changes
  useEffect(() => {
    if (!selectedPeriod) return;
    const loadKpis = async () => {
      const kpiData = await ReportingService.getKPIs(selectedPeriod);
      setKpis(kpiData);
    };
    loadKpis();
  }, [selectedPeriod]);

  const activeReport = reports.find((r) => r.id === selectedReportId);

  const handleRequestReport = async () => {
    setIsGenerating(true);
    try {
      const newReport = await ReportingService.createReport(
        `Executive Summary - ${selectedPeriod}`,
        selectedPeriod
      );
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
              ? t("Analytics")
              : view === "REPORTS"
              ? t("Analytics")
              : "Report Details"}
          </h1>
        </div>

        {/* Tab Navigation - Centered in Header */}
        {view !== "REPORT_DETAIL" && (
          <div className={styles.headerCenter}>
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
          </div>
        )}

        {/* Right Side Controls */}
        <div className={styles.headerControls}>
          {view === "REPORTS" && (
            <button
              onClick={handleRequestReport}
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
          )}
        </div>
      </header>

      {/* Content */}
      {view === "DASHBOARD" && <DashboardView kpis={kpis} t={t} />}
      {view === "REPORTS" && (
        <ReportListView
          reports={reports}
          onSelectReport={handleSelectReport}
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
