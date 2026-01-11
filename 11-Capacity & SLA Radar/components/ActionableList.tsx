import React from "react";
import { IntakeItem, RiskLevel } from "../types";
import { AlertCircle, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import styles from "../App.module.css";

interface ActionableListProps {
  items: IntakeItem[];
  onResolve: (id: string) => void;
}

const ActionableList: React.FC<ActionableListProps> = ({
  items,
  onResolve,
}) => {
  const getIcon = (type: IntakeItem["type"]) => {
    const iconStyles = { flexShrink: 0 };
    switch (type) {
      case "capacity_warning":
        return (
          <AlertCircle
            style={{ ...iconStyles, color: "rgb(244, 63, 94)" }}
            size={14}
          />
        );
      case "sla_breach":
        return (
          <Clock
            style={{ ...iconStyles, color: "rgb(245, 158, 11)" }}
            size={14}
          />
        );
      case "churn_alert":
        return (
          <AlertCircle
            style={{ ...iconStyles, color: "rgb(244, 63, 94)" }}
            size={14}
          />
        );
      case "new_request":
        return (
          <ArrowRight
            style={{ ...iconStyles, color: "rgb(99, 102, 241)" }}
            size={14}
          />
        );
      default:
        return <AlertCircle style={iconStyles} size={14} />;
    }
  };

  const getSeverityClass = (severity: RiskLevel) => {
    if (severity === RiskLevel.CRITICAL) return styles.critical;
    if (severity === RiskLevel.HIGH) return styles.high;
    return "";
  };

  if (items.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
          <CheckCircle2 size={18} />
        </div>
        <span className={styles.emptyText}>All systems nominal</span>
      </div>
    );
  }

  return (
    <div>
      {items.map((item) => (
        <div
          key={item.id}
          className={`${styles.intakeItem} ${getSeverityClass(item.severity)}`}
        >
          <div className={styles.intakeContent}>
            <div className={styles.intakeIcon}>{getIcon(item.type)}</div>
            <div>
              <p className={styles.intakeTitle}>{item.description}</p>
              <div className={styles.intakeMeta}>
                <span className={styles.intakeType}>
                  {item.type.replace("_", " ")}
                </span>
                <div
                  style={{
                    width: 3,
                    height: 3,
                    borderRadius: "50%",
                    background: "var(--color-border-subtle)",
                  }}
                />
                <span className={styles.intakeTime}>
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
            className={styles.resolveButton}
            title="Mark as Resolved"
          >
            <CheckCircle2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ActionableList;
