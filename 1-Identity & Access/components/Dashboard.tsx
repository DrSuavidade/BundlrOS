import React, { useState, useEffect, useMemo } from "react";
import { UserService, AuditService } from "../services";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Users, UserPlus, Activity, ShieldAlert, Shield } from "lucide-react";
import { Role, User, AuditLog } from "../types";
import { useLanguage } from "@bundlros/ui";
import { useAuth } from "@bundlros/ui";
import styles from "../App.module.css";

export const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, logsData] = await Promise.all([
          UserService.getAll(),
          AuditService.getAll(),
        ]);
        setUsers(usersData);
        setLogs(logsData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Online users = just the current logged-in user (for now)
  // In a real app, this would track sessions in the database
  const onlineUsers = currentUser ? 1 : 0;

  // Filter logs to only show authentication events (login/logout)
  const authLogs = logs.filter(
    (log) => log.action === "auth.login" || log.action === "auth.logout"
  );
  const recentLogs = authLogs.slice(0, 5);

  const roleDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(Role).forEach((r) => (counts[r] = 0));
    users.forEach((u) => {
      counts[u.role] = (counts[u.role] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [users]);

  const COLORS = [
    "#6366f1",
    "#8b5cf6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#ec4899",
    "#3b82f6",
  ];

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h1>
              <Shield
                size={22}
                style={{ color: "var(--color-accent-primary)" }}
              />
              {t("identity.title")}
            </h1>
            <p>{t("identity.overview")}</p>
          </div>
        </div>
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            color: "var(--color-text-tertiary)",
          }}
        >
          Loading...
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
            <Shield
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
            <Users size={18} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>{t("identity.totalUsers")}</span>
            <span className={styles.statValue}>{users.length}</span>
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
            <ShieldAlert size={18} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>
              {t("identity.securityAlerts")}
            </span>
            <span className={styles.statValue}>0</span>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className={styles.contentGrid}>
        {/* Chart */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>
              {t("identity.userDistribution")}
            </h3>
          </div>
          <div className={styles.sectionBody}>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roleDistribution}>
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
                    cursor={{ fill: "rgba(255,255,255,0.02)" }}
                  />
                  <Bar
                    dataKey="value"
                    name={t("identity.users")}
                    radius={[4, 4, 0, 0]}
                  >
                    {roleDistribution.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>
              {t("identity.recentActivity")}
            </h3>
          </div>
          <div className={styles.sectionBody}>
            <div className={styles.activityList}>
              {recentLogs.map((log) => {
                // Format the log message in a human-readable way
                const formatLogMessage = () => {
                  // Try to extract name or email from details
                  let displayName = "Unknown user";
                  if (typeof log.details === "string") {
                    try {
                      const parsed = JSON.parse(log.details);
                      displayName = parsed.name || parsed.email || displayName;
                    } catch {
                      displayName = log.details;
                    }
                  } else if (typeof log.details === "object" && log.details) {
                    const details = log.details as any;
                    displayName = details.name || details.email || displayName;
                  }

                  switch (log.action) {
                    case "auth.login":
                      return `${displayName} logged in`;
                    case "auth.logout":
                      return `${displayName} logged out`;
                    case "user.created":
                      return `New user created: ${displayName}`;
                    case "user.updated":
                      return `User updated: ${displayName}`;
                    case "user.deactivated":
                      return `User deactivated: ${displayName}`;
                    default:
                      return `${log.action}: ${displayName}`;
                  }
                };

                return (
                  <div key={log.id} className={styles.activityItem}>
                    <div className={styles.activityDot} />
                    <div className={styles.activityContent}>
                      <p className={styles.activityText}>
                        {formatLogMessage()}
                      </p>
                      <div className={styles.activityMeta}>
                        <span>
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {recentLogs.length === 0 && (
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
