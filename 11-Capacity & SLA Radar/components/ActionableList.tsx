import React from "react";
import { IntakeItem, RiskLevel } from "../types";
import { AlertCircle, CheckCircle2, Clock, ArrowRight } from "lucide-react";

interface ActionableListProps {
  items: IntakeItem[];
  onResolve: (id: string) => void;
}

const ActionableList: React.FC<ActionableListProps> = ({
  items,
  onResolve,
}) => {
  const getIcon = (type: IntakeItem["type"]) => {
    switch (type) {
      case "capacity_warning":
        return (
          <AlertCircle
            className="text-[var(--color-status-danger)]"
            size={16}
          />
        );
      case "sla_breach":
        return (
          <Clock className="text-[var(--color-status-warning)]" size={16} />
        );
      case "churn_alert":
        return (
          <AlertCircle
            className="text-[var(--color-status-danger)]"
            size={16}
          />
        );
      case "new_request":
        return (
          <ArrowRight className="text-[var(--color-status-info)]" size={16} />
        );
      default:
        return <AlertCircle size={16} />;
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-[var(--color-text-tertiary)] bg-[var(--color-bg-subtle)] border border-dashed border-[var(--color-border-subtle)] rounded-xl">
        <div className="w-12 h-12 bg-[var(--color-bg-elevated)] rounded-full flex items-center justify-center mb-3">
          <CheckCircle2 size={24} className="opacity-30" />
        </div>
        <p className="text-xs font-bold uppercase tracking-widest\">
          All systems nominal
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className={`
            group flex items-start justify-between p-5 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]/30 hover:bg-[var(--color-bg-elevated)]/50 transition-all hover:border-[var(--color-border-default)]
            ${
              item.severity === RiskLevel.CRITICAL
                ? "border-l-4 border-l-[var(--color-status-danger)]"
                : ""
            }
            ${
              item.severity === RiskLevel.HIGH
                ? "border-l-4 border-l-[var(--color-status-warning)]"
                : ""
            }
          `}
        >
          <div className="flex gap-4">
            <div className="mt-1 shrink-0">{getIcon(item.type)}</div>
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)] leading-tight group-hover:text-[var(--color-accent-primary)] transition-colors">
                {item.description}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-widest font-bold">
                  {item.type.replace("_", " ")}
                </span>
                <div className="w-1 h-1 rounded-full bg-[var(--color-border-subtle)]" />
                <span className="text-[10px] text-[var(--color-text-tertiary)] font-mono">
                  {new Date(item.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onResolve(item.id)}
            className="p-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-status-success)] hover:bg-[var(--color-status-success-bg)] rounded-lg transition-all"
            title="Mark as Resolved"
          >
            <CheckCircle2 size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ActionableList;
