import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  color?: "default" | "rose" | "amber" | "emerald";
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  trend,
  color = "default",
}) => {
  const colorClass = {
    default: "text-[var(--color-text-primary)]",
    rose: "text-[var(--color-status-danger)]",
    amber: "text-[var(--color-status-warning)]",
    emerald: "text-[var(--color-status-success)]",
  }[color];

  const iconBgClass = {
    default: "bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)]",
    rose: "bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger)] border-[rgba(239,68,68,0.2)]",
    amber:
      "bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning)] border-[rgba(245,158,11,0.2)]",
    emerald:
      "bg-[var(--color-status-success-bg)] text-[var(--color-status-success)] border-[rgba(16,185,129,0.2)]",
  }[color];

  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl p-6 shadow-xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all group overflow-hidden">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-[0.1em]">
            {label}
          </p>
          <div className="flex items-baseline gap-1">
            <h3 className={`text-3xl font-bold tracking-tight ${colorClass}`}>
              {value}
            </h3>
          </div>
          {subtext && (
            <p className="text-[10px] text-[var(--color-text-tertiary)] mt-1 font-medium">
              {subtext}
            </p>
          )}
        </div>
        <div
          className={`p-3 rounded-xl border transition-colors ${iconBgClass}`}
        >
          <Icon size={18} />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 h-1 bg-[var(--color-accent-primary)] w-0 group-hover:w-full transition-all duration-500 opacity-30" />
    </div>
  );
};

export default StatCard;
