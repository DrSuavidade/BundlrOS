import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { EventBusService } from "../services";
import { SystemEvent, AutomationRun, Status } from "../types";
import {
  ArrowLeft,
  Clock,
  Tag,
  Globe,
  Share2,
  AlertCircle,
  Terminal,
  Cpu,
} from "lucide-react";
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

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<SystemEvent | undefined>(undefined);
  const [runs, setRuns] = useState<AutomationRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      const e = await EventBusService.getEvent(id);
      const r = await EventBusService.getRunsByEvent(id);
      setEvent(e);
      setRuns(r);
      if (r.length > 0 && !selectedRunId) {
        setSelectedRunId(r[0].id);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const selectedRun = runs.find((r) => r.id === selectedRunId);

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.emptyState}>Loading detail...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className={styles.pageContainer}>
        <div
          className={styles.emptyState}
          style={{ color: "rgb(244, 63, 94)" }}
        >
          Event not found
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* Back Button */}
      <Link to="/events" className={styles.backButton}>
        <ArrowLeft size={14} />
      </Link>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>
            <Terminal
              size={22}
              style={{ color: "var(--color-accent-primary)" }}
            />
            {event.type}
          </h1>
          <p
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              fontFamily: "monospace",
            }}
          >
            <span
              style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
            >
              <Tag size={10} /> {event.id}
            </span>
            <span
              style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
            >
              <Clock size={10} /> {new Date(event.createdAt).toISOString()}
            </span>
            <span
              style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
            >
              <Globe size={10} /> {event.clientId}
            </span>
          </p>
        </div>
        <div className={styles.headerActions}>
          <span
            className={`${styles.statusBadge} ${getStatusClass(event.status)}`}
          >
            {getStatusLabel(event.status)}
          </span>
          <button
            style={{
              padding: "0.375rem 0.75rem",
              background: "var(--color-accent-primary)",
              border: "none",
              borderRadius: "0.375rem",
              color: "white",
              fontSize: "0.625rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Replay Event
          </button>
        </div>
      </div>

      {/* Detail Grid */}
      <div className={styles.detailGrid}>
        {/* Left Column */}
        <div>
          {/* Runs List */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>
                <Cpu size={14} style={{ marginRight: "0.5rem" }} />
                Automation Runs ({runs.length})
              </span>
            </div>
            <div style={{ maxHeight: "300px", overflow: "auto" }}>
              {runs.map((run) => (
                <div
                  key={run.id}
                  onClick={() => setSelectedRunId(run.id)}
                  style={{
                    padding: "0.75rem 1rem",
                    borderBottom: "1px solid var(--color-border-subtle)",
                    cursor: "pointer",
                    borderLeft:
                      selectedRunId === run.id
                        ? "2px solid var(--color-accent-primary)"
                        : "2px solid transparent",
                    background:
                      selectedRunId === run.id
                        ? "rgba(99, 102, 241, 0.05)"
                        : "transparent",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.375rem",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: "0.625rem",
                        color: "var(--color-text-tertiary)",
                      }}
                    >
                      {run.id}
                    </span>
                    <span
                      className={`${styles.statusBadge} ${getStatusClass(
                        run.status
                      )}`}
                    >
                      {getStatusLabel(run.status)}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "0.625rem",
                      color: "var(--color-text-tertiary)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Workflow:{" "}
                    <span style={{ color: "var(--color-text-secondary)" }}>
                      {run.workflowId}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.5625rem",
                      fontFamily: "monospace",
                      color: "var(--color-text-tertiary)",
                    }}
                  >
                    <span>{new Date(run.startedAt).toLocaleTimeString()}</span>
                    {run.completedAt && (
                      <span>
                        {(
                          (new Date(run.completedAt).getTime() -
                            new Date(run.startedAt).getTime()) /
                          1000
                        ).toFixed(2)}
                        s
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Event Payload */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>
                <Share2 size={14} style={{ marginRight: "0.5rem" }} />
                Event Payload
              </span>
              <span
                style={{
                  fontSize: "0.5rem",
                  fontFamily: "monospace",
                  color: "var(--color-text-tertiary)",
                }}
              >
                IDEMPOTENCY: {event.idempotencyKey.slice(0, 8)}...
              </span>
            </div>
            <div className={styles.sectionBody}>
              <pre className={styles.jsonDisplay}>
                {JSON.stringify(event.payload, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* Right Column - Run Detail */}
        <div>
          {selectedRun ? (
            <>
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionTitle}>Run Details</span>
                  <span
                    style={{
                      fontSize: "0.5rem",
                      fontFamily: "monospace",
                      color: "var(--color-text-tertiary)",
                    }}
                  >
                    {selectedRun.id}
                  </span>
                </div>
                <div className={styles.sectionBody}>
                  {selectedRun.error && (
                    <div
                      style={{
                        background: "rgba(244, 63, 94, 0.1)",
                        border: "1px solid rgba(244, 63, 94, 0.2)",
                        borderRadius: "0.5rem",
                        padding: "0.875rem",
                        marginBottom: "1rem",
                      }}
                    >
                      <h4
                        style={{
                          color: "rgb(244, 63, 94)",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: "0.375rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <AlertCircle size={14} /> Execution Error
                      </h4>
                      <p
                        style={{
                          color: "rgb(251, 113, 133)",
                          fontSize: "0.6875rem",
                          marginBottom: "0.625rem",
                        }}
                      >
                        {selectedRun.error.message}
                      </p>
                      <pre
                        style={{
                          background: "rgba(244, 63, 94, 0.05)",
                          padding: "0.625rem",
                          borderRadius: "0.375rem",
                          fontSize: "0.5625rem",
                          fontFamily: "monospace",
                          color: "rgba(251, 113, 133, 0.7)",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {selectedRun.error.stack}
                      </pre>
                    </div>
                  )}

                  <div style={{ marginBottom: "1rem" }}>
                    <h4
                      style={{
                        fontSize: "0.625rem",
                        fontWeight: 600,
                        color: "var(--color-text-secondary)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Workflow Input
                    </h4>
                    <pre className={styles.jsonDisplay}>
                      {JSON.stringify(selectedRun.input, null, 2)}
                    </pre>
                  </div>

                  {selectedRun.output && (
                    <div>
                      <h4
                        style={{
                          fontSize: "0.625rem",
                          fontWeight: 600,
                          color: "var(--color-text-secondary)",
                          marginBottom: "0.5rem",
                        }}
                      >
                        Workflow Output
                      </h4>
                      <pre className={styles.jsonDisplay}>
                        {JSON.stringify(selectedRun.output, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className={styles.sectionCard}>
              <div className={styles.emptyState}>
                <Cpu
                  size={32}
                  style={{ marginBottom: "0.5rem", opacity: 0.3 }}
                />
                <p>Select a run to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
