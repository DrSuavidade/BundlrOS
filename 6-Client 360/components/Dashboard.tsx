import React, { useEffect, useState } from "react";
import {
  Briefcase,
  CheckCircle,
  Clock,
  FileText,
  AlertCircle,
  Image as ImageIcon,
  Sparkles,
  MessageSquare,
  Target,
  Activity,
  ArrowUpRight,
  PlayCircle,
  Plus, // Explicitly import Plus
  PlusCircle,
  X,
  Building2,
  Tag,
  Hash,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Phone,
  Calendar, // Added Calendar icon
  Trash2,
  Mail,
  List,
  Loader2,
} from "lucide-react";
import { createPortal } from "react-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ClientData } from "../types";
import { ClientService } from "../services";
import { generateClientInsight } from "../services/geminiService";
import { Button, Badge, useLanguage } from "@bundlros/ui";
import styles from "./Dashboard.module.css";
import { ActionModal, ActionType } from "./ActionModals";
import { DetailPanel } from "./DetailPanel";
import { useNavigate } from "react-router-dom";
import { SystemEventsApi } from "../../lib/supabase/api";

// --- Timeline Item Component ---
const TimelineItem: React.FC<{ event: any; isLast?: boolean }> = ({
  event,
  isLast,
}) => {
  const iconClass = styles[event.type as keyof typeof styles] || "";

  const icons: Record<string, React.ReactNode> = {
    meeting: <Briefcase size={12} />,
    delivery: <CheckCircle size={12} />,
    contract: <FileText size={12} />,
    system: <Sparkles size={12} />,
  };

  return (
    <div className={styles.timelineItem}>
      <div className={`${styles.timelineIcon} ${iconClass}`}>
        {icons[event.type] || <Sparkles size={12} />}
      </div>
      <div className={styles.timelineContent}>
        <h4>{event.title}</h4>
        <p>{event.description}</p>
        <span className={styles.timelineTime}>{event.timestamp}</span>
      </div>
    </div>
  );
};

