import React, { useEffect, useState } from "react";
import { API } from "../services";
import { Client, Deliverable, SystemEvent } from "../types";
import {
  Activity,
  Clock,
  FileCheck,
  AlertCircle,
  TrendingUp,
  Users,
  Zap,
  ArrowUpRight,
  BarChart3,
  Layers,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@bundlros/ui";
import styles from "./Dashboard.module.css";

// Event Type Badge Component
const EventTypeBadge: React.FC<{ type: string }> = ({ type }) => {
  const getVariant = () => {
    if (type.includes("created")) return styles.created;
    if (type.includes("updated")) return styles.updated;
    if (type.includes("status")) return styles.status;
    if (type.includes("client")) return styles.client;
    return "";
  };

  const formatType = (t: string) => {
    return t.replace(/\./g, " • ").replace(/_/g, " ").toUpperCase();
  };

  return (
    <span className={`${styles.eventBadge} ${getVariant()}`}>
      {formatType(type)}
    </span>
  );
};

// Status color mapping
const getStatusColor = (status: string): string => {
  switch (status) {
    case "draft":
      return "rgb(156, 163, 175)";
    case "awaiting_approval":
      return "rgb(245, 158, 11)";
    case "approved":
      return "rgb(59, 130, 246)";
    case "in_qa":
      return "rgb(168, 85, 247)";
    case "ready":
      return "rgb(16, 185, 129)";
    case "published":
      return "var(--color-accent-primary)";
    default:
      return "var(--color-text-tertiary)";
  }
};

export const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const [clients, setClients] = useState<Client[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [events, setEvents] = useState<SystemEvent[]>([]);

  useEffect(() => {
    API.getClients().then(setClients);
    API.getDeliverables().then(setDeliverables);
    API.getEvents().then(setEvents);
  }, []);

  const pendingDeliverables = deliverables.filter((d) =>
    ["draft", "awaiting_approval", "in_qa"].includes(d.status)
  ).length;

  const publishedDeliverables = deliverables.filter(
    (d) => d.status === "published"
  ).length;

  const statusData = [
    { status: "draft", labelKey: "coreData.status.draft" },
    {
      status: "awaiting_approval",
      labelKey: "coreData.status.awaitingApproval",
    },
    { status: "approved", labelKey: "coreData.status.approved" },
    { status: "in_qa", labelKey: "coreData.status.inQa" },
    { status: "ready", labelKey: "coreData.status.ready" },
    { status: "published", labelKey: "coreData.status.published" },
  ];

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>
            <BarChart3
              size={22}
              className="text-[var(--color-accent-primary)]"
            />
            {t("coreData.title")}
          </h1>
          <p>{t("coreData.subtitle")}</p>
        </div>
        <div className={styles.statusBadge}>
          <div className={styles.statusDot} />
          {t("coreData.allSystemsOp")}
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {/* Total Clients */}
        <div className={styles.statCard}>
          <div
            className={styles.statCard__glow}
            style={{ background: "rgb(59, 130, 246)" }}
          />
          <div className={styles.statCard__content}>
            <p className={styles.statCard__label}>
              {t("coreData.totalClients")}
            </p>
            <p className={styles.statCard__value}>{clients.length}</p>
            <div className={`${styles.statCard__trend} ${styles.up}`}>
              <TrendingUp size={10} />
              <span>{t("coreData.thisMonth")}</span>
            </div>
          </div>
          <div
            className={styles.statCard__icon}
            style={{
              background: "rgba(59, 130, 246, 0.1)",
              color: "rgb(59, 130, 246)",
            }}
          >
            <Users size={18} />
          </div>
        </div>

        {/* Active Work Items */}
        <div className={styles.statCard}>
          <div
            className={styles.statCard__glow}
            style={{ background: "rgb(245, 158, 11)" }}
          />
          <div className={styles.statCard__content}>
            <p className={styles.statCard__label}>
              {t("coreData.activeWorkItems")}
            </p>
            <p className={styles.statCard__value}>{pendingDeliverables}</p>
            <div
              className={`${styles.statCard__trend} ${
                pendingDeliverables === 0 ? styles.up : styles.down
              }`}
            >
              <TrendingUp size={10} />
              <span>
                {pendingDeliverables > 0
                  ? t("coreData.needsAttention")
                  : t("coreData.allClear")}
              </span>
            </div>
          </div>
          <div
            className={styles.statCard__icon}
            style={{
              background: "rgba(245, 158, 11, 0.1)",
              color: "rgb(245, 158, 11)",
            }}
          >
            <Clock size={18} />
          </div>
        </div>

        {/* Published Items */}
        <div className={styles.statCard}>
          <div
            className={styles.statCard__glow}
            style={{ background: "rgb(16, 185, 129)" }}
          />
          <div className={styles.statCard__content}>
            <p className={styles.statCard__label}>
              {t("coreData.publishedItems")}
            </p>
            <p className={styles.statCard__value}>{publishedDeliverables}</p>
          </div>
          <div
            className={styles.statCard__icon}
            style={{
              background: "rgba(16, 185, 129, 0.1)",
              color: "rgb(16, 185, 129)",
            }}
          >
            <FileCheck size={18} />
          </div>
        </div>

        {/* Recent Events */}
        <div className={styles.statCard}>
          <div
            className={styles.statCard__glow}
            style={{ background: "rgb(168, 85, 247)" }}
          />
          <div className={styles.statCard__content}>
            <p className={styles.statCard__label}>
              {t("coreData.recentEvents")}
            </p>
            <p className={styles.statCard__value}>{events.length}</p>
          </div>
          <div
            className={styles.statCard__icon}
            style={{
              background: "rgba(168, 85, 247, 0.1)",
              color: "rgb(168, 85, 247)",
            }}
          >
            <Zap size={18} />
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className={styles.contentGrid}>
        {/* Activity Log */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionCard__header}>
            <div className={styles.sectionCard__title}>
              <Activity
                size={14}
                className="text-[var(--color-accent-primary)]"
              />
              {t("coreData.activityLog")}
            </div>
            <span className={styles.sectionCard__badge}>
              {t("coreData.last100Events")}
            </span>
          </div>

          <div className={styles.sectionCard__body}>
            {events.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyState__icon}>
                  <AlertCircle size={20} />
                </div>
                <p className={styles.emptyState__title}>
                  {t("coreData.noActivityYet")}
                </p>
                <p className={styles.emptyState__description}>
                  {t("coreData.noActivityDesc")}
                </p>
              </div>
            ) : (
              <table className={styles.activityTable}>
                <thead>
                  <tr>
                    <th style={{ width: "140px" }}>
                      {t("coreData.timestamp")}
                    </th>
                    <th style={{ width: "180px" }}>
                      {t("coreData.eventType")}
                    </th>
                    <th>{t("coreData.details")}</th>
                  </tr>
                </thead>
                <tbody>
                  {events.slice(0, 8).map((event) => (
                    <tr key={event.id}>
                      <td className={styles.activityTable__timestamp}>
                        {new Date(event.timestamp).toLocaleString([], {
                          month: "2-digit",
                          day: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td>
                        <EventTypeBadge type={event.type} />
                      </td>
                      <td className={styles.activityTable__details}>
                        {event.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Deliverable Pipeline */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionCard__header}>
            <div className={styles.sectionCard__title}>
              <Layers
                size={14}
                className="text-[var(--color-accent-primary)]"
              />
              {t("coreData.deliverablePipeline")}
            </div>
          </div>

          <div className={styles.sectionCard__body}>
            {statusData.map(({ status, labelKey }) => {
              const count = deliverables.filter(
                (d) => d.status === status
              ).length;
              const percentage = deliverables.length
                ? Math.round((count / deliverables.length) * 100)
                : 0;
              const color = getStatusColor(status);

              return (
                <div key={status} className={styles.pipelineItem}>
                  <div className={styles.pipelineItem__header}>
                    <div className={styles.pipelineItem__label}>
                      <div
                        className={styles.pipelineItem__dot}
                        style={{ background: color }}
                      />
                      <span className={styles.pipelineItem__name}>
                        {t(labelKey)}
                      </span>
                    </div>
                    <div className={styles.pipelineItem__stats}>
                      <span className={styles.pipelineItem__percentage}>
                        {percentage}%
                      </span>
                      <span className={styles.pipelineItem__count}>
                        {count}
                      </span>
                    </div>
                  </div>
                  <div className={styles.pipelineItem__bar}>
                    <div
                      className={styles.pipelineItem__progress}
                      style={{ width: `${percentage}%`, background: color }}
                    />
                  </div>
                </div>
              );
            })}

            {/* Quick Stats */}
            <div className={styles.quickStats}>
              <div className={styles.quickStat}>
                <p className={styles.quickStat__label}>{t("coreData.total")}</p>
                <p className={styles.quickStat__value}>{deliverables.length}</p>
              </div>
              <div className={styles.quickStat}>
                <p className={styles.quickStat__label}>
                  {t("coreData.completion")}
                </p>
                <p className={`${styles.quickStat__value} ${styles.success}`}>
                  {deliverables.length
                    ? Math.round(
                        (publishedDeliverables / deliverables.length) * 100
                      )
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>

          <div className={styles.sectionCard__footer}>
            <Link to="deliverables" className={styles.viewAllLink}>
              {t("coreData.viewAllDeliverables")}
              <ArrowUpRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
