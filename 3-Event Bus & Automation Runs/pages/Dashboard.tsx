import React, { useEffect, useState } from "react";
import { EventBusService } from "../services";
import { Status } from "../types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Activity, AlertTriangle, CheckCircle, Clock, Zap } from "lucide-react";
import { useLanguage } from "@bundlros/ui";
import styles from "../App.module.css";

export const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    failed: 0,
    waiting: 0,
    hourlyData: [] as any[],
  });

  useEffect(() => {
    const loadStats = async () => {
      const events = await EventBusService.getEvents();
      const total = events.length;
      const success = events.filter((e) => e.status === Status.SUCCESS).length;
      const failed = events.filter((e) => e.status === Status.FAILED).length;
      const waiting = events.filter(
        (e) => e.status === Status.WAITING || e.status === Status.RUNNING
      ).length;

      // Calculate hourly data for the last 6 hours
      const now = new Date();
      const hourlyData = Array.from({ length: 6 }).map((_, i) => {
        const hour = new Date(now.getTime() - (5 - i) * 60 * 60 * 1000);
        const hourLabel = hour.getHours().toString().padStart(2, "0") + ":00";

        const hourEvents = events.filter((e) => {
          const eventDate = new Date(e.createdAt);
          return (
            eventDate.getDate() === hour.getDate() &&
            eventDate.getHours() === hour.getHours()
          );
        });

        return {
          name: hourLabel,
          events: hourEvents.length,
          failed: hourEvents.filter((e) => e.status === Status.FAILED).length,
        };
      });

      setStats({ total, success, failed, waiting, hourlyData });
    };
    loadStats();
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>
            <Zap size={22} style={{ color: "var(--color-accent-primary)" }} />
            {t("events.title")}
          </h1>
          <p>{t("events.subtitle")}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>{t("events.totalEvents")}</span>
            <span className={styles.statValue}>{stats.total}</span>
          </div>
          <div className={`${styles.statIcon} ${styles.indigo}`}>
            <Activity size={16} />
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>
              {t("events.successfulRuns")}
            </span>
            <span className={styles.statValue}>{stats.success}</span>
          </div>
          <div className={`${styles.statIcon} ${styles.emerald}`}>
            <CheckCircle size={16} />
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>{t("events.failedEvents")}</span>
            <span className={styles.statValue}>{stats.failed}</span>
          </div>
          <div className={`${styles.statIcon} ${styles.rose}`}>
            <AlertTriangle size={16} />
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>
              {t("events.pendingActive")}
            </span>
            <span className={styles.statValue}>{stats.waiting}</span>
          </div>
          <div className={`${styles.statIcon} ${styles.amber}`}>
            <Clock size={16} />
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className={styles.contentGrid}>
        {/* Chart Section */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>
              {t("events.eventActivity")}
            </span>
          </div>
          <div className={styles.sectionBody}>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.hourlyData}>
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
                  <Tooltip
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
                      padding: "2px 0",
                    }}
                    cursor={{ fill: "rgba(255,255,255,0.02)" }}
                  />
                  <Bar
                    dataKey="events"
                    name={t("events.totalEvents")}
                    radius={[3, 3, 0, 0]}
                  >
                    {stats.hourlyData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill="rgb(99, 102, 241)" />
                    ))}
                  </Bar>
                  <Bar
                    dataKey="failed"
                    name={t("events.status.failed")}
                    radius={[3, 3, 0, 0]}
                    fill="rgb(244, 63, 94)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>
              {t("events.successRate")}
            </span>
          </div>
          <div className={styles.sectionBody}>
            <div className={styles.healthList}>
              <div className={styles.healthItem}>
                <span className={styles.healthLabel}>Webhook Latency</span>
                <span className={`${styles.healthValue} ${styles.good}`}>
                  45ms
                </span>
              </div>
              <div className={styles.healthItem}>
                <span className={styles.healthLabel}>Queue Depth</span>
                <span
                  className={styles.healthValue}
                  style={{ color: "var(--color-text-primary)" }}
                >
                  12
                </span>
              </div>
              <div className={styles.healthItem}>
                <span className={styles.healthLabel}>
                  {t("events.successRate")}
                </span>
                <span className={`${styles.healthValue} ${styles.good}`}>
                  98.2%
                </span>
              </div>
            </div>
            <p className={styles.healthNote}>
              System performing within normal parameters. No major outages
              detected in the last 24h.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
