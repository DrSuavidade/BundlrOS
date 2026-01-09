import React from "react";
import { DeliverableStatus } from "../../types";

interface StatusPillProps {
  status: string;
  size?: "sm" | "md";
}

const getColors = (status: string): string => {
  switch (status) {
    // Deliverable Statuses - Dark theme optimized
    case DeliverableStatus.DRAFT:
      return "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)]";
    case DeliverableStatus.AWAITING_APPROVAL:
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case DeliverableStatus.APPROVED:
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case DeliverableStatus.IN_QA:
      return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    case DeliverableStatus.QA_FAILED:
      return "bg-red-500/10 text-red-400 border-red-500/20";
    case DeliverableStatus.READY:
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case DeliverableStatus.PUBLISHED:
      return "bg-[var(--color-accent-subtle)] text-[var(--color-accent-primary)] border-[var(--color-accent-primary)]/20";
    case DeliverableStatus.ARCHIVED:
      return "bg-[var(--color-bg-subtle)] text-[var(--color-text-tertiary)] border-[var(--color-border-subtle)]";

    // Generic Statuses
    case "active":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "inactive":
      return "bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)] border-[var(--color-border-subtle)]";
    case "pending":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "completed":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";

    default:
      return "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)]";
  }
};

const formatLabel = (status: string): string => {
  return status.replace(/_/g, " ").toUpperCase();
};

export const StatusPill: React.FC<StatusPillProps> = ({
  status,
  size = "sm",
}) => {
  const colors = getColors(status);
  const padding =
    size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center justify-center font-semibold border rounded-md tracking-wide ${colors} ${padding}`}
    >
      {formatLabel(status)}
    </span>
  );
};
