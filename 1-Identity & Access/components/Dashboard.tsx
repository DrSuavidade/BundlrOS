import React, { useState, useEffect, useMemo } from "react";
import {
  UserService,
  AuditService,
  NotificationService,
  ApprovalService,
} from "../services";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Users, UserPlus, Activity, Bell, FileCheck } from "lucide-react";
import { User, AuditLog, Notification, Approval } from "../types";
import { useLanguage } from "@bundlros/ui";
import { useAuth } from "@bundlros/ui";
import styles from "../App.module.css";

export const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);

  const [timeRange, setTimeRange] = useState<"1W" | "1M" | "6M" | "1Y">("1W");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, logsData, notificationsData, approvalsData] =
          await Promise.all([
            UserService.getAll(),
            AuditService.getAll(),
            NotificationService.getAll(currentUser?.id),
            ApprovalService.getAll(),
          ]);
        setUsers(usersData);
        setLogs(logsData);
        setNotifications(notificationsData);
        setApprovals(approvalsData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  // Online users = just the current logged-in user (for now)
  // In a real app, this would track sessions in the database
  const onlineUsers = currentUser ? 1 : 0;

  const unreadNotifications = notifications.filter((n) => !n.isRead).length;
  const recentNotifications = notifications.slice(0, 5);

  // Pending Approvals logic: Status PENDING (case insensitive) and assignee != current user
  const pendingApprovalsCount = approvals.filter(
    (a) =>
      a.status?.toUpperCase() === "PENDING" && a.assigneeId !== currentUser?.id,
  ).length;

  // Calculate Activity Trends based on timeRange
  const activityTrends = useMemo(() => {
    let days = 7;
    switch (timeRange) {
      case "1M":
        days = 30;
        break;
      case "6M":
        days = 180;
        break;
      case "1Y":
        days = 365;
        break;
      default:
        days = 7;
    }

    const labels: string[] = [];
    const dataPoints: { name: string; value: number }[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      labels.push(dateStr);
    }

    const counts: Record<string, number> = {};
    labels.forEach((date) => (counts[date] = 0));

    logs.forEach((log) => {
      const date = log.timestamp.split("T")[0];
      if (counts[date] !== undefined) {
        counts[date]++;
      }
    });

    // For longer ranges, maybe group by week or month?
    // keeping it per day for now but might need aggregation for 1Y

    return labels.map((date) => ({
      name: new Date(date).toLocaleDateString("en-US", {
        month: days > 30 ? "short" : undefined,
        day: "numeric",
        weekday: days <= 7 ? "short" : undefined,
      }),
      value: counts[date],
    }));
  }, [logs, timeRange]);

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        {/* Loading state... */}
        <div className={styles.header}>
          <h1>{t("identity.title")}</h1>
        </div>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          {t("common.loading")}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>
            <Activity
              size={22}
              style={{ color: "var(--color-accent-primary)" }}
            />
            {t("identity.title")}
          </h1>
          <p>{t("identity.overview")}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.blue}`}>
            <Bell size={18} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>
              {t("identity.unreadNotifications")}
            </span>
            <span className={styles.statValue}>{unreadNotifications}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.green}`}>
            <UserPlus size={18} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>{t("identity.activeNow")}</span>
            <span className={styles.statValue}>{onlineUsers}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.purple}`}>
            <Activity size={18} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>
              {t("identity.totalEvents")}
            </span>
            <span className={styles.statValue}>{logs.length}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.red}`}>
            <FileCheck size={18} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>
              {t("identity.pendingApprovals")}
            </span>
            <span className={styles.statValue}>{pendingApprovalsCount}</span>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className={styles.contentGrid}>
        {/* Activity Trends Chart */}
        <div className={styles.sectionCard}>
          <div
            className={styles.sectionHeader}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingRight: "16px",
            }}
          >
            <h3 className={styles.sectionTitle}>
              {t("identity.activityTrends")}
            </h3>
            <div
              style={{
                display: "flex",
                background: "var(--color-bg-subtle)",
                padding: "2px",
                borderRadius: "6px",
                border: "1px solid var(--color-border-subtle)",
              }}
            >
              {(["1W", "1M", "6M", "1Y"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  style={{
                    border: "none",
                    background:
                      timeRange === range
                        ? "var(--color-bg-elevated)"
                        : "transparent",
                    color:
                      timeRange === range
                        ? "var(--color-text-primary)"
                        : "var(--color-text-tertiary)",
                    fontSize: "10px",
                    fontWeight: 500,
                    padding: "4px 8px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    lineHeight: "1",
                    boxShadow:
                      timeRange === range
                        ? "0 1px 2px rgba(0,0,0,0.1)"
                        : "none",
                  }}
                >
                  {t(`common.timeRanges.${range}`)}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.sectionBody}>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityTrends}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    stroke="var(--color-text-tertiary)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--color-text-tertiary)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                    vertical={false}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "#1a1a24",
                      border: "1px solid #2a2a3a",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                    }}
                    labelStyle={{
                      color: "#9ca3af",
                      fontSize: "10px",
                      marginBottom: "4px",
                    }}
                    itemStyle={{
                      color: "#e5e7eb",
                      fontSize: "11px",
                    }}
                    cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Notifications */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>
              {t("identity.recentNotifications")}
            </h3>
          </div>
          <div className={styles.sectionBody}>
            <div className={styles.activityList}>
              {recentNotifications.map((notif) => (
                <div key={notif.id} className={styles.activityItem}>
                  <div
                    className={styles.activityDot}
                    style={{
                      backgroundColor: !notif.isRead
                        ? "var(--color-accent-primary)"
                        : "var(--color-bg-elevated)",
                    }}
                  />
                  <div className={styles.activityContent}>
                    <p className={styles.activityText}>{notif.title}</p>
                    {notif.message && (
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--color-text-tertiary)",
                          marginTop: "0.125rem",
                        }}
                      >
                        {notif.message}
                      </p>
                    )}
                    <div className={styles.activityMeta}>
                      <span>
                        {new Date(notif.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {recentNotifications.length === 0 && (
                <p
                  style={{
                    fontSize: "0.6875rem",
                    color: "var(--color-text-tertiary)",
                    textAlign: "center",
                    padding: "1rem",
                  }}
                >
                  {t("identity.noRecentActivity")}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