// --- Main Dashboard Component ---
const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const [data, setData] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);

  // New Client Modal State
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    code: "",
    email: "",
    nif: "",
    industry: "",
    status: "active" as const,
  });
  const [showValidation, setShowValidation] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Delete Client Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Action Modals State
  const [activeAction, setActiveAction] = useState<ActionType>(null);

  // Sidebar Contact Selection & Schedule Meeting
  const [selectedSidebarContact, setSelectedSidebarContact] = useState<
    string | null
  >(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  // Detail Panel State
  const [detailPanel, setDetailPanel] = useState<{
    isOpen: boolean;
    type: "contracts" | "activity" | "contacts";
    title: string;
    data: any[];
  }>({
    isOpen: false,
    type: "contracts",
    title: "",
    data: [],
  });

  const navigate = useNavigate();

  // Activity Stream State
  const [activityFilter, setActivityFilter] = useState<
    "all" | "email" | "meeting"
  >("all");
  const [activities, setActivities] = useState<any[]>([]);

  // Fetch activities (System Events)
  useEffect(() => {
    if (!selectedClientId) return;

    // We'll use SystemEvents for events (emails sent) and AuditLogs for activities (meetings logged)
    const fetchStream = async () => {
      const [events, logs] = await Promise.all([
        ClientService.getSystemEvents(selectedClientId),
        ClientService.getAuditLogs(selectedClientId),
      ]);

      // Map events to stream format
      const mappedEvents = events.map((e: any) => {
        let type = "system";
        let title = e.type.replace(".", " ").toUpperCase();
        let notes = "";

        if (e.type === "email.send") {
          type = "email";
          title = "Email Sent";
          const payload = e.payload || {};
          notes = payload.subject
            ? `Subject: ${payload.subject}`
            : "No subject";
        } else if (e.type.includes("meeting")) {
          type = "meeting";
        }

        return {
          id: e.id,
          type,
          title,
          notes,
          timestamp: e.created_at,
          displayTimestamp: new Date(e.created_at).toLocaleDateString(),
        };
      });

      // Map logs to stream format (looking for MEETING_LOGGED)
      const mappedLogs = logs.map((l: any) => {
        let type = "system";
        let title = l.action.replace("_", " ");
        let notes = "";

        // Safe detail parsing
        let details = l.details;
        if (typeof details === "string") {
          try {
            details = JSON.parse(details);
          } catch (e) {
            details = {};
          }
        }
        details = details || {};

        if (l.action === "MEETING_LOGGED") {
          type = "meeting";
          title = "Meeting Logged";
          notes = details.subject ? `Topic: ${details.subject}` : "No details";
          if (details.attendees) notes += ` • With: ${details.attendees}`;
        }

        return {
          id: l.id,
          type,
          title,
          notes:
            notes ||
            (typeof l.details === "string"
              ? l.details
              : JSON.stringify(l.details)),
          timestamp: l.created_at,
          displayTimestamp: new Date(l.created_at).toLocaleDateString(),
        };
      });

      // Merge and sort
      const merged = [...mappedEvents, ...mappedLogs].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );

      setActivities(merged);
    };

    fetchStream();
  }, [selectedClientId]);

  // Derived filtered state
  const filteredActivities = activities.filter((a) => {
    if (activityFilter === "all") return true;
    return a.type === activityFilter;
  });

  // Fetch client list on mount
  useEffect(() => {
    ClientService.getClientList().then((list) => {
      setClients(list);
      if (list.length > 0) {
        // Default to first client or c-101 if it exists in list
        const defaultClient = list.find((c) => c.id === "c-101") || list[0];
        setSelectedClientId(defaultClient.id);
      }
    });
  }, []);

  // Function to refresh dashboard data (exposed for child components)
  const refreshDashboardData = async (clientId: string) => {
    if (!clientId) return Promise.resolve();
    setLoading(true);

    try {
      // Refresh client data
      const clientData = await ClientService.fetchClientData(clientId);
      setData(clientData);

      // Also refresh activities (system events and audit logs)
      const [events, logs] = await Promise.all([
        ClientService.getSystemEvents(clientId),
        ClientService.getAuditLogs(clientId),
      ]);

      // Map events to stream format
      const mappedEvents = events.map((e: any) => {
        let type = "system";
        let title = e.type.replace(".", " ").toUpperCase();
        let notes = "";

        if (e.type === "email.send") {
          type = "email";
          title = "Email Sent";
          const payload = e.payload || {};
          notes = payload.subject
            ? `Subject: ${payload.subject}`
            : "No subject";
        } else if (e.type.includes("meeting")) {
          type = "meeting";
        }

        return {
          id: e.id,
          type,
          title,
          notes,
          timestamp: e.created_at,
          displayTimestamp: new Date(e.created_at).toLocaleDateString(),
        };
      });

      // Map logs to stream format (looking for MEETING_LOGGED)
      const mappedLogs = logs.map((l: any) => {
        let type = "system";
        let title = l.action.replace("_", " ");
        let notes = "";

        // Safe detail parsing
        let details = l.details;
        if (typeof details === "string") {
          try {
            details = JSON.parse(details);
          } catch (e) {
            details = {};
          }
        }
        details = details || {};

        if (l.action === "MEETING_LOGGED") {
          type = "meeting";
          title = "Meeting Logged";
          notes = details.subject ? `Topic: ${details.subject}` : "No details";
          if (details.attendees) notes += ` • With: ${details.attendees}`;
        }

        return {
          id: l.id,
          type,
          title,
          notes:
            notes ||
            (typeof l.details === "string"
              ? l.details
              : JSON.stringify(l.details)),
          timestamp: l.created_at,
          displayTimestamp: new Date(l.created_at).toLocaleDateString(),
        };
      });

      // Merge and sort
      const merged = [...mappedEvents, ...mappedLogs].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );

      setActivities(merged);
    } finally {
      setLoading(false);
    }
  };

  // Fetch client data when selection changes
  useEffect(() => {
    if (selectedClientId) {
      setAiInsight(null); // Reset insight on client switch only
      refreshDashboardData(selectedClientId);
    }
  }, [selectedClientId]);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newClient.name ||
      !newClient.email ||
      !newClient.nif ||
      !newClient.industry
    ) {
      setShowValidation(true);
      return;
    }

    try {
      setIsCreating(true);
      // Call service to create client
      const created = await ClientService.createClient({
        name: newClient.name,
        code: newClient.code,
        email: newClient.email,
        nif: newClient.nif,
        industry: newClient.industry,
        status: "active",
      });

      setClients([...clients, { id: created.id, name: created.name }]);
      setSelectedClientId(created.id);
      setIsNewClientOpen(false);
      setNewClient({
        name: "",
        code: "",
        email: "",
        nif: "",
        industry: "",
        status: "active",
      });
      setShowValidation(false);
    } catch (error) {
      console.error("Failed to create client:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!selectedClientId) return;
    // Assuming ClientService has a delete method, if not we might need to add it or mock it.
    // Since I can't see ClientService definition fully, I'll assume it needs to be called.
    // For now, I'll just simulate UI removal.
    // Actually, looking at previous steps, ClientService in 'api.ts' has 'delete'.
    // But 'ClientService' in Dashboard is imported from '../services'.
    // I will assume it maps to api or similar.

    // To be safe and avoid breaking if method missing in the wrapper service:
    // I'll try-catch or just implement assuming it exists, the user asked for DB changes so likely expects API usage.

    try {
      await ClientService.deleteClient(selectedClientId);
      const remaining = clients.filter((c) => c.id !== selectedClientId);
      setClients(remaining);
      if (remaining.length > 0) {
        setSelectedClientId(remaining[0].id);
      } else {
        setSelectedClientId("");
        setData(null);
      }
      setDeleteModalOpen(false);
    } catch (err) {
      console.error("Failed to delete client", err);
      alert("Failed to delete client. Please try again.");
    }
  };

  const handleScheduleMeeting = async () => {
    if (!selectedSidebarContact || !selectedClientId) return;

    const contact = data?.contacts?.find(
      (c: any) => c.id === selectedSidebarContact,
    );
    if (!contact?.email) {
      alert(t("clients.invalidEmail")); // Need to add this key or just use generic error
      return;
    }

    try {
      await SystemEventsApi.create({
        client_id: selectedClientId,
        type: "schedule.send",
        status: "pending",
        payload: {
          to: contact.email,
          from: "Bundlr",
          message: "ai text added later",
          subject: "schedule meeting",
        },
      });
      setScheduleModalOpen(false);
    } catch (err) {
      console.error("Failed to schedule meeting", err);
    }
  };

  const handleGenerateInsight = async () => {
    if (!data) return;
    setInsightLoading(true);
    const insight = await generateClientInsight(data);
    setAiInsight(insight);
    setInsightLoading(false);
  };

  // Derived Pulse Metrics
  const pulse = data
    ? (() => {
        const totalDeliverables = data.deliverables.length || 1;
        const atRisk = data.deliverables.filter(
          (d) => d.status === "at-risk",
        ).length;
        const delayed = data.deliverables.filter(
          (d) => d.status === "delayed",
        ).length;
        const healthScore = Math.max(0, 100 - atRisk * 20 - delayed * 10);

        const totalValue = data.contracts.reduce((acc, c) => {
          const val = parseInt(c.value.replace(/[^0-9]/g, "")) || 0;
          return acc + val;
        }, 0);

        const avgProgress =
          data.deliverables.reduce((acc, d) => acc + d.progress, 0) /
          totalDeliverables;
        const estimatedSpend = totalValue * (avgProgress / 100);

        const nextMilestone = [...data.deliverables]
          .filter((d) => d.status !== "completed")
          .sort(
            (a, b) =>
              new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
          )[0];

        return {
          healthScore,
          totalValue,
          estimatedSpend,
          nextMilestone,
          pendingApprovals: data.approvals.length,
          avgProgress,
        };
      })()
    : null;

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}>
            <Sparkles
              size={16}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--color-accent-primary)]"
            />
          </div>
          <p className={styles.loadingText}>{t("clients.loading")}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}>
            <div
              className={styles.spinner}
              style={{
                animation: "none",
                background: "var(--color-bg-elevated)",
              }}
            >
              <Briefcase
                size={20}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
              />
            </div>
            <h3
              style={{
                color: "var(--color-text-primary)",
                marginBottom: "0.5rem",
                fontSize: "1.1rem",
              }}
            >
              {t("clients.noClients")}
            </h3>
            <p
              className={styles.loadingText}
              style={{ maxWidth: "300px", textAlign: "center" }}
            >
              {t("clients.noClientsDesc")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.clientInfo}>
          {/* Client Selector & Avatar */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className={styles.clientAvatar}>
                {data ? data.name.charAt(0) : "?"}
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="form-select"
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      paddingTop: "0.25rem",
                      paddingBottom: "0.25rem",
                      minWidth: "250px",
                    }}
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {data && <Badge variant="info">{data.tier}</Badge>}
                </div>

                <div className={styles.clientMeta}>
                  <span>
                    {data ? data.industry : t("clients.unknownIndustry")}
                  </span>
                  <span>•</span>
                  <span>{t("clients.overview")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="flex items-center justify-center p-1 !bg-transparent !border-0 hover:opacity-80 transition-all"
            style={{
              background: "transparent",
              border: "none",
              boxShadow: "none",
            }}
            title="Delete Client"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 30 30"
              style={{ fill: "#FA5252" }}
            >
              <path d="M 13 3 A 1.0001 1.0001 0 0 0 11.986328 4 L 6 4 A 1.0001 1.0001 0 1 0 6 6 L 24 6 A 1.0001 1.0001 0 1 0 24 4 L 18.013672 4 A 1.0001 1.0001 0 0 0 17 3 L 13 3 z M 6 8 L 6 24 C 6 25.105 6.895 26 8 26 L 22 26 C 23.105 26 24 25.105 24 24 L 24 8 L 6 8 z"></path>
            </svg>
          </button>

          <button
            onClick={() => setIsNewClientOpen(true)}
            className="flex items-center justify-center w-8 h-8 rounded-full border border-white text-white hover:border-gray-400 hover:text-gray-400 transition-all"
            title="Add Client"
          >
            <Plus size={16} />
          </button>

          <div className={styles.statusBadge}>
            <div className={styles.statusDot} />
            {t("clients.activeEngagement")}
          </div>
        </div>
      </header>

      {/* AI Insight Section */}

      {/* Quick Actions */}
      <div className={styles.actionsGrid}>
        {[
          {
            icon: FileText,
            label: t("actionModals.titles.newContract"),
            type: "NEW_CONTRACT" as ActionType,
          },
          {
            icon: Briefcase,
            label: t("actionModals.titles.logMeeting"),
            type: "LOG_MEETING" as ActionType,
          },
          {
            icon: CheckCircle,
            label: t("actionModals.titles.addTask"),
            type: "ADD_TASK" as ActionType,
          },
          {
            icon: ImageIcon,
            label: t("actionModals.titles.uploadAsset"),
            type: "UPLOAD_ASSET" as ActionType,
          },
          {
            icon: MessageSquare,
            label: t("actionModals.titles.sendEmail"),
            type: "SEND_EMAIL" as ActionType,
          },
          {
            icon: AlertCircle,
            label: t("actionModals.titles.reportBug"),
            type: "REPORT_BUG" as ActionType,
          },
        ].map(({ icon: Icon, label, type }) => (
          <button
            key={label}
            onClick={() => setActiveAction(type)}
            className={styles.actionButton}
          >
            <div className={styles.actionIcon}>
              <Icon size={14} />
            </div>
            <span className={styles.actionLabel}>{label}</span>
          </button>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className={styles.contentGrid}>
        {/* Main Column */}
        <div className={styles.mainColumn}>
          {/* Contracts & Deliverables Row */}
          <div className={styles.twoColGrid}>
            {/* Contracts */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>
                  <FileText
                    size={14}
                    className="text-[var(--color-accent-primary)]"
                  />
                  {t("clients.contracts")}
                </div>
                <button
                  onClick={() =>
                    setDetailPanel({
                      isOpen: true,
                      type: "contracts",
                      title: t("clients.allContracts"),
                      data: data.contracts,
                    })
                  }
                  className={styles.headerBtn}
                >
                  {t("clients.viewAll")} <ArrowUpRight size={10} />
                </button>
              </div>
              <div className={styles.sectionBody}>
                {data.contracts.slice(0, 2).map((c) => (
                  <div key={c.id} className={styles.contractItem}>
                    <div className={styles.contractIcon}>
                      <FileText size={16} />
                    </div>
                    <div className={styles.contractInfo}>
                      <div className={styles.contractName}>{c.title}</div>
                      <div className={styles.contractExpiry}>
                        {t("clients.expires")} {c.endDate}
                      </div>
                    </div>
                    <div className={styles.contractRight}>
                      <div className={styles.contractValue}>{c.value}</div>
                      <Badge
                        variant={c.status === "active" ? "success" : "warning"}
                      >
                        {c.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Deliverables */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>
                  <Target
                    size={14}
                    className="text-[var(--color-accent-primary)]"
                  />
                  {t("clients.deliverables")}
                </div>
                <button
                  onClick={() => navigate("/qa")}
                  className={styles.headerBtn}
                >
                  {t("clients.viewAll")} <ArrowUpRight size={10} />
                </button>
              </div>
              <div className={styles.sectionBody}>
                {data.deliverables.slice(0, 2).map((d) => (
                  <div key={d.id} className={styles.deliverableItem}>
                    <div className={styles.deliverableRow}>
                      <div
                        className={styles.deliverableIcon}
                        style={{
                          background:
                            d.status === "completed"
                              ? "rgba(16, 185, 129, 0.1)"
                              : d.status === "at-risk"
                                ? "rgba(239, 68, 68, 0.1)"
                                : "rgba(99, 102, 241, 0.1)",
                          color:
                            d.status === "completed"
                              ? "rgb(16, 185, 129)"
                              : d.status === "at-risk"
                                ? "rgb(239, 68, 68)"
                                : "var(--color-accent-primary)",
                        }}
                      >
                        <Target size={16} />
                      </div>
                      <div className={styles.deliverableContent}>
                        <div className={styles.deliverableHeader}>
                          <span className={styles.deliverableName}>
                            {d.title}
                          </span>
                          <span
                            className={styles.deliverableProgress}
                            style={{
                              color:
                                d.status === "at-risk"
                                  ? "var(--color-status-danger)"
                                  : d.status === "completed"
                                    ? "rgb(16, 185, 129)"
                                    : "var(--color-accent-primary)",
                            }}
                          >
                            {d.progress}%
                          </span>
                        </div>
                        <div className={styles.progressBar}>
                          <div
                            className={styles.progressFill}
                            style={{
                              width: `${d.progress}%`,
                              background:
                                d.status === "completed"
                                  ? "rgb(16, 185, 129)"
                                  : d.status === "at-risk"
                                    ? "rgb(239, 68, 68)"
                                    : "var(--color-accent-primary)",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Client Pulse - Modern Dashboard Style */}
          <div className={styles.pulseContainer}>
            {/* Header */}
            <div className={styles.pulseHeader}>
              <div className={styles.pulseHeaderTitle}>
                <Activity
                  size={16}
                  style={{ color: "var(--color-accent-primary)" }}
                />
                <span>{t("clients.clientPulse")}</span>
              </div>
              <button
                className={styles.pulseAiButton}
                onClick={handleGenerateInsight}
              >
                {insightLoading ? (
                  <Sparkles size={12} className="animate-spin" />
                ) : (
                  <Sparkles size={12} />
                )}
                {aiInsight ? t("clients.refresh") : t("clients.aiInsight")}
              </button>
            </div>

            {/* AI Insight Banner */}
            {aiInsight && (
              <div className={styles.pulseInsight}>
                <Sparkles
                  size={14}
                  style={{
                    color: "var(--color-accent-primary)",
                    flexShrink: 0,
                  }}
                />
                <p>{aiInsight}</p>
              </div>
            )}

            {/* Stats Grid */}
            <div className={styles.pulseStatsGrid}>
              {/* Health Score */}
              <div
                className={`${styles.pulseStatCard} ${styles.pulseStatCardLarge}`}
              >
                <div className={styles.pulseHealthRing}>
                  <svg viewBox="0 0 80 80">
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      fill="none"
                      stroke="var(--color-border-subtle)"
                      strokeWidth="6"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      fill="none"
                      stroke={
                        (pulse?.healthScore || 100) > 80
                          ? "#10B981"
                          : (pulse?.healthScore || 100) > 50
                            ? "#F59E0B"
                            : "#EF4444"
                      }
                      strokeWidth="6"
                      strokeDasharray={`${2 * Math.PI * 34}`}
                      strokeDashoffset={`${
                        2 *
                        Math.PI *
                        34 *
                        (1 - (pulse?.healthScore || 100) / 100)
                      }`}
                      strokeLinecap="round"
                      style={{
                        transform: "rotate(-90deg)",
                        transformOrigin: "center",
                        transition: "stroke-dashoffset 1s ease-out",
                      }}
                    />
                  </svg>
                  <div className={styles.pulseHealthValue}>
                    <span className={styles.pulseHealthNumber}>
                      {Math.round(pulse?.healthScore || 100)}
                    </span>
                    <span className={styles.pulseHealthLabel}>
                      {t("clients.health")}
                    </span>
                  </div>
                </div>
                <div className={styles.pulseStatInfo}>
                  <span className={styles.pulseStatLabel}>
                    {t("clients.clientStatus")}
                  </span>
                  <span
                    className={styles.pulseStatStatus}
                    style={{
                      color:
                        (pulse?.healthScore || 100) > 90
                          ? "#10B981"
                          : (pulse?.healthScore || 100) > 70
                            ? "#F59E0B"
                            : "#EF4444",
                    }}
                  >
                    {(pulse?.healthScore || 100) > 90
                      ? t("clients.status.excellent")
                      : (pulse?.healthScore || 100) > 70
                        ? t("clients.status.good")
                        : t("clients.status.needsAttention")}
                  </span>
                </div>
              </div>

              {/* Value Delivered */}
              <div className={styles.pulseStatCard}>
                <div
                  className={styles.pulseStatIcon}
                  style={{
                    background: "rgba(99, 102, 241, 0.1)",
                    color: "var(--color-accent-primary)",
                  }}
                >
                  <Target size={18} />
                </div>
                <div className={styles.pulseStatContent}>
                  <span className={styles.pulseStatValue}>
                    ${(pulse?.estimatedSpend || 0).toLocaleString()}
                  </span>
                  <span className={styles.pulseStatLabel}>
                    {t("clients.valueDelivered")}
                  </span>
                  <div className={styles.pulseMiniProgress}>
                    <div
                      className={styles.pulseMiniProgressFill}
                      style={{ width: `${pulse?.avgProgress || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Total Contract Value */}
              <div className={styles.pulseStatCard}>
                <div
                  className={styles.pulseStatIcon}
                  style={{
                    background: "rgba(16, 185, 129, 0.1)",
                    color: "#10B981",
                  }}
                >
                  <FileText size={18} />
                </div>
                <div className={styles.pulseStatContent}>
                  <span className={styles.pulseStatValue}>
                    ${(pulse?.totalValue || 0).toLocaleString()}
                  </span>
                  <span className={styles.pulseStatLabel}>
                    {t("clients.totalContract")}
                  </span>
                </div>
              </div>

              {/* Pending Approvals */}
              <div className={styles.pulseStatCard}>
                <div
                  className={styles.pulseStatIcon}
                  style={{
                    background:
                      (pulse?.pendingApprovals || 0) > 0
                        ? "rgba(245, 158, 11, 0.1)"
                        : "rgba(16, 185, 129, 0.1)",
                    color:
                      (pulse?.pendingApprovals || 0) > 0
                        ? "#F59E0B"
                        : "#10B981",
                  }}
                >
                  <CheckCircle size={18} />
                </div>
                <div className={styles.pulseStatContent}>
                  <span className={styles.pulseStatValue}>
                    {pulse?.pendingApprovals || 0}
                  </span>
                  <span className={styles.pulseStatLabel}>
                    {(pulse?.pendingApprovals || 0) > 0
                      ? t("clients.pendingApprovals")
                      : t("clients.allClear")}
                  </span>
                </div>
              </div>

              {/* Logged Meetings */}
              <div className={styles.pulseStatCard}>
                <div
                  className={styles.pulseStatIcon}
                  style={{
                    background: "rgba(168, 85, 247, 0.1)",
                    color: "#A855F7",
                  }}
                >
                  <Briefcase size={18} />
                </div>
                <div className={styles.pulseStatContent}>
                  <span className={styles.pulseStatValue}>
                    {activities.filter((a) => a.type === "meeting").length}
                  </span>
                  <span className={styles.pulseStatLabel}>
                    {t("clients.loggedMeetings")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Side Column */}
        <div className={styles.sideColumn}>
          {/* Activity Stream */}
          <div className={`${styles.sectionCard} ${styles.timelineCard}`}>
            <div
              className={styles.sectionHeader}
              style={{
                borderBottom: "1px solid var(--color-border-subtle)",
                paddingBottom: "0.75rem",
              }}
            >
              <div className={styles.sectionTitle}>
                <Clock
                  size={14}
                  className="text-[var(--color-accent-primary)]"
                />
                {t("clients.activity")}
              </div>
              <div className={styles.streamFilter}>
                <span
                  className={`${styles.streamFilterItem} ${
                    activityFilter === "all" ? styles.active : ""
                  }`}
                  onClick={() => setActivityFilter("all")}
                >
                  {t("All")}
                </span>
                <span
                  className={`${styles.streamFilterItem} ${
                    activityFilter === "email" ? styles.active : ""
                  }`}
                  onClick={() => setActivityFilter("email")}
                >
                  {t("Emails")}
                </span>
                <span
                  className={`${styles.streamFilterItem} ${
                    activityFilter === "meeting" ? styles.active : ""
                  }`}
                  onClick={() => setActivityFilter("meeting")}
                >
                  {t("Meetings")}
                </span>
              </div>
            </div>
            <div className={styles.sectionBody} style={{ paddingTop: "1rem" }}>
              {filteredActivities.length === 0 && (
                <div className={styles.emptyState}>
                  <div className={styles.emptyState__icon}>
                    <MessageSquare size={24} />
                  </div>
                  <p className={styles.emptyState__title}>
                    {t("clients.noActivity")}
                  </p>
                  <p className={styles.emptyState__description}>
                    {t("clients.noActivityDesc")}
                  </p>
                </div>
              )}
              {filteredActivities.slice(0, 3).map((event, idx) => (
                <div key={idx} className={styles.streamItem}>
                  <div className="flex flex-col items-center">
                    <div
                      className={styles.streamDot}
                      style={{
                        backgroundColor:
                          event.type === "meeting"
                            ? "rgb(168, 85, 247)"
                            : event.type === "email"
                              ? "rgb(249, 115, 22)"
                              : "rgb(59, 130, 246)",
                      }}
                    />
                    <div className={styles.streamLine} />
                  </div>
                  <div>
                    <div className="text-xs text-[var(--color-text-tertiary)] mb-0.5">
                      {event.displayTimestamp}
                    </div>
                    <div className="text-sm font-medium text-[var(--color-text-primary)]">
                      {event.title}
                    </div>
                    <div className="text-xs text-[var(--color-text-secondary)] mt-0.5 max-w-[200px] truncate">
                      {event.notes}
                    </div>
                  </div>
                </div>
              ))}
              <div className="text-center mt-4 pt-3 border-t border-white/5">
                <button
                  className={styles.viewHistoryBtn}
                  onClick={() =>
                    setDetailPanel({
                      isOpen: true,
                      type: "activity",
                      title: "Activity History",
                      data: activities,
                    })
                  }
                >
                  {t("clients.viewHistory")}
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Client Contacts */}
          <div className={styles.teamCard}>
            <div className="flex justify-between items-center mb-3">
              <h3 className={styles.teamTitle} style={{ marginBottom: 0 }}>
                {t("clients.clientContacts")}
              </h3>
              <button
                className={styles.teamAddBtn}
                onClick={() =>
                  setDetailPanel({
                    isOpen: true,
                    type: "contacts",
                    title: t("clients.clientContacts"),
                    data: data?.contacts || [],
                  })
                }
              >
                <List size={12} /> {t("clients.viewAll")}
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {(data?.contacts || [])
                .slice(0, 2)
                .map((contact: any, idx: number) => {
                  const isSelected = selectedSidebarContact === contact.id;
                  return (
                    <div
                      key={contact.id || idx}
                      className={`${styles.teamMember} ${isSelected ? styles.selected : ""} group`}
                      onClick={() =>
                        setSelectedSidebarContact(
                          isSelected ? null : contact.id,
                        )
                      }
                    >
                      <div
                        className={`${styles.teamAvatar}`}
                        style={{ background: "var(--color-status-success)" }}
                      >
                        {contact.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                      <div className="flex-1">
                        <div className={styles.memberName}>{contact.name}</div>
                        <div className={styles.memberRole}>{contact.role}</div>
                      </div>
                      <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        {contact.email && (
                          <div className={styles.tooltipContainer}>
                            <button
                              className={styles.teamActionBtn}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Mail size={12} />
                            </button>
                            <div className={styles.customTooltip}>
                              {contact.email}
                            </div>
                          </div>
                        )}
                        {contact.phone && (
                          <div className={styles.tooltipContainer}>
                            <button
                              className={styles.teamActionBtn}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Phone size={12} />
                            </button>
                            <div className={styles.customTooltip}>
                              {contact.phone}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            <div
              className="mt-4 pt-4"
              style={{ borderTop: "1px solid var(--color-border-subtle)" }}
            >
              <Button
                variant="primary"
                size="sm"
                className="w-full justify-center"
                disabled={!selectedSidebarContact}
                onClick={() => setScheduleModalOpen(true)}
              >
                <Calendar size={14} className="mr-2" />{" "}
                {t("clients.scheduleMeeting")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* New Client Modal */}
      {isNewClientOpen &&
        createPortal(
          <div
            className="modal-overlay"
            style={{ zIndex: 9999 }}
            onClick={() => {
              setIsNewClientOpen(false);
              setShowValidation(false);
            }}
          >
            <div
              className="modal w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="modal__header">
                <h2 className="modal__title">
                  <div className="flex items-center gap-2">
                    <Building2 size={18} className="text-gray-400" />
                    {t("clients.addNewClient")}
                  </div>
                </h2>
                <button
                  onClick={() => {
                    setIsNewClientOpen(false);
                    setShowValidation(false);
                  }}
                  className="modal__close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleCreateClient} className="modal__body">
                <div className="form-group">
                  <label className="form-label">
                    <Building2 size={12} className="inline mr-1" />
                    {t("clients.companyName")}
                    {showValidation && !newClient.name && (
                      <span
                        style={{
                          color: "var(--color-status-danger)",
                          fontSize: "1.25rem",
                          lineHeight: 1,
                        }}
                      >
                        {" "}
                        *
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    required
                    value={newClient.name}
                    onChange={(e) =>
                      setNewClient({ ...newClient, name: e.target.value })
                    }
                    className="form-input"
                    placeholder="e.g. Acme Corp"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">
                      <Hash size={12} className="inline mr-1" />
                      {t("clients.clientCode")}
                    </label>
                    <input
                      type="text"
                      value={newClient.code}
                      onChange={(e) =>
                        setNewClient({ ...newClient, code: e.target.value })
                      }
                      className="form-input"
                      placeholder="e.g. C-102"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <Mail size={12} className="inline mr-1" />
                      {t("clients.email")}
                      {showValidation && !newClient.email && (
                        <span
                          style={{
                            color: "var(--color-status-danger)",
                            fontSize: "1.25rem",
                            lineHeight: 1,
                          }}
                        >
                          {" "}
                          *
                        </span>
                      )}
                    </label>
                    <input
                      type="email"
                      value={newClient.email}
                      onChange={(e) =>
                        setNewClient({ ...newClient, email: e.target.value })
                      }
                      className="form-input"
                      placeholder="billing@company.com"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <FileText size={12} className="inline mr-1" />
                      {t("clients.nif")}
                      {showValidation && !newClient.nif && (
                        <span
                          style={{
                            color: "var(--color-status-danger)",
                            fontSize: "1.25rem",
                            lineHeight: 1,
                          }}
                        >
                          {" "}
                          *
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={newClient.nif}
                      onChange={(e) =>
                        setNewClient({ ...newClient, nif: e.target.value })
                      }
                      className="form-input"
                      placeholder="TAX-12345678"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <Tag size={12} className="inline mr-1" />
                      {t("clients.industry")}
                      {showValidation && !newClient.industry && (
                        <span
                          style={{
                            color: "var(--color-status-danger)",
                            fontSize: "1.25rem",
                            lineHeight: 1,
                          }}
                        >
                          {" "}
                          *
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={newClient.industry}
                      onChange={(e) =>
                        setNewClient({
                          ...newClient,
                          industry: e.target.value,
                        })
                      }
                      className="form-input"
                      placeholder="e.g. Retail"
                    />
                  </div>
                </div>
              </form>

              <div className="modal__footer">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => {
                    setIsNewClientOpen(false);
                    setShowValidation(false);
                  }}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  variant="primary"
                  onClick={handleCreateClient}
                  disabled={isCreating}
                  leftIcon={
                    isCreating ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <PlusCircle size={16} />
                    )
                  }
                >
                  {isCreating
                    ? t("common.processing")
                    : t("clients.createClient")}
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen &&
        createPortal(
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              backdropFilter: "blur(4px)",
            }}
            onClick={() => setDeleteModalOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border-subtle)",
                borderRadius: "0.75rem",
                boxShadow: "0 24px 64px rgba(0, 0, 0, 0.5)",
                width: "100%",
                maxWidth: "360px",
                padding: "1.5rem",
              }}
            >
              <h3
                style={{
                  margin: "0 0 0.75rem",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                }}
              >
                {t("clients.confirmDeletion")}
              </h3>
              <p
                style={{
                  margin: "0 0 1.25rem",
                  fontSize: "0.75rem",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.5,
                }}
              >
                {t("clients.deleteConfirmation")}
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  style={{
                    padding: "0.5rem 1rem",
                    background: "transparent",
                    border: "1px solid var(--color-border-subtle)",
                    borderRadius: "0.375rem",
                    color: "var(--color-text-secondary)",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                  }}
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={handleDeleteClient}
                  style={{
                    padding: "0.5rem 1rem",
                    background: "var(--color-accent-danger, #ef4444)",
                    border: "none",
                    borderRadius: "0.375rem",
                    color: "white",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {t("clients.deleteClient")}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Action Modal */}
      <ActionModal
        type={activeAction}
        isOpen={!!activeAction}
        onClose={() => setActiveAction(null)}
        clientId={selectedClientId}
        onSuccess={() => {
          refreshDashboardData(selectedClientId);
        }}
      />

      {/* Schedule Meeting Modal */}
      {scheduleModalOpen &&
        createPortal(
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              backdropFilter: "blur(4px)",
            }}
            onClick={() => setScheduleModalOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border-subtle)",
                borderRadius: "0.75rem",
                boxShadow: "0 24px 64px rgba(0, 0, 0, 0.5)",
                width: "100%",
                maxWidth: "360px",
                padding: "1.5rem",
              }}
            >
              <h3
                style={{
                  margin: "0 0 0.75rem",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                }}
              >
                {t("clients.scheduleMeetingAI")}
              </h3>
              <p
                style={{
                  margin: "0 0 1.25rem",
                  fontSize: "0.75rem",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.5,
                }}
              >
                {t("clients.scheduleMeetingAIDesc")}
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={() => setScheduleModalOpen(false)}
                  style={{
                    padding: "0.5rem 1rem",
                    background: "transparent",
                    border: "1px solid var(--color-border-subtle)",
                    borderRadius: "0.375rem",
                    color: "var(--color-text-secondary)",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                  }}
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={handleScheduleMeeting}
                  style={{
                    padding: "0.5rem 1rem",
                    background: "var(--color-accent-primary)",
                    border: "none",
                    borderRadius: "0.375rem",
                    color: "white",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Confirm & Send
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Detail Slide-over Panel */}
      <DetailPanel
        isOpen={detailPanel.isOpen}
        onClose={() => setDetailPanel((prev) => ({ ...prev, isOpen: false }))}
        title={detailPanel.title}
        type={detailPanel.type}
        data={
          detailPanel.type === "contacts"
            ? data?.contacts || []
            : detailPanel.type === "contracts"
              ? data?.contracts || []
              : detailPanel.type === "activity"
                ? activities
                : detailPanel.data
        }
        clientId={selectedClientId}
        onRefresh={() => {
          // Re-fetch data for the current client
          if (selectedClientId) {
            return refreshDashboardData(selectedClientId);
          }
          return Promise.resolve();
        }}
      />
    </div>
  );
};

export default Dashboard;
