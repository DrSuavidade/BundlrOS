import React, { useState } from "react";
import { Deliverable, ChecklistItem, QAStatus } from "../types";
import {
  ArrowLeft,
  Play,
  CheckCircle,
  XCircle,
  AlertCircle,
  Cpu,
  FileText,
  Search,
  Activity,
  Zap,
} from "lucide-react";
import { analyzeFailure } from "../services/geminiService";

interface DeliverableDetailProps {
  deliverable: Deliverable;
  onBack: () => void;
  onRerun: (id: string, type: string) => void;
  isRunning: boolean;
}

const StatusBadge: React.FC<{ status: QAStatus; size?: "sm" | "lg" }> = ({
  status,
  size = "sm",
}) => {
  const badgeStyles = {
    passed:
      "bg-[var(--color-status-success-bg)] text-[#a7f3d0] border-[rgba(16,185,129,0.2)]",
    failed:
      "bg-[var(--color-status-danger-bg)] text-[#fecaca] border-[rgba(239,68,68,0.2)]",
    running:
      "bg-[var(--color-status-info-bg)] text-[#bfdbfe] border-[rgba(59,130,246,0.2)] animate-pulse",
    pending:
      "bg-[var(--color-bg-subtle)] text-[var(--color-text-tertiary)] border-[var(--color-border-subtle)]",
  };

  const icons = {
    passed: <CheckCircle className={size === "lg" ? "w-5 h-5" : "w-3 h-3"} />,
    failed: <XCircle className={size === "lg" ? "w-5 h-5" : "w-3 h-3"} />,
    running: <Activity className={size === "lg" ? "w-5 h-5" : "w-3 h-3"} />,
    pending: <AlertCircle className={size === "lg" ? "w-5 h-5" : "w-3 h-3"} />,
  };

  const labels = {
    passed: "PASSED",
    failed: "FAILED",
    running: "RUNNING",
    pending: "PENDING",
  };

  const padding = size === "lg" ? "px-4 py-2 text-sm" : "px-2 py-0.5 text-xs";

  return (
    <div
      className={`flex items-center gap-2 border rounded-full font-bold tracking-widest ${
        badgeStyles[status as keyof typeof badgeStyles]
      } ${padding}`}
    >
      {icons[status as keyof typeof icons]}
      <span>{labels[status as keyof typeof labels]}</span>
    </div>
  );
};

