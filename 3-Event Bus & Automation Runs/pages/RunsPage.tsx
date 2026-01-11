import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MockService } from "../services/mockData";
import { AutomationRun, Status } from "../types";
import { ArrowRight, Workflow } from "lucide-react";
import styles from "../App.module.css";

const getStatusClass = (status: Status) => {
  switch (status) {
    case Status.SUCCESS:
      return styles.success;
    case Status.FAILED:
      return styles.failed;
    case Status.WAITING:
      return styles.waiting;
    case Status.RUNNING:
      return styles.running;
    default:
      return "";
  }
};

const getStatusLabel = (status: Status) => {
  switch (status) {
    case Status.SUCCESS:
      return "Success";
    case Status.FAILED:
      return "Failed";
    case Status.WAITING:
      return "Waiting";
    case Status.RUNNING:
      return "Running";
    default:
      return status;
  }
};

export const RunsPage: React.FC = () => {
  const [runs, setRuns] = useState<AutomationRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const data = await MockService.getRuns();
      setRuns(
        data.sort(
          (a, b) =>
            new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
        )
      );
      setLoading(false);
    };
    fetch();
    const interval = setInterval(fetch, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>
            <Workflow
              size={22}
              style={{ color: "var(--color-accent-primary)" }}
            />
            Automation Runs
          </h1>
          <p>Global execution history across all workflows</p>
        </div>
      </div>

      {/* Table */}
      <div className={styles.sectionCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Run ID</th>
              <th>Event ID</th>
              <th>Workflow</th>
              <th>Started At</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className={styles.emptyState}>
                  Loading runs...
                </td>
              </tr>
            ) : runs.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.emptyState}>
                  No runs found.
                </td>
              </tr>
            ) : (
              runs.map((run) => (
                <tr key={run.id}>
                  <td className={styles.mono}>{run.id}</td>
                  <td>
                    <Link to={`/events/${run.eventId}`} className={styles.link}>
                      {run.eventId}
                    </Link>
                  </td>
                  <td>{run.workflowId}</td>
                  <td>
                    {new Date(run.startedAt).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${getStatusClass(
                        run.status
                      )}`}
                    >
                      {getStatusLabel(run.status)}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <Link
                      to={`/events/${run.eventId}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        color: "var(--color-text-tertiary)",
                        fontSize: "0.625rem",
                        textDecoration: "none",
                      }}
                    >
                      View <ArrowRight size={12} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
