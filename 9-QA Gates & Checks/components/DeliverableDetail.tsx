import React, { useState } from "react";
import { Deliverable, QAStatus } from "../types";
import {
  ArrowLeft,
  Play,
  CheckCircle,
  XCircle,
  Cpu,
  Search,
  Zap,
  FileText,
  Shield,
} from "lucide-react";
import styles from "../App.module.css";

interface DeliverableDetailProps {
  deliverable: Deliverable;
  onBack: () => void;
  onRerun: (id: string, type: string) => void;
  isRunning: boolean;
}

export const DeliverableDetail: React.FC<DeliverableDetailProps> = ({
  deliverable,
  onBack,
  onRerun,
  isRunning,
}) => {
  const { lastResult } = deliverable;
  // Gemini analysis removed: database-backed implementation pending

  const getScoreClass = () => {
    if (lastResult.score === 100) return styles.success;
    if (lastResult.score > 80) return styles.warning;
    return styles.danger;
  };

  const getStatusClass = (status: QAStatus) => {
    switch (status) {
      case "passed":
        return styles.passed;
      case "failed":
        return styles.failed;
      case "running":
        return styles.running;
      default:
        return "";
    }
  };

  return (
    <div className={styles.detailContainer}>
      {/* Header - same structure as Deliverables with back button above title */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <button
            onClick={onBack}
            className={styles.backButton}
            title="Back to Overview"
          >
            <ArrowLeft size={16} />
          </button>
          <h1>
            <Shield size={22} className="text-[var(--color-accent-primary)]" />
            {deliverable.name}
          </h1>
          <p>
            {deliverable.type} • ID: {deliverable.id} • Version:{" "}
            {deliverable.version}
          </p>
        </div>
        <button
          onClick={() => onRerun(deliverable.id, deliverable.type)}
          disabled={isRunning}
          className={styles.rerunButton}
        >
          <Play size={14} className={isRunning ? "animate-spin" : ""} />
          {isRunning ? "Running..." : "Rerun Validation"}
        </button>
      </div>

      {/* Status Card */}
      <div className={styles.detailCard}>
        <div className={styles.cardHeader}>
          <div className={styles.cardHeader__info}>
            <div className={styles.cardHeader__meta}>
              <span>
                <span className={styles.metaDot} />
                Last run: {new Date(lastResult.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
          <div className={styles.cardHeader__status}>
            <span
              className={`${styles.detailStatusBadge} ${getStatusClass(
                lastResult.status
              )}`}
            >
              {lastResult.status === "passed" && <CheckCircle size={12} />}
              {lastResult.status === "failed" && <XCircle size={12} />}
              {lastResult.status.toUpperCase()}
            </span>
            <div className={styles.scoreDisplay}>
              <div
                className={`${styles.scoreDisplay__value} ${getScoreClass()}`}
              >
                {lastResult.score}%
              </div>
              <div className={styles.scoreDisplay__label}>Validation Score</div>
            </div>
          </div>
        </div>

        {/* Failure Alert */}
        {lastResult.status === "failed" && (
          <div className={styles.failureAlert}>
            <div className={styles.failureAlert__content}>
              <div className={styles.failureAlert__icon}>
                <Cpu size={20} />
              </div>
              <div className={styles.failureAlert__text}>
                <h3 className={styles.failureAlert__title}>
                  Failure Root Cause Detected
                </h3>
                <p className={styles.failureAlert__description}>
                  Our automated gatekeeper has identified critical
                  discrepancies. Continuous deployment has been locked to
                  prevent downstream corruption.
                </p>

                <div className={styles.aiResult}>
                  <div className={styles.aiResult__header}>
                    <Zap size={12} />
                    Automated Analysis
                  </div>
                  <div className={styles.aiResult__content}>
                    {lastResult.automatedSummary ||
                      "Check execution logs for details."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Validation Matrix */}
        <div className={styles.validationMatrix}>
          <div className={styles.matrixHeader}>
            <span className={styles.matrixHeader__title}>
              Validation Matrix
            </span>
            <div className={styles.matrixHeader__line} />
          </div>

          <div>
            {lastResult.checklist.map((item) => (
              <div
                key={item.id}
                className={`${styles.checkItem} ${
                  item.status === "failed" ? styles.failed : ""
                }`}
              >
                <div
                  className={`${styles.checkItem__icon} ${getStatusClass(
                    item.status as QAStatus
                  )}`}
                >
                  {item.status === "passed" ? (
                    <CheckCircle size={16} />
                  ) : (
                    <XCircle size={16} />
                  )}
                </div>
                <div className={styles.checkItem__content}>
                  <div className={styles.checkItem__header}>
                    <h4 className={styles.checkItem__label}>{item.label}</h4>
                    <span className={styles.checkItem__category}>
                      {item.category}
                    </span>
                  </div>

                  {item.status === "failed" && (
                    <>
                      {item.evidence && (
                        <div className={styles.checkItem__evidence}>
                          <span>EVIDENCE:</span>
                          {item.evidence}
                        </div>
                      )}
                      {item.logs && (
                        <div className={styles.checkItem__logs}>
                          <div className={styles.checkItem__logsHeader}>
                            <FileText size={10} />
                            System STDOUT/ERR
                          </div>
                          <div className={styles.checkItem__logsContent}>
                            {item.logs}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
