import React from "react";
import { Integration, HealthStatus, PROVIDERS } from "../types";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Power,
  XCircle,
  Settings,
  RefreshCw,
} from "lucide-react";
import styles from "./IntegrationCard.module.css";

interface IntegrationCardProps {
  integration: Integration;
  onManage: (integration: Integration) => void;
  onToggle: (integration: Integration) => void;
  onTest: (integration: Integration) => void;
  isTesting: boolean;
  t: (key: string) => string;
}

export const IntegrationCard: React.FC<IntegrationCardProps> = ({
  integration,
  onManage,
  onToggle,
  onTest,
  isTesting,
  t,
}) => {
  const provider = PROVIDERS[integration.providerId];

  const getBadgeClass = (status: HealthStatus) => {
    switch (status) {
      case HealthStatus.HEALTHY:
        return styles.badgeHealthy;
      case HealthStatus.DEGRADED:
        return styles.badgeDegraded;
      case HealthStatus.FAILED:
        return styles.badgeFailed;
      case HealthStatus.INACTIVE:
        return styles.badgeInactive;
      default:
        return styles.badgeInactive;
    }
  };

  const getStatusIcon = (status: HealthStatus) => {
    switch (status) {
      case HealthStatus.HEALTHY:
        return <CheckCircle className="w-3.5 h-3.5" />;
      case HealthStatus.DEGRADED:
        return <AlertTriangle className="w-3.5 h-3.5" />;
      case HealthStatus.FAILED:
        return <XCircle className="w-3.5 h-3.5" />;
      case HealthStatus.INACTIVE:
        return <Power className="w-3.5 h-3.5" />;
      default:
        return <Activity className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.providerInfo}>
          <div className={styles.providerLogo}>{provider?.logo || "?"}</div>
          <div>
            <h3 className={styles.title}>{integration.name}</h3>
            <p className={styles.subtitle}>{provider?.name}</p>
          </div>
        </div>
        <div className={`${styles.badge} ${getBadgeClass(integration.status)}`}>
          {getStatusIcon(integration.status)}
          <span>{t(`admin.status.${integration.status.toLowerCase()}`)}</span>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statRow}>
          <span>{t("admin.lastSync")}</span>
          <span className={styles.statValue}>
            {integration.lastSync || "Never"}
          </span>
        </div>
        <div className={styles.statRow}>
          <span>{t("admin.fieldMapping")}</span>
          <span className={styles.statValue}>
            {integration.mappings.length} active
          </span>
        </div>
      </div>

      <div className={styles.footer}>
        <button
          onClick={() => onToggle(integration)}
          className={`${styles.actionButton} ${
            integration.enabled ? styles.powerActive : styles.powerInactive
          }`}
          title={integration.enabled ? "Disable" : "Enable"}
        >
          <Power className="w-4 h-4" />
        </button>

        <button
          onClick={() => onManage(integration)}
          className={`${styles.actionButton} ${styles.actionButtonBrand}`}
        >
          <Settings className="w-3 h-3" />
          {t("admin.configure")}
        </button>

        <button
          onClick={() => onTest(integration)}
          disabled={!integration.enabled || isTesting}
          className={styles.actionButton}
          title="Test Connection"
        >
          <RefreshCw className={`w-4 h-4 ${isTesting ? "animate-spin" : ""}`} />
        </button>
      </div>
    </div>
  );
};
