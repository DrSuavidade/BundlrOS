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
  Inbox,
  Wallet,
} from "lucide-react";
import { useLanguage } from "@bundlros/ui";
import styles from "./Dashboard.module.css";

// Helper to calculate next due date for monthly payments
const getNextDueDate = (startDateStr: string) => {
  if (!startDateStr) return new Date();

  const start = new Date(startDateStr);
  const today = new Date();

  // If the contract starts in the future, the first payment is the start date
  if (start > today) {
    return start;
  }

  const dayOfMonth = start.getDate();
  let nextDue = new Date(today.getFullYear(), today.getMonth(), dayOfMonth);

  // If we passed the day this month, move to next month
  if (nextDue < today) {
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
  const fetchData = () => {
    setLoading(true);
    Promise.all([API.getClients(), API.getContracts()]).then(
      ([clientsData, contractsData]) => {
        setClients(clientsData);
        setContracts(contractsData);
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Enrich contracts with client data and computed status
  const enrichedContracts = contracts.map((contract) => {
    const client = clients.find((c) => c.id === contract.client_id);
    const nextDue =
      contract.payment_type === "monthly"
        ? getNextDueDate(contract.start_date)
        : new Date(contract.end_date || contract.start_date); // Default one-off to end date

    // Simple logic: If due date is within 3 days, it's "due soon"
    // > 7 days away: "Waiting Payment"
    // <= 7 days away: "Due Soon" (or 0-7 days)
    // < 0 days away: "Overdue"
    const diffDays = Math.ceil(
      (nextDue.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    let paymentStatus = "upcoming";
    let dateLabel = "Next Payment";

    if (diffDays < 0) {
      paymentStatus = "overdue";
      dateLabel = "Overdue";
    } else if (diffDays <= 7) {
      paymentStatus = "due_soon";
      dateLabel = "Due Soon";
    } else {
      dateLabel = "Waiting Payment";
    }

    // For projects (one-off), we might want a slightly different label logic or fallback
    // But per user request: "if > 1 week away -> waiting payment", etc.
    // We'll apply this uniformly.

    return {
      ...contract,
      clientName: client?.name || "Unknown Client",
      clientEmail: client?.email,
      nextDue,
      paymentStatus,
      diffDays,
      dateLabel,
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
    (acc, c) => acc + (c.value || 0) - (c.amount_paid || 0),
    0
  );
  const overdueCount = enrichedContracts.filter(
    (c) => c.paymentStatus === "overdue"
  ).length;

  // Calculate Total Income (Sum of all amount_paid)
  const totalIncome = enrichedContracts.reduce(
    (acc, c) => acc + (c.amount_paid || 0),
    0
  );

  const handleAction = (action: string, clientName: string) => {
    alert(`${action} for ${clientName}`);
  };

  const handlePayment = async (contract: ServiceContract) => {
    try {
      const updates: Partial<ServiceContract> = {};
      const currentPaid = contract.amount_paid || 0;
      const totalValue = contract.value || 0;

      if (contract.payment_type === "one_off") {
        const halfValue = totalValue / 2;
        const newAmountPaid = currentPaid + halfValue;
        updates.amount_paid = newAmountPaid;

        // Date logic
        const now = new Date();
        const endDate = contract.end_date ? new Date(contract.end_date) : now;

        // Calculate diff days
        const diffTime = endDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 30) {
          const oneMonthFromNow = new Date();
          oneMonthFromNow.setMonth(now.getMonth() + 1);
          updates.end_date = oneMonthFromNow.toISOString();
        }

        if (newAmountPaid >= totalValue) {
          updates.status = "expired";
        }
      } else {
        // Monthly
        updates.amount_paid = currentPaid + totalValue;

        const currentEndDate = contract.end_date
          ? new Date(contract.end_date)
          : new Date();
        const nextMonth = new Date(currentEndDate);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        updates.end_date = nextMonth.toISOString();
      }

      // Update via API (requires type casting if API definition is strict)
      await (API as any).updateContract(contract.id, updates);

      // Reload data
      fetchData();
    } catch (error) {
      console.error("Payment update failed:", error);
      alert("Failed to update payment");
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>
            <CreditCard
              size={22}
              style={{ color: "var(--color-accent-primary)" }}
            />
            Payment Hub
          </h1>
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

        <div className={styles.statCard}>
          <div
            className={styles.statCard__glow}
            style={{ background: "rgb(234, 179, 8)" }}
          />
          <div className={styles.statCard__content}>
            <p className={styles.statCard__label}>Total Income</p>
            <p className={styles.statCard__value}>{formatMoney(totalIncome)}</p>
            <div className={`${styles.statCard__trend} ${styles.up}`}>
              <TrendingUp size={12} />
              <span>Total Collected</span>
            </div>
          </div>
          <div
            className={styles.statCard__icon}
            style={{
              background: "rgba(234, 179, 8, 0.1)",
              color: "rgb(234, 179, 8)",
            }}
          >
            <Wallet size={18} />
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
                <div className={styles.emptyState__icon}>
                  <Inbox size={24} />
                </div>
                <p className={styles.emptyState__title}>No active retainers</p>
                <p className={styles.emptyState__description}>
                  All monthly subscriptions are processing normally.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {monthlyContracts.map((contract) => (
                  <div key={contract.id} className={styles.paymentCard}>
                    {/* Header */}
                    <div className={styles.cardHeader}>
                      <div className={styles.clientInfo}>
                        <h3 className={styles.clientName}>
                          {contract.clientName}
                        </h3>
                        <p className={styles.contractTitle}>{contract.title}</p>
                      </div>
                      <span
                        className={`${styles.statusBadge} ${
                          contract.paymentStatus === "overdue"
                            ? styles.overdue
                            : contract.paymentStatus === "due_soon"
                            ? styles.due_soon
                            : styles.waiting
                        }`}
                      >
                        {contract.dateLabel}
                      </span>
                    </div>

                    {/* Main Content */}
                    <div className={styles.cardMain}>
                      <div className={styles.amountGroup}>
                        <span className={styles.amountLabel}>
                          Monthly Value
                        </span>
                        <div className="flex items-baseline">
                          <span className={styles.amountValue}>
                            {formatMoney(contract.value || 0)}
                          </span>
                          <span className={styles.amountFrequency}>/mo</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-end">
                        <span className={styles.amountLabel}>Paid</span>
                        <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                          {formatMoney(contract.amount_paid || 0)}
                        </span>
                      </div>
                      <div className={styles.dateGroup}>
                        <span className={styles.dateLabel}>Next Payment</span>
                        <div className={styles.dateValue}>
                          <Calendar size={12} />
                          {contract.nextDue.toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className={styles.cardActions}>
                      <button
                        onClick={() => handlePayment(contract)}
                        className={styles.actionButton}
                      >
                        <CreditCard size={14} />
                        Payment
                      </button>
                      <button
                        onClick={() =>
                          handleAction("Created Receipt", contract.clientName)
                        }
                        className={styles.actionButton}
                      >
                        <FileText size={14} />
                        Receipt
                      </button>
                      <button
                        onClick={() =>
                          handleAction("Sent Reminder", contract.clientName)
                        }
                        className={styles.actionButton}
                      >
                        <Send size={14} />
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
                <div className={styles.emptyState__icon}>
                  <CheckCircle2 size={24} />
                </div>
                <p className={styles.emptyState__title}>No pending projects</p>
                <p className={styles.emptyState__description}>
                  You're all caught up! No one-off projects are currently
                  active.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {oneOffContracts.map((contract) => (
                  <div key={contract.id} className={styles.paymentCard}>
                    {/* Header */}
                    <div className={styles.cardHeader}>
                      <div className={styles.clientInfo}>
                        <h3 className={styles.clientName}>
                          {contract.clientName}
                        </h3>
                        <p className={styles.contractTitle}>{contract.title}</p>
                      </div>
                      <span
                        className={`${styles.statusBadge} ${
                          contract.paymentStatus === "overdue"
                            ? styles.overdue
                            : contract.paymentStatus === "due_soon"
                            ? styles.due_soon
                            : styles.waiting
                        }`}
                      >
                        {contract.dateLabel}
                      </span>
                    </div>

                    {/* Main Content */}
                    <div className={styles.cardMain}>
                      <div className={styles.amountGroup}>
                        <span className={styles.amountLabel}>Total Value</span>
                        <div className="flex items-baseline">
                          <span className={styles.amountValue}>
                            {formatMoney(contract.value || 0)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-end">
                        <span className={styles.amountLabel}>Paid</span>
                        <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                          {formatMoney(contract.amount_paid || 0)}
                        </span>
                      </div>
                      <div className={styles.dateGroup}>
                        <span className={styles.dateLabel}>Due Date</span>
                        <div className={styles.dateValue}>
                          <Calendar size={12} />
                          {contract.nextDue.toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className={styles.cardActions}>
                      <button
                        onClick={() => handlePayment(contract)}
                        disabled={
                          (contract.amount_paid || 0) >= (contract.value || 0)
                        }
                        className={styles.actionButton}
                        style={{
                          opacity:
                            (contract.amount_paid || 0) >= (contract.value || 0)
                              ? 0.5
                              : 1,
                          cursor:
                            (contract.amount_paid || 0) >= (contract.value || 0)
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        <CreditCard size={14} />
                        Payment
                      </button>
                      <button
                        onClick={() =>
                          handleAction("Created Invoice", contract.clientName)
                        }
                        className={styles.actionButton}
                      >
                        <FileText size={14} />
                        Invoice
                      </button>
                      <button
                        onClick={() =>
                          handleAction("Sent Reminder", contract.clientName)
                        }
                        className={styles.actionButton}
                      >
                        <Send size={14} />
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
