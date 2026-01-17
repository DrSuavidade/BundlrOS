import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  Loader2,
  AlertTriangle,
  X,
} from "lucide-react";
import { useLanguage, Button } from "@bundlros/ui";
import styles from "./App.module.css";
import ReportList from "./components/ReportList";
import ReportDetail from "./components/ReportDetail";
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
        <span className={styles.kpiCard__label}>
          {KPI_NAME_MAPPING[kpi.name]
            ? t(KPI_NAME_MAPPING[kpi.name])
            : kpi.name}
        </span>
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
const KPI_NAME_MAPPING: Record<string, string> = {
  "Total Clients": "reporting.kpis.totalClients",
  "Active Projects": "reporting.kpis.activeProjects",
  "Total Deliverables": "reporting.kpis.totalDeliverables",
  "Deliverables Published": "reporting.kpis.deliverablesPublished",
  "Recent Activity": "reporting.kpis.recentActivity",
  "Total Contract Value": "reporting.kpis.totalContractValue",
  "Active Contracts": "reporting.kpis.activeContracts",
  "Storage Usage": "reporting.kpis.storageUsage",
};

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
                  {KPI_NAME_MAPPING[activeKPI.name]
                    ? t(KPI_NAME_MAPPING[activeKPI.name])
                    : activeKPI.name}{" "}
                  - {t("reporting.trendAnalysis")}
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
          <p className={styles.emptyState__text}>{t("reporting.noData")}</p>
        </div>
      )}
    </>
  );
};

// Delete Confirmation Modal
const DeleteConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  title: string;
  description: string;
}> = ({ isOpen, onClose, onConfirm, isDeleting, title, description }) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return createPortal(
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
      onClick={onClose}
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
          {title}
        </h3>
        <p
          style={{
            margin: "0 0 1.25rem",
            fontSize: "0.75rem",
            color: "var(--color-text-secondary)",
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
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
            {t("reporting.deleteModal.cancel")}
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            style={{
              padding: "0.5rem 1rem",
              background: "var(--color-status-danger, #ef4444)",
              border: "none",
              borderRadius: "0.375rem",
              color: "white",
              fontSize: "0.75rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              opacity: isDeleting ? 0.7 : 1,
            }}
          >
            {isDeleting && <Loader2 className="animate-spin" size={12} />}
            {isDeleting
              ? t("reporting.deleteModal.deleting")
              : t("reporting.deleteModal.confirm")}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

// Main App
const App: React.FC = () => {
  const { t, language } = useLanguage();
  const [view, setView] = useState<ViewState>("DASHBOARD");
  const [periods, setPeriods] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [kpis, setKpis] = useState<KPIRecord[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: "single" | "all";
    targetId?: string;
  }>({
    isOpen: false,
    type: "single",
  });
  const [isDeleting, setIsDeleting] = useState(false);

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
        selectedPeriod,
        language,
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
        r.id === id ? { ...r, status: ReportStatus.APPROVED } : r,
      ),
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
          : r,
      ),
    );
  };

  const handleClearAllReports = () => {
    setDeleteModal({ isOpen: true, type: "all" });
  };

  const handleDeleteReport = (id: string) => {
    setDeleteModal({ isOpen: true, type: "single", targetId: id });
  };

  const handleSelectReport = (report: Report) => {
    setSelectedReportId(report.id);
    setView("REPORT_DETAIL");
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (deleteModal.type === "all") {
        // @ts-ignore
        if (ReportingService.deleteAllReports) {
          // @ts-ignore
          await ReportingService.deleteAllReports();
          setReports([]);
        }
      } else if (deleteModal.type === "single" && deleteModal.targetId) {
        // @ts-ignore
        if (ReportingService.deleteReport) {
          // @ts-ignore
          await ReportingService.deleteReport(deleteModal.targetId);
          setReports((prev) =>
            prev.filter((r) => r.id !== deleteModal.targetId),
          );
          if (view === "REPORT_DETAIL") {
            setView("REPORTS");
          }
        }
      }
    } catch (e) {
      console.error("Failed to delete report(s)", e);
    } finally {
      setIsDeleting(false);
      setDeleteModal({ isOpen: false, type: "single" });
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.titleSection}>
          <h1>
            <BarChart3
              size={22}
              style={{ color: "var(--color-accent-primary)" }}
            />
            {view === "DASHBOARD"
              ? t("reporting.dashboard")
              : view === "REPORTS"
                ? t("reporting.reports")
                : t("reporting.reportDetails")}
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
                {t("reporting.dashboard")}
              </button>
              <button
                onClick={() => setView("REPORTS")}
                className={`${styles.tabButton} ${
                  view === "REPORTS" ? styles.active : ""
                }`}
              >
                {t("reporting.reports")}
              </button>
            </div>
          </div>
        )}

        {/* Right Side Controls */}
        <div className={styles.headerControls}>
          {/* Controls moved to ReportList specific view or managed internally */}
        </div>
      </header>

      {/* Content */}
      {view === "DASHBOARD" && <DashboardView kpis={kpis} t={t} />}
      {view === "REPORTS" && (
        <ReportList
          reports={reports}
          onSelectReport={handleSelectReport}
          onRequestReport={handleRequestReport}
          onClearAll={handleClearAllReports}
          isGenerating={isGenerating}
        />
      )}
      {view === "REPORT_DETAIL" && activeReport && (
        <ReportDetail
          report={activeReport}
          onBack={() => setView("REPORTS")}
          onApprove={handleApproveReport}
          onSend={handleSendReport}
          onDelete={handleDeleteReport}
        />
      )}

      {/* Delete Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        title={
          deleteModal.type === "all"
            ? t("reporting.deleteModal.titleAll")
            : t("reporting.deleteModal.titleSingle")
        }
        description={
          deleteModal.type === "all"
            ? t("reporting.deleteModal.descAll")
            : t("reporting.deleteModal.descSingle")
        }
      />
    </div>
  );
};

export default App;
