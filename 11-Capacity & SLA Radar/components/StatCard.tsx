import React from "react";
import { LucideIcon } from "lucide-react";
import styles from "../App.module.css";

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
  color = "default",
}) => {
  return (
    <div className={styles.statCard}>
      <div className={styles.statInfo}>
        <span className={styles.statLabel}>{label}</span>
        <span
          className={`${styles.statValue} ${
            color !== "default" ? styles[color] : ""
          }`}
        >
          {value}
        </span>
        {subtext && <span className={styles.statSubtext}>{subtext}</span>}
      </div>
      <div className={`${styles.statIcon} ${styles[color]}`}>
        <Icon size={16} />
      </div>
    </div>
  );
};

export default StatCard;
