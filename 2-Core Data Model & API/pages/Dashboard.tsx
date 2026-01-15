import React, { useEffect, useState } from "react";
import { API } from "../services";
import { Client, ServiceContract } from "../types";
import {
  CreditCard,
  Calendar,
  DollarSign,
  Send,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  MoreHorizontal,
} from "lucide-react";
import { useLanguage } from "@bundlros/ui";
import styles from "./Dashboard.module.css";

// Helper to calculate next due date for monthly payments
const getNextDueDate = (startDateStr: string) => {
  if (!startDateStr) return new Date();

  const start = new Date(startDateStr);
  const today = new Date();
  const dayOfMonth = start.getDate();

  let nextDue = new Date(today.getFullYear(), today.getMonth(), dayOfMonth);

  // If we passed the day this month, move to next month
  if (today.getDate() > dayOfMonth) {
    nextDue.setMonth(nextDue.getMonth() + 1);
  }

  return nextDue;
};

// Helper to format currency
const formatMoney = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const [clients, setClients] = useState<Client[]>([]);
  const [contracts, setContracts] = useState<ServiceContract[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data
  useEffect(() => {
    Promise.all([API.getClients(), API.getContracts()]).then(
      ([clientsData, contractsData]) => {
        setClients(clientsData);
        setContracts(contractsData);
        setLoading(false);
      }
    );
  }, []);

  // Enrich contracts with client data and computed status
  const enrichedContracts = contracts.map((contract) => {
    const client = clients.find((c) => c.id === contract.client_id);
    const nextDue =
      contract.payment_type === "monthly"
        ? getNextDueDate(contract.start_date)
        : new Date(contract.end_date || contract.start_date); // Default one-off to end date

    // Simple logic: If due date is within 3 days, it's "due soon"
    const diffDays = Math.ceil(
      (nextDue.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    let paymentStatus = "upcoming";
    if (diffDays < 0) paymentStatus = "overdue";
    else if (diffDays <= 5) paymentStatus = "due_soon";

    return {
      ...contract,
      clientName: client?.name || "Unknown Client",
      clientEmail: client?.email,
      nextDue,
      paymentStatus,
      diffDays,
    };
  });

  const monthlyContracts = enrichedContracts
    .filter((c) => c.payment_type === "monthly" && c.status === "active")
    .sort((a, b) => a.nextDue.getTime() - b.nextDue.getTime());

  const oneOffContracts = enrichedContracts
    .filter((c) => c.payment_type !== "monthly" && c.status !== "expired")
    .sort((a, b) => a.nextDue.getTime() - b.nextDue.getTime());

  // Quick Stats
  const totalMRR = monthlyContracts.reduce((acc, c) => acc + (c.value || 0), 0);
  const totalOneOffPending = oneOffContracts.reduce(
    (acc, c) => acc + (c.value || 0),
    0
  );
  const overdueCount = enrichedContracts.filter(
    (c) => c.paymentStatus === "overdue"
  ).length;

  const handleAction = (action: string, clientName: string) => {
    alert(`${action} for ${clientName}`);
  };

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>
            <CreditCard
              size={28}
              className="text-[var(--color-accent-primary)]"
            />
            Payment Hub
          </h1>
          <p>Financial overview and payment management</p>
        </div>
        <div className={styles.statusBadge}>
          <div className={styles.statusDot} />
          Systems Active
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div
            className={styles.statCard__glow}
            style={{ background: "rgb(59, 130, 246)" }}
          />
          <div className={styles.statCard__content}>
            <p className={styles.statCard__label}>Monthly Recurring Revenue</p>
            <p className={styles.statCard__value}>{formatMoney(totalMRR)}</p>
            <div className={`${styles.statCard__trend} ${styles.up}`}>
              <TrendingUp size={12} />
              <span>Active Retainers</span>
            </div>
          </div>
          <div
            className={styles.statCard__icon}
            style={{
              background: "rgba(59, 130, 246, 0.1)",
              color: "rgb(59, 130, 246)",
            }}
          >
            <DollarSign size={18} />
          </div>
        </div>

        <div className={styles.statCard}>
          <div
            className={styles.statCard__glow}
            style={{ background: "rgb(168, 85, 247)" }}
          />
          <div className={styles.statCard__content}>
            <p className={styles.statCard__label}>Pending One-Off</p>
            <p className={styles.statCard__value}>
              {formatMoney(totalOneOffPending)}
            </p>
          </div>
          <div
            className={styles.statCard__icon}
            style={{
              background: "rgba(168, 85, 247, 0.1)",
              color: "rgb(168, 85, 247)",
            }}
          >
            <FileText size={18} />
          </div>
        </div>

        <div className={styles.statCard}>
          <div
            className={styles.statCard__glow}
            style={{
              background:
                overdueCount > 0 ? "rgb(239, 68, 68)" : "rgb(16, 185, 129)",
            }}
          />
          <div className={styles.statCard__content}>
            <p className={styles.statCard__label}>Payment Alerts</p>
            <p
              className={styles.statCard__value}
              style={{
                color: overdueCount > 0 ? "var(--color-error)" : "inherit",
              }}
            >
              {overdueCount} Overdue
            </p>
            <div className={styles.statCard__trend}>
              <span>Action needed</span>
            </div>
          </div>
          <div
            className={styles.statCard__icon}
            style={{
              background:
                overdueCount > 0
                  ? "rgba(239, 68, 68, 0.1)"
                  : "rgba(16, 185, 129, 0.1)",
              color:
                overdueCount > 0 ? "rgb(239, 68, 68)" : "rgb(16, 185, 129)",
            }}
          >
            <AlertCircle size={18} />
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div
        className={styles.contentGrid}
        style={{ gridTemplateColumns: "1fr 1fr" }}
      >
        {/* Recurring Payments */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionCard__header}>
            <div className={styles.sectionCard__title}>
              <Clock size={16} className="text-[var(--color-accent-primary)]" />
              Recurring Retainers
            </div>
          </div>
          <div className={styles.sectionCard__body}>
            {monthlyContracts.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyState__title}>No active retainers</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {monthlyContracts.map((contract) => (
                  <div key={contract.id} className={styles.paymentCard}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-[var(--color-text-primary)] text-sm">
                          {contract.clientName}
                        </h3>
                        <p className="text-xs text-[var(--color-text-secondary)]">
                          {contract.title}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                          contract.paymentStatus === "overdue"
                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                            : contract.paymentStatus === "due_soon"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        }`}
                      >
                        {contract.paymentStatus === "overdue"
                          ? "OVERDUE"
                          : contract.paymentStatus === "due_soon"
                          ? "DUE SOON"
                          : "UPCOMING"}
                      </span>
                    </div>

                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider mb-0.5">
                          Next Payment
                        </p>
                        <div className="flex items-center gap-1.5 text-[var(--color-text-primary)]">
                          <Calendar
                            size={12}
                            className="text-[var(--color-text-tertiary)]"
                          />
                          <span className="text-xs font-mono">
                            {contract.nextDue.toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[var(--color-text-primary)]">
                          {formatMoney(contract.value || 0)}
                        </p>
                        <p className="text-[10px] text-[var(--color-text-tertiary)]">
                          /mo
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-[var(--color-border-subtle)] flex gap-2">
                      <button
                        onClick={() =>
                          handleAction("Created Receipt", contract.clientName)
                        }
                        className="flex-1 flex items-center justify-center gap-1.5 h-7 text-[10px] font-medium bg-[var(--color-bg-subtle)] hover:bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] rounded transition-colors text-[var(--color-text-secondary)]"
                      >
                        <FileText size={10} />
                        Receipt
                      </button>
                      <button
                        onClick={() =>
                          handleAction("Sent Reminder", contract.clientName)
                        }
                        className="flex-1 flex items-center justify-center gap-1.5 h-7 text-[10px] font-medium bg-[var(--color-bg-subtle)] hover:bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] rounded transition-colors text-[var(--color-text-secondary)]"
                      >
                        <Send size={10} />
                        Remind
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* One-Off Payments */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionCard__header}>
            <div className={styles.sectionCard__title}>
              <CheckCircle2
                size={16}
                className="text-[var(--color-accent-primary)]"
              />
              One-Off Projects
            </div>
          </div>
          <div className={styles.sectionCard__body}>
            {oneOffContracts.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyState__title}>No pending projects</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {oneOffContracts.map((contract) => (
                  <div key={contract.id} className={styles.paymentCard}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-[var(--color-text-primary)] text-sm">
                          {contract.clientName}
                        </h3>
                        <p className="text-xs text-[var(--color-text-secondary)]">
                          {contract.title}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium border bg-blue-500/10 text-blue-400 border-blue-500/20">
                        PROJECT
                      </span>
                    </div>

                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider mb-0.5">
                          Due Date
                        </p>
                        <div className="flex items-center gap-1.5 text-[var(--color-text-primary)]">
                          <Calendar
                            size={12}
                            className="text-[var(--color-text-tertiary)]"
                          />
                          <span className="text-xs font-mono">
                            {contract.nextDue.toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[var(--color-text-primary)]">
                          {formatMoney(contract.value || 0)}
                        </p>
                        <p className="text-[10px] text-[var(--color-text-tertiary)]">
                          Total
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-[var(--color-border-subtle)] flex gap-2">
                      <button
                        onClick={() =>
                          handleAction("Created Invoice", contract.clientName)
                        }
                        className="flex-1 flex items-center justify-center gap-1.5 h-7 text-[10px] font-medium bg-[var(--color-bg-subtle)] hover:bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] rounded transition-colors text-[var(--color-text-secondary)]"
                      >
                        <FileText size={10} />
                        Invoice
                      </button>
                      <button
                        onClick={() =>
                          handleAction("Sent Reminder", contract.clientName)
                        }
                        className="flex-1 flex items-center justify-center gap-1.5 h-7 text-[10px] font-medium bg-[var(--color-bg-subtle)] hover:bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] rounded transition-colors text-[var(--color-text-secondary)]"
                      >
                        <Send size={10} />
                        Remind
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
