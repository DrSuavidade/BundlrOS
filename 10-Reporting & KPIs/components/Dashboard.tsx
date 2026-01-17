import React, { useState } from "react";
import { KPIRecord } from "../types";
import KPICard from "./KPICard";
import { Calendar, Filter } from "lucide-react";
import { useLanguage } from "../../_Shared/contexts/LanguageContext";

interface DashboardProps {
  kpis: KPIRecord[];
  periods: string[];
  selectedPeriod: string;
  onSelectPeriod: (p: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  kpis,
  periods,
  selectedPeriod,
  onSelectPeriod,
}) => {
  const { t } = useLanguage();
  const filteredKPIs = kpis.filter((k) => k.period === selectedPeriod);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-[var(--color-border-subtle)]">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">
            {t("reporting.intelligenceDashboard")}
          </h1>
          <p className="text-[var(--color-text-tertiary)] mt-2 font-medium text-sm">
            {t("reporting.metricsFor")}
            <span className="text-[var(--color-accent-primary)] font-bold">
              {selectedPeriod}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <select
              value={selectedPeriod}
              onChange={(e) => onSelectPeriod(e.target.value)}
              className="pl-11 pr-10 py-2.5 bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-widest shadow-lg focus:outline-none focus:border-[var(--color-accent-primary)] appearance-none cursor-pointer hover:bg-[var(--color-bg-subtle)] transition-all"
            >
              {periods.map((p) => (
                <option
                  key={p}
                  value={p}
                  className="bg-[var(--color-bg-app)] text-[var(--color-text-primary)]"
                >
                  {p}
                </option>
              ))}
            </select>
            <Calendar className="w-4 h-4 text-[var(--color-accent-primary)] absolute left-4 top-3 pointer-events-none" />
            <div className="absolute right-4 top-3.5 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-[var(--color-text-tertiary)] pointer-events-none group-hover:border-t-[var(--color-text-primary)] transition-colors" />
          </div>
          <button className="p-3 bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-default)] shadow-lg transition-all">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredKPIs.map((kpi) => (
          <KPICard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      {filteredKPIs.length === 0 && (
        <div className="text-center py-24 bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border-subtle)] border-dashed shadow-inner">
          <div className="w-16 h-16 bg-[var(--color-bg-subtle)] rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-[var(--color-text-tertiary)] opacity-20" />
          </div>
          <p className="text-[var(--color-text-tertiary)] font-bold uppercase tracking-widest text-xs font-mono">
            {t("reporting.noData")}
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
