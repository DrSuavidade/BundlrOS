import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApprovalService } from "../services/approvalService";
import { ApprovalRequest, ApprovalStatus, Stats } from "../types";
import {
  ArrowRight,
  FileText,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ClipboardCheck,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import styles from "./Dashboard.module.css";

// Status Badge Component
const StatusBadge: React.FC<{ status: ApprovalStatus }> = ({ status }) => {
  const getVariant = () => {
    switch (status) {
      case ApprovalStatus.APPROVED:
        return styles.approved;
      case ApprovalStatus.REJECTED:
        return styles.rejected;
      case ApprovalStatus.EXPIRED:
        return styles.expired;
      default:
        return styles.pending;
    }
  };

  const getIcon = () => {
    switch (status) {
      case ApprovalStatus.APPROVED:
        return <CheckCircle2 size={10} />;
      case ApprovalStatus.REJECTED:
        return <XCircle size={10} />;
      case ApprovalStatus.EXPIRED:
        return <AlertCircle size={10} />;
      default:
        return <Clock size={10} />;
    }
  };

  const getLabel = () => {
    switch (status) {
      case ApprovalStatus.APPROVED:
        return "Approved";
      case ApprovalStatus.REJECTED:
        return "Rejected";
      case ApprovalStatus.EXPIRED:
        return "Expired";
      default:
        return "Pending";
    }
  };

  return (
    <span className={`${styles.statusBadge} ${getVariant()}`}>
      {getIcon()}
      {getLabel()}
    </span>
  );
};

// Distribution Bar Chart
const DistributionChart: React.FC<{ stats: Stats }> = ({ stats }) => {
  const total = stats.total || 1;
  const data = [
    { label: "Pending", value: stats.pending, color: "rgb(245, 158, 11)" },
    { label: "Approved", value: stats.approved, color: "rgb(16, 185, 129)" },
    { label: "Rejected", value: stats.rejected, color: "rgb(239, 68, 68)" },
  ];

  return (
    <div className={styles.barChart}>
      {data.map(({ label, value, color }) => (
        <div key={label} className={styles.barItem}>
          <span className={styles.barItem__label}>{label}</span>
          <div className={styles.barItem__track}>
            <div
              className={styles.barItem__fill}
              style={{
                width: `${(value / total) * 100}%`,
                background: color,
              }}
            />
          </div>
          <span className={styles.barItem__value}>{value}</span>
        </div>
      ))}
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await ApprovalService.getAll();
      const statsData = await ApprovalService.getStats();
      setApprovals(
        data.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
      setStats(statsData);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>
            <ClipboardCheck
              size={22}
              className="text-[var(--color-accent-primary)]"
            />
            Approvals Center
          </h1>
          <p>Manage and track approval requests across your organization</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div>
            <div className={styles.statCard__label}>Pending Action</div>
            <div className={styles.statCard__value}>{stats?.pending || 0}</div>
          </div>
          <div className={styles.statCard__footer}>Require your attention</div>
        </div>

        <div className={styles.statCard}>
          <div>
            <div className={styles.statCard__label}>Total Processed</div>
            <div className={styles.statCard__value}>
              {(stats?.approved || 0) + (stats?.rejected || 0)}
            </div>
          </div>
          <div className={styles.statCard__footer}>Lifetime decisions</div>
        </div>

        <div className={styles.distributionCard}>
          <div className={styles.distributionCard__label}>Distribution</div>
          {stats && <DistributionChart stats={stats} />}
        </div>
      </div>

      {/* Recent Requests */}
      <div className={styles.requestsCard}>
        <div className={styles.requestsHeader}>
          <span className={styles.requestsTitle}>Recent Requests</span>
          <button className={styles.viewAllButton}>View All</button>
        </div>

        <div>
          {approvals.map((approval) => (
            <div key={approval.id} className={styles.requestItem}>
              <div className={styles.requestItem__main}>
                <div className={styles.requestItem__icon}>
                  <FileText size={16} />
                </div>
                <div className={styles.requestItem__content}>
                  <Link
                    to={`/approval/${approval.id}`}
                    className={styles.requestItem__title}
                  >
                    {approval.title}
                  </Link>
                  <div className={styles.requestItem__meta}>
                    <span>{approval.clientName}</span>
                    <span className={styles.dot} />
                    <span>
                      <Calendar size={10} />
                      {formatDistanceToNow(new Date(approval.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.requestItem__actions}>
                <StatusBadge status={approval.status} />
                <Link
                  to={`/approval/${approval.id}`}
                  className={styles.arrowButton}
                >
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}

          {approvals.length === 0 && (
            <div className={styles.emptyState}>No approval requests found.</div>
          )}
        </div>
      </div>
    </div>
  );
};
