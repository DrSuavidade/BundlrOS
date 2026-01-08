import React from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { KPIRecord, KPIUnit } from "../types";
import styles from "./KPICard.module.css";

interface KPICardProps {
  kpi: KPIRecord;
}

const KPICard: React.FC<KPICardProps> = ({ kpi }) => {
  const delta = ((kpi.value - kpi.previousValue) / kpi.previousValue) * 100;
  const isPositive = delta > 0;
  const isNeutral = delta === 0;

  const isInverse =
    kpi.name.toLowerCase().includes("churn") ||
    kpi.name.toLowerCase().includes("cost");

  const getTrendClass = () => {
    if (isNeutral) return styles.trendNeutral;
    if (isInverse) {
      return isPositive ? styles.trendNegative : styles.trendPositive;
    }
    return isPositive ? styles.trendPositive : styles.trendNegative;
  };

  const formatValue = (val: number, unit: KPIUnit) => {
    if (unit === KPIUnit.CURRENCY)
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(val);
    if (unit === KPIUnit.PERCENTAGE) return `${val.toFixed(1)}%`;
    return new Intl.NumberFormat("en-US").format(val);
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.name}>{kpi.name}</h3>
        <span className={`${styles.trendBadge} ${getTrendClass()}`}>
          {isPositive && <ArrowUpRight className="w-3 h-3 mr-1" />}
          {!isPositive && !isNeutral && (
            <ArrowDownRight className="w-3 h-3 mr-1" />
          )}
          {isNeutral && <Minus className="w-3 h-3 mr-1" />}
          {Math.abs(delta).toFixed(1)}%
        </span>
      </div>
      <div className={styles.valueContainer}>
        <span className={styles.value}>{formatValue(kpi.value, kpi.unit)}</span>
        <span className={styles.comparison}>vs last period</span>
      </div>
    </div>
  );
};

export default KPICard;
