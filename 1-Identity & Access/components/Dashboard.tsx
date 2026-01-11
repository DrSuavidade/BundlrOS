import React, { useMemo } from "react";
import { UserService, AuditService } from "../services/store";
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
import { Role } from "../types";
import styles from "../App.module.css";

export const Dashboard: React.FC = () => {
  const users = UserService.getAll();
  const logs = AuditService.getAll();

  const activeUsers = users.filter((u) => u.status === "active").length;
  const recentLogs = logs.slice(0, 5);

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
            Identity Dashboard
          </h1>
          <p>System overview and statistics</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.blue}`}>
            <Users size={18} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Users</span>
            <span className={styles.statValue}>{users.length}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.green}`}>
            <UserPlus size={18} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Active Now</span>
            <span className={styles.statValue}>{activeUsers}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.purple}`}>
            <Activity size={18} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Events</span>
            <span className={styles.statValue}>{logs.length}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.red}`}>
            <ShieldAlert size={18} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Security Alerts</span>
            <span className={styles.statValue}>0</span>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className={styles.contentGrid}>
        {/* Chart */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>User Distribution by Role</h3>
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
                  <Bar dataKey="value" name="Users" radius={[4, 4, 0, 0]}>
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
            <h3 className={styles.sectionTitle}>Recent Activity</h3>
          </div>
          <div className={styles.sectionBody}>
            <div className={styles.activityList}>
              {recentLogs.map((log) => (
                <div key={log.id} className={styles.activityItem}>
                  <div className={styles.activityDot} />
                  <div className={styles.activityContent}>
                    <p className={styles.activityText}>{log.details}</p>
                    <div className={styles.activityMeta}>
                      <span>by {log.performerName}</span>
                      <span>
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {recentLogs.length === 0 && (
                <p
                  style={{
                    fontSize: "0.6875rem",
                    color: "var(--color-text-tertiary)",
                    textAlign: "center",
                    padding: "1rem",
                  }}
                >
                  No recent activity
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
