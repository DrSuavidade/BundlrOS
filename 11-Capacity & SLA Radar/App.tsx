import React, { useState, useEffect } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  BrainCircuit,
  Gauge,
  RefreshCw,
  Zap,
} from "lucide-react";
import { Client, IntakeItem, RiskLevel, SystemEvent } from "./types";
import { CapacityService } from "./services";
import { analyzeRisks } from "./services/geminiService";
import StatCard from "./components/StatCard";
import CapacityChart from "./components/CapacityChart";
import RiskTable from "./components/RiskTable";
import ActionableList from "./components/ActionableList";
import { useLanguage } from "@bundlros/ui";
import styles from "./App.module.css";

function App() {
  const { t } = useLanguage();
  const [clients, setClients] = useState<Client[]>([]);
  const [intakeItems, setIntakeItems] = useState<IntakeItem[]>([]);
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load initial data from service
  useEffect(() => {
    const loadData = async () => {
      try {
        const clientsData = await CapacityService.getClients();
        setClients(clientsData);

        const intakeData = CapacityService.getIntakeItems();
        setIntakeItems(intakeData);
      } catch (error) {
        console.error("[Capacity] Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Derived Metrics
  const avgSla = clients.reduce((acc, c) => acc + c.sla, 0) / clients.length;
  const totalCapacity =
    clients.reduce((acc, c) => acc + c.capacityUsage, 0) / clients.length;
  const highRiskCount = clients.filter((c) => c.riskScore > 60).length;

  // Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setClients((prev) =>
        prev.map((c) => ({
          ...c,
          capacityUsage: Math.min(
            100,
            Math.max(0, c.capacityUsage + (Math.random() * 10 - 5))
          ),
          sla: Math.min(100, Math.max(80, c.sla + (Math.random() * 2 - 1))),
        }))
      );

      if (Math.random() > 0.8) {
        const eventType =
          Math.random() > 0.5 ? "ops.capacity_risk" : "ops.sla_risk";
        const targetClient =
          clients[Math.floor(Math.random() * clients.length)];

        const newEvent: SystemEvent = {
          id: Date.now().toString(),
          type: eventType as any,
          message: `${targetClient.name}: ${
            eventType === "ops.capacity_risk"
              ? "Capacity spike detected"
              : "SLA trending down"
          }`,
          timestamp: Date.now(),
        };

        setEvents((prev) => [newEvent, ...prev].slice(0, 5));

        const newItem: IntakeItem = {
          id: `auto-${Date.now()}`,
          description: `Check ${targetClient.name} - ${eventType
            .split(".")[1]
            .replace("_", " ")}`,
          type:
            eventType === "ops.capacity_risk"
              ? "capacity_warning"
              : "sla_breach",
          severity: RiskLevel.MEDIUM,
          timestamp: Date.now(),
          status: "new",
        };
        setIntakeItems((prev) => [newItem, ...prev]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [clients]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    const result = await analyzeRisks(clients, intakeItems);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleResolveIntake = (id: string) => {
    setIntakeItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>
            <Gauge size={22} style={{ color: "var(--color-accent-primary)" }} />
            {t("capacity.title")}
          </h1>
          <p>{t("capacity.subtitle")}</p>
        </div>

        <div className={styles.headerActions}>
          {events.length > 0 && (
            <div className={styles.liveIndicator}>
              <Zap size={12} />
              {events[0].message}
            </div>
          )}
          <button
            className={styles.actionButton}
            onClick={handleAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <RefreshCw
                size={14}
                style={{ animation: "spin 1s linear infinite" }}
              />
            ) : (
              <BrainCircuit size={14} />
            )}
            {t("capacity.aiAnalysis")}
          </button>
        </div>
      </div>

      {/* AI Analysis Result */}
      {aiAnalysis && (
        <div className={styles.aiAnalysis}>
          <h3 className={styles.aiAnalysisTitle}>
            <BrainCircuit size={16} />
            {t("capacity.strategicInsight")}
          </h3>
          <pre className={styles.aiAnalysisContent}>{aiAnalysis}</pre>
        </div>
      )}

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <StatCard
          label={t("capacity.avgSla")}
          value={`${avgSla.toFixed(1)}%`}
          subtext="Target: 95.0%"
          icon={Activity}
          color={avgSla < 95 ? "amber" : "emerald"}
        />
        <StatCard
          label={t("capacity.teamCapacity")}
          value={`${totalCapacity.toFixed(0)}%`}
          subtext="Optimal range: 70-85%"
          icon={BarChart3}
          color={
            totalCapacity > 85
              ? "rose"
              : totalCapacity < 50
              ? "amber"
              : "emerald"
          }
        />
        <StatCard
          label={t("capacity.highRiskClients")}
          value={highRiskCount}
          subtext="Requires immediate attention"
          icon={AlertTriangle}
          color={highRiskCount > 0 ? "rose" : "emerald"}
        />
        <StatCard
          label={t("capacity.actionableItems")}
          value={intakeItems.length}
          subtext="Auto-generated intake"
          icon={Zap}
          color="default"
        />
      </div>

      {/* Content Grid */}
      <div className={styles.contentGrid}>
        {/* Main Column */}
        <div className={styles.mainColumn}>
          {/* Capacity Chart */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>
                Capacity Load Distribution
              </span>
              <span className={styles.sectionBadge}>Real-time</span>
            </div>
            <div className={styles.sectionBody}>
              <CapacityChart data={clients} />
            </div>
          </div>

          {/* Risk Table */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>
                {t("capacity.riskTable")}
              </span>
            </div>
            <RiskTable clients={clients} t={t} />
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarHeader}>
              <span className={styles.sidebarTitle}>Intake Queue</span>
              <span className={styles.countBadge}>
                {intakeItems.length} Pending
              </span>
            </div>
            <p className={styles.sidebarDescription}>
              Automatically generated from backend events and external task
              ingestion.
            </p>
            <div className={styles.sidebarList}>
              <ActionableList
                items={intakeItems}
                onResolve={handleResolveIntake}
                t={t}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
