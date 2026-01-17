import React from "react";
import { Deliverable, QAStatus } from "../types";
import {
  ChevronRight,
  ShieldCheck,
  AlertOctagon,
  Clock,
  Layers,
} from "lucide-react";
import { useLanguage } from "../../_Shared/contexts/LanguageContext";

interface DashboardProps {
  deliverables: Deliverable[];
  onSelect: (deliverable: Deliverable) => void;
  isRunningId: string | null;
}

export const Dashboard: React.FC<DashboardProps> = ({
  deliverables,
  onSelect,
  isRunningId,
}) => {
  const { t } = useLanguage();
  const getStatusColor = (status: QAStatus) => {
    switch (status) {
      case "passed":
        return "bg-[var(--color-status-success)]";
      case "failed":
        return "bg-[var(--color-status-danger)]";
      case "running":
        return "bg-[var(--color-status-info)]";
      default:
        return "bg-[var(--color-text-tertiary)]";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[var(--color-bg-card)] p-6 rounded-xl border border-[var(--color-border-subtle)] shadow-lg flex items-center gap-4 hover:border-[var(--color-accent-primary)] transition-all">
          <div className="p-3 bg-[var(--color-status-success-bg)] text-[var(--color-status-success)] rounded-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-3xl font-bold text-[var(--color-text-primary)]">
              {
                deliverables.filter((d) => d.lastResult.status === "passed")
                  .length
              }
            </div>
            <div className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">
              {t("qa.passed")}
            </div>
          </div>
        </div>
        <div className="bg-[var(--color-bg-card)] p-6 rounded-xl border border-[var(--color-border-subtle)] shadow-lg flex items-center gap-4 hover:border-[var(--color-status-danger)] transition-all">
          <div className="p-3 bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger)] rounded-lg">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-3xl font-bold text-[var(--color-text-primary)]">
              {
                deliverables.filter((d) => d.lastResult.status === "failed")
                  .length
              }
            </div>
            <div className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">
              {t("qa.failedGates")}
            </div>
          </div>
        </div>
        <div className="bg-[var(--color-bg-card)] p-6 rounded-xl border border-[var(--color-border-subtle)] shadow-lg flex items-center gap-4 hover:border-[var(--color-accent-primary)] transition-all">
          <div className="p-3 bg-[var(--color-accent-subtle)] text-[var(--color-accent-primary)] rounded-lg">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-3xl font-bold text-[var(--color-text-primary)]">
              {deliverables.length}
            </div>
            <div className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">
              {t("qa.activeAssets")}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[var(--color-bg-card)] rounded-xl shadow-xl border border-[var(--color-border-subtle)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] flex justify-between items-center">
          <h2 className="font-semibold text-[var(--color-text-primary)]">
            {t("qa.activeDeliverables")}
          </h2>
          <span className="text-[10px] text-[var(--color-text-tertiary)] font-mono uppercase tracking-widest">
            n8n:gatekeeper_active
          </span>
        </div>
        <div className="divide-y divide-[var(--color-border-subtle)]">
          {deliverables.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              className="group px-6 py-5 hover:bg-[var(--color-bg-subtle)] transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-2 h-2 rounded-full ${getStatusColor(
                    isRunningId === item.id
                      ? "running"
                      : item.lastResult.status,
                  )} shadow-[0_0_8px_rgba(0,0,0,0.5)]`}
                />
                <div>
                  <h3 className="font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-primary)] transition-colors">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] px-2 py-0.5 bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] rounded border border-[var(--color-border-subtle)] font-bold uppercase tracking-wider">
                      {item.type}
                    </span>
                    <span className="text-[10px] text-[var(--color-text-tertiary)] font-mono flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {new Date(item.lastResult.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div
                    className={`text-xs font-bold tracking-widest ${
                      isRunningId === item.id
                        ? "text-[var(--color-status-info)]"
                        : item.lastResult.status === "passed"
                          ? "text-[var(--color-status-success)]"
                          : "text-[var(--color-status-danger)]"
                    }`}
                  >
                    {isRunningId === item.id
                      ? t("qa.running").toUpperCase() + "..."
                      : item.lastResult.status.toUpperCase()}
                  </div>
                  {item.lastResult.status !== "passed" && !isRunningId && (
                    <div className="text-[10px] text-[var(--color-text-tertiary)] mt-1 font-medium">
                      {
                        item.lastResult.checklist.filter(
                          (c) => c.status === "failed",
                        ).length
                      }{" "}
                      {t("qa.issuesFound")}
                    </div>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-primary)] transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