export const DeliverableDetail: React.FC<DeliverableDetailProps> = ({
  deliverable,
  onBack,
  onRerun,
  isRunning,
}) => {
  const { lastResult } = deliverable;
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const failedItems = lastResult.checklist.filter((i) => i.status === "failed");

  const handleAnalyze = async () => {
    setAnalyzing(true);
    const result = await analyzeFailure(deliverable.name, failedItems);
    setAnalysis(result);
    setAnalyzing(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-xs font-bold uppercase tracking-widest">
            Back to Overview
          </span>
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => onRerun(deliverable.id, deliverable.type)}
            disabled={isRunning}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${
              isRunning
                ? "bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)] cursor-not-allowed"
                : "bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-hover)] text-white shadow-[0_0_15px_rgba(88,101,242,0.4)] hover:scale-105 active:scale-95"
            }`}
          >
            <Play className={`w-4 h-4 ${isRunning ? "animate-spin" : ""}`} />
            {isRunning ? "Running QA..." : "Rerun Validation Gate"}
          </button>
        </div>
      </div>

      {/* Main Status Card */}
      <div className="bg-[var(--color-bg-card)] rounded-xl shadow-2xl border border-[var(--color-border-subtle)] overflow-hidden">
        <div className="p-8 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)]/50 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <h1 className="text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">
                {deliverable.name}
              </h1>
              <span className="px-3 py-1 bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] text-[10px] rounded border border-[var(--color-border-subtle)] font-bold uppercase tracking-widest">
                {deliverable.type}
              </span>
            </div>
            <div className="flex items-center gap-5 text-xs text-[var(--color-text-tertiary)] font-mono">
              <span className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-border-default)]" />{" "}
                ID: {deliverable.id}
              </span>
              <span className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-border-default)]" />{" "}
                VER: {deliverable.version}
              </span>
              <span className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-border-default)]" />{" "}
                RUN: {new Date(lastResult.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <StatusBadge status={lastResult.status} size="lg" />
            <div className="text-right">
              <span
                className={`text-xl font-bold ${
                  lastResult.score === 100
                    ? "text-[var(--color-status-success)]"
                    : lastResult.score > 80
                    ? "text-[var(--color-status-warning)]"
                    : "text-[var(--color-status-danger)]"
                }`}
              >
                {lastResult.score}%
              </span>
              <p className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider mt-1">
                Validation Score
              </p>
            </div>
          </div>
        </div>

        {/* AI Analysis Section (Only if failed) */}
        {lastResult.status === "failed" && (
          <div className="p-8 bg-[var(--color-status-danger-bg)] border-b border-[rgba(218,54,51,0.1)]">
            <div className="flex items-start gap-6">
              <div className="p-3 bg-[var(--color-status-danger-bg)] border border-[rgba(218,54,51,0.2)] rounded-xl text-[var(--color-status-danger)]">
                <Cpu className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
                  Failure Root Cause Detected
                </h3>
                <p className="text-[var(--color-text-secondary)] text-sm mb-6 leading-relaxed max-w-2xl">
                  Our automated gatekeeper has identified critical
                  discrepancies. Continuous deployment has been locked to
                  prevent downstream corruption.
                </p>

                {!analysis && !analyzing && (
                  <button
                    onClick={handleAnalyze}
                    className="flex items-center gap-3 px-5 py-2.5 bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-lg text-xs text-[var(--color-text-primary)] font-bold uppercase tracking-widest hover:border-[var(--color-accent-primary)] hover:bg-[var(--color-bg-subtle)] shadow-lg transition-all"
                  >
                    <Search className="w-4 h-4 text-[var(--color-accent-primary)]" />
                    Analyze Root Cause with Gemini AI
                  </button>
                )}

                {analyzing && (
                  <div className="flex items-center gap-3 text-sm font-bold text-[var(--color-accent-primary)] animate-pulse uppercase tracking-widest">
                    <Cpu className="w-5 h-5" />
                    Gemini is processing...
                  </div>
                )}

                {analysis && (
                  <div className="mt-6 p-6 bg-[var(--color-bg-app)] rounded-xl border border-[var(--color-border-subtle)] text-sm text-[var(--color-text-secondary)] leading-relaxed shadow-inner">
                    <div className="flex items-center gap-3 mb-4 text-[var(--color-accent-primary)] font-bold uppercase tracking-widest text-xs">
                      <Zap className="w-4 h-4" />
                      <span>AI Synthetic Insight</span>
                    </div>
                    <div className="markdown-body whitespace-pre-wrap font-sans">
                      {analysis}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Checklist Grid */}
        <div className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <h3 className="text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-[0.2em]">
              Validation Matrix
            </h3>
            <div className="flex-1 h-px bg-[var(--color-border-subtle)]" />
          </div>

          <div className="grid gap-4">
            {lastResult.checklist.map((item) => (
              <div
                key={item.id}
                className={`p-5 rounded-xl border transition-all ${
                  item.status === "failed"
                    ? "bg-[var(--color-status-danger-bg)] border-[rgba(218,54,51,0.2)]"
                    : "bg-[var(--color-bg-subtle)]/30 border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-subtle)]"
                } flex items-start gap-4`}
              >
                <div className="mt-1">
                  {item.status === "passed" ? (
                    <CheckCircle className="w-5 h-5 text-[var(--color-status-success)]" />
                  ) : (
                    <XCircle className="w-5 h-5 text-[var(--color-status-danger)]" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4
                      className={`font-semibold text-sm ${
                        item.status === "failed"
                          ? "text-[var(--color-text-primary)]"
                          : "text-[var(--color-text-primary)]"
                      }`}
                    >
                      {item.label}
                    </h4>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--color-text-tertiary)] px-2 py-0.5 bg-[var(--color-bg-elevated)] rounded border border-[var(--color-border-subtle)]">
                      {item.category}
                    </span>
                  </div>

                  {item.status === "failed" && (
                    <div className="mt-3 space-y-3">
                      {item.evidence && (
                        <div className="text-xs text-[var(--color-status-danger)] bg-[var(--color-status-danger-bg)] p-3 rounded-lg border border-[rgba(218,54,51,0.1)] font-mono">
                          <span className="opacity-50 mr-2">EVIDENCE:</span>{" "}
                          {item.evidence}
                        </div>
                      )}
                      {item.logs && (
                        <div className="text-[11px] text-[#fecaca] bg-[#0c0c0e] p-4 rounded-lg font-mono overflow-x-auto shadow-inner border border-white/5">
                          <div className="flex items-center gap-2 mb-2 text-zinc-500 border-b border-zinc-800 pb-2">
                            <FileText className="w-3.5 h-3.5" />
                            <span className="uppercase text-[9px] font-bold tracking-widest">
                              System STDOUT/ERR
                            </span>
                          </div>
                          <div className="whitespace-pre-wrap leading-relaxed opacity-90">
                            {item.logs}
                          </div>
                        </div>
                      )}
                    </div>
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
