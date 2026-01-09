import React, { useState, useEffect, useCallback } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  BrainCircuit,
  LayoutDashboard,
  RefreshCw,
  ShieldAlert,
  Zap,
} from "lucide-react";
import { Client, IntakeItem, RiskLevel, SystemEvent } from "./types";
import { MOCK_CLIENTS, MOCK_INTAKE } from "./constants";
import { analyzeRisks } from "./services/geminiService";
import StatCard from "./components/StatCard";
import CapacityChart from "./components/CapacityChart";
import RiskTable from "./components/RiskTable";
import ActionableList from "./components/ActionableList";

import { AppShell, Button } from "@bundlros/ui";

function App() {
  // State
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [intakeItems, setIntakeItems] = useState<IntakeItem[]>(MOCK_INTAKE);
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  // Derived Metrics
  const avgSla = clients.reduce((acc, c) => acc + c.sla, 0) / clients.length;
  const totalCapacity =
    clients.reduce((acc, c) => acc + c.capacityUsage, 0) / clients.length;
  const highRiskCount = clients.filter((c) => c.riskScore > 60).length;

  // Simulation: External task reader / Backend events
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Randomly fluctuate capacity to simulate live data
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

      // 2. Randomly trigger events (Backend Logic Simulation)
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

        // Create automatic intake item
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
    <div className="page-container">
      {/* Module Sub-Header */}
      <header className="page-header">
        <div className="page-header__content">
          <h1 className="page-header__title">Operational Overview</h1>
          <p className="page-header__subtitle">
            Real-time monitoring of client capacity and SLA compliance
          </p>
        </div>

        <div className="page-header__actions">
          {events.length > 0 && (
            <div className="status-pill status-pill--live">
              <Zap size={14} className="text-amber-400" />
              <span>Live: {events[0].message}</span>
            </div>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            leftIcon={
              isAnalyzing ? (
                <RefreshCw className="animate-spin" size={14} />
              ) : (
                <BrainCircuit size={14} />
              )
            }
          >
            AI Analysis
          </Button>
        </div>
      </header>

      <div className="space-y-8 max-w-7xl">
        {/* AI Analysis Result */}
        {aiAnalysis && (
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-accent-primary)]/30 rounded-xl p-6 shadow-2xl relative overflow-hidden animate-fade-in">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[var(--color-accent-primary)] to-purple-500"></div>
            <h3 className="text-sm font-semibold text-[var(--color-accent-primary)] flex items-center gap-2 mb-4">
              <BrainCircuit size={18} />
              Strategic Insight
            </h3>
            <div className="text-[var(--color-text-secondary)]">
              <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed">
                {aiAnalysis}
              </pre>
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Avg SLA Performance"
            value={`${avgSla.toFixed(1)}%`}
            subtext="Target: 95.0%"
            icon={Activity}
            color={avgSla < 95 ? "amber" : "emerald"}
          />
          <StatCard
            label="Team Capacity"
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
            label="Clients at Risk"
            value={highRiskCount}
            subtext="Requires immediate attention"
            icon={AlertTriangle}
            color={highRiskCount > 0 ? "rose" : "emerald"}
          />
          <StatCard
            label="Actionable Items"
            value={intakeItems.length}
            subtext="Auto-generated intake"
            icon={Zap}
            color="default"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Charts & Tables */}
          <div className="lg:col-span-2 space-y-8">
            {/* Capacity Chart */}
            <section className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Capacity Load Distribution
                </h3>
                <span className="text-[10px] font-medium text-[var(--color-text-tertiary)] px-2 py-1 bg-[var(--color-bg-subtle)] rounded border border-[var(--color-border-subtle)]">
                  Real-time
                </span>
              </div>
              <CapacityChart data={clients} />
            </section>

            {/* Risk Table */}
            <section className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-[var(--color-border-subtle)]">
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Client Risk Monitor
                </h3>
              </div>
              <RiskTable clients={clients} />
            </section>
          </div>

          {/* Right Column: Actionable List */}
          <div className="lg:col-span-1">
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl p-6 shadow-sm sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Intake Queue
                </h3>
                <span className="text-[10px] bg-[var(--color-accent-subtle)] text-[var(--color-accent-primary)] px-2 py-1 rounded-full font-medium">
                  {intakeItems.length} Pending
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-tertiary)] mb-4">
                Automatically generated from backend events and external task
                ingestion.
              </p>
              <div className="max-h-[500px] overflow-y-auto pr-2">
                <ActionableList
                  items={intakeItems}
                  onResolve={handleResolveIntake}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
