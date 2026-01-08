import React from "react";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "neutral" | "info";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  className = "",
}) => {
  const colors = {
    success:
      "bg-[var(--color-status-success-bg)] text-[var(--color-status-success)] border-[var(--color-status-success)]",
    warning:
      "bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning)] border-[var(--color-status-warning)]",
    danger:
      "bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger)] border-[var(--color-status-danger)]",
    neutral:
      "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)]",
    info: "bg-[var(--color-status-info-bg)] text-[var(--color-status-info)] border-[var(--color-status-info)]",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${colors[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
