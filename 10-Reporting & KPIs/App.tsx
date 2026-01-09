import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import ReportList from "./components/ReportList";
import ReportDetail from "./components/ReportDetail";
import { ViewState, KPIRecord, Report, ReportStatus } from "./types";
import { MOCK_KPIS, PERIODS } from "./data/mockData";
import { generateReportNarrative } from "./services/geminiService";

import { AppShell } from "@bundlros/ui";

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>("DASHBOARD");
  const [selectedPeriod, setSelectedPeriod] = useState<string>(PERIODS[0]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Simulated Backend State
  const [kpis] = useState<KPIRecord[]>(MOCK_KPIS);
  const [reports, setReports] = useState<Report[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Derived state
  const activeReport = reports.find((r) => r.id === selectedReportId);

  // Handlers
  const handleRequestReport = async () => {
    setIsGenerating(true);

    // Simulate Event: report.requested
    console.log(`Event: report.requested for period ${selectedPeriod}`);

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
      console.log(`Event: report.generated`, newReport.id);
    } catch (e) {
      console.error("Failed to generate report", e);
      alert("Failed to generate report using Gemini API. Check console.");
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
    // Simulate sending back to backend
    console.log(`Event: report.approved`, id);
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
    // Simulate integration with email/n8n
    console.log(`Event: report.sent`, id);
    alert("Report sent to stakeholders successfully!");
  };

  const handleSelectReport = (report: Report) => {
    setSelectedReportId(report.id);
    setView("REPORT_DETAIL");
  };

  // View Routing
  const renderContent = () => {
    switch (view) {
      case "DASHBOARD":
        return (
          <Dashboard
            kpis={kpis}
            periods={PERIODS}
            selectedPeriod={selectedPeriod}
            onSelectPeriod={setSelectedPeriod}
          />
        );
      case "REPORTS":
        return (
          <ReportList
            reports={reports}
            onSelectReport={handleSelectReport}
            onRequestReport={handleRequestReport}
            isGenerating={isGenerating}
          />
        );
      case "REPORT_DETAIL":
        if (!activeReport) return <div>Report not found</div>;
        return (
          <ReportDetail
            report={activeReport}
            onBack={() => setView("REPORTS")}
            onApprove={handleApproveReport}
            onSend={handleSendReport}
          />
        );
      default:
        return <div>Unknown View</div>;
    }
  };

  return (
    <div className="flex h-full">
      <Sidebar currentView={view} onChangeView={setView} />
      <main className="flex-1 overflow-y-auto">
        <div className="page-container p-8">
          <header className="page-header">
            <div className="page-header__content">
              <h1 className="page-header__title">
                {view === "DASHBOARD"
                  ? "KPI Overview"
                  : view === "REPORTS"
                  ? "Analytic Reports"
                  : "Report Details"}
              </h1>
              <p className="page-header__subtitle">
                Executive reporting and performance intelligence
              </p>
            </div>
          </header>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
