import React from "react";
import { Client } from "../types";
import { AlertTriangle, Activity } from "lucide-react";
import styles from "../App.module.css";

interface RiskTableProps {
  clients: Client[];
  t: (key: string) => string;
}

const RiskTable: React.FC<RiskTableProps> = ({ clients, t }) => {
  const sortedClients = [...clients].sort((a, b) => b.riskScore - a.riskScore);

  const getRiskColor = (score: number) => {
    if (score > 70) return "rose";
    if (score > 40) return "amber";
    return "emerald";
  };

  const getSlaColor = (sla: number) => {
    if (sla < 90) return "rose";
    if (sla < 95) return "amber";
    return "emerald";
  };

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>{t("approvals.client")}</th>
          <th style={{ textAlign: "center" }}>{t("capacity.riskScore")}</th>
          <th style={{ textAlign: "center" }}>{t("capacity.slaStatus")}</th>
          <th style={{ textAlign: "center" }}>{t("capacity.churnRisk")}</th>
        </tr>
      </thead>
      <tbody>
        {sortedClients.map((client) => {
          const riskColor = getRiskColor(client.riskScore);
          const slaColor = getSlaColor(client.sla);

          return (
            <tr key={client.id}>
              <td
                style={{ fontWeight: 500, color: "var(--color-text-primary)" }}
              >
                {client.name}
              </td>
              <td style={{ textAlign: "center" }}>
                <div className={styles.progressBar}>
                  <div className={styles.progressTrack}>
                    <div
                      className={`${styles.progressFill} ${styles[riskColor]}`}
                      style={{ width: `${client.riskScore}%` }}
                    />
                  </div>
                  <span
                    className={styles.progressValue}
                    style={{
                      color:
                        riskColor === "rose"
                          ? "rgb(244, 63, 94)"
                          : "var(--color-text-tertiary)",
                    }}
                  >
                    {client.riskScore}%
                  </span>
                </div>
              </td>
              <td style={{ textAlign: "center" }}>
                <span className={`${styles.statusBadge} ${styles[slaColor]}`}>
                  <Activity size={10} />
                  {client.sla.toFixed(1)}%
                </span>
              </td>
              <td style={{ textAlign: "center" }}>
                {client.churnRisk ? (
                  <span className={styles.churnRisk}>
                    <AlertTriangle size={12} />
                    HIGH
                  </span>
                ) : (
                  <span style={{ color: "var(--color-text-tertiary)" }}>-</span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default RiskTable;
