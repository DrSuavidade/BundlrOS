import React from "react";
import styles from "./GlassCard.module.css";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = "",
  noPadding = false,
}) => {
  return (
    <div
      className={`
      ${styles.glassCard}
      ${noPadding ? "" : styles.padding}
      ${className}
    `}
    >
      {children}
    </div>
  );
};
