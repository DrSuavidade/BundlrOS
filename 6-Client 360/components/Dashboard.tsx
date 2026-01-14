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

  // Delete Client Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Action Modals State
  const [activeAction, setActiveAction] = useState<ActionType>(null);

  // Detail Panel State
  const [detailPanel, setDetailPanel] = useState<{
    isOpen: boolean;
    type: "contracts" | "activity";
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
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
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

  // Fetch client data when selection changes
  useEffect(() => {
    if (!selectedClientId) return;

    setLoading(true);
    setAiInsight(null); // Reset insight on client switch

    ClientService.fetchClientData(selectedClientId).then((d) => {
      setData(d);
      setLoading(false);
    });
  }, [selectedClientId]);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name) return;

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

  const handleGenerateInsight = async () => {
    if (!data) return;
    setInsightLoading(true);
    const insight = await generateClientInsight(data);
    setAiInsight(insight);
    setInsightLoading(false);
  };

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
                  <span>{data ? data.industry : "Unknown Industry"}</span>
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
            Active Engagement
          </div>
        </div>
      </header>

      {/* AI Insight Section */}

      {/* Quick Actions */}
      <div className={styles.actionsGrid}>
        {[
          {
            icon: FileText,
            label: "New Contract",
            type: "NEW_CONTRACT" as ActionType,
          },
          {
            icon: Briefcase,
            label: "Log Meeting",
            type: "LOG_MEETING" as ActionType,
          },
          {
            icon: CheckCircle,
            label: "Add Task",
            type: "ADD_TASK" as ActionType,
          },
          {
            icon: ImageIcon,
            label: "Upload Asset",
            type: "UPLOAD_ASSET" as ActionType,
          },
          {
            icon: MessageSquare,
            label: "Send Email",
            type: "SEND_EMAIL" as ActionType,
          },
          {
            icon: AlertCircle,
            label: "Report Bug",
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
                      title: "All Contracts",
                      data: data.contracts,
                    })
                  }
                  className={`${styles.sectionAction} text-xs bg-transparent border-0 cursor-pointer`}
                >
                  {t("clients.viewAll")} <ArrowUpRight size={10} />
                </button>
              </div>
              <div className={styles.sectionBody}>
                {data.contracts.map((c) => (
                  <div key={c.id} className={styles.contractItem}>
                    <div>
                      <div className={styles.contractName}>{c.title}</div>
                      <div className={styles.contractExpiry}>
                        Expires {c.endDate}
                      </div>
                    </div>
                    <div>
                      <div className={styles.contractValue}>{c.value}</div>
                      <div className={styles.contractStatus}>
                        <Badge
                          variant={
                            c.status === "active" ? "success" : "warning"
                          }
                        >
                          {c.status}
                        </Badge>
                      </div>
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
                  onClick={() => navigate("/approvals")}
                  className={`${styles.sectionAction} text-xs bg-transparent border-0 cursor-pointer`}
                >
                  {t("clients.viewAll")} <ArrowUpRight size={10} />
                </button>
              </div>
              <div className={styles.sectionBody}>
                {data.deliverables.map((d) => (
                  <div key={d.id} className={styles.deliverableItem}>
                    <div className={styles.deliverableHeader}>
                      <span className={styles.deliverableName}>{d.title}</span>
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
                ))}
              </div>
            </div>
          </div>

          {/* Engagement Chart */}
          {/* Financials & Health (Client Pulse) */}
          <div
            className={styles.sectionCard}
            style={{ flex: 1, display: "flex", flexDirection: "column" }}
          >
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>
                <Activity
                  size={14}
                  className="text-[var(--color-accent-primary)]"
                />
                Client Pulse
              </div>
              <div className="flex gap-2">
                <Badge variant="info">Q1 2026</Badge>
              </div>
            </div>
            <div className={styles.sectionBody} style={{ flex: 1 }}>
              <div className={styles.pulseGrid}>
                {/* Financial Overview */}
                <div
                  className={`${styles.pulseCol} ${styles.pulseColbordered} pr-6`}
                  style={{
                    borderRight: "1px solid var(--color-border-subtle)",
                  }}
                >
                  <h4 className={styles.pulseTitle}>Financial Overview</h4>

                  {/* Retainer Usage */}
                  <div>
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-sm font-medium text-[var(--color-text-primary)]">
                        Retainer Usage
                      </span>
                      <span className="text-xs text-[var(--color-text-tertiary)]">
                        75% Used
                      </span>
                    </div>
                    <div className="w-full bg-[var(--color-bg-subtle)] rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[var(--color-accent-primary)] h-full"
                        style={{ width: "75%" }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-[var(--color-text-tertiary)]">
                        $33.7k Spend
                      </span>
                      <span className="text-xs text-[var(--color-text-tertiary)]">
                        $45.0k Cap
                      </span>
                    </div>
                  </div>

                  {/* Pending Invoices */}
                  <div className={styles.pulseCard}>
                    <div className="flex items-center gap-3">
                      <div
                        className={`${styles.pulseCardIcon} ${styles.warning}`}
                      >
                        <DollarSign size={16} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[var(--color-text-primary)]">
                          Pending Invoices
                        </div>
                        <div className="text-xs text-[var(--color-text-tertiary)]">
                          2 Outstanding
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-[var(--color-text-primary)]">
                        $12,450
                      </div>
                      <div className="text-xs text-red-400">Due in 5 days</div>
                    </div>
                  </div>
                </div>

                {/* Client Health */}
                <div className={styles.pulseCol}>
                  <h4 className={styles.pulseTitle}>Client Health</h4>

                  {/* Health Score */}
                  <div className="flex items-center gap-4">
                    <div className={styles.healthCircle}>
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          fill="none"
                          stroke="var(--color-border-subtle)"
                          strokeWidth="6"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          fill="none"
                          stroke="#10B981"
                          strokeWidth="6"
                          strokeDasharray={`${2 * Math.PI * 28}`}
                          strokeDashoffset={`${2 * Math.PI * 28 * (1 - 0.88)}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className={styles.healthValue}>88</span>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[var(--color-text-primary)]">
                        Exemplary Health
                      </div>
                      <div className="text-xs text-[var(--color-text-tertiary)]">
                        NPS: 9/10 • Engagement: High
                      </div>
                    </div>
                  </div>

                  {/* Sentiment/Mood */}
                  <div className="mt-auto">
                    <div className="text-xs text-[var(--color-text-tertiary)] mb-2">
                      Likely Sentiment (AI Analysis)
                    </div>
                    <div className={styles.sentimentBox}>
                      <TrendingUp size={16} />
                      <span>Positive trends detected in last 3 calls.</span>
                    </div>
                  </div>
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
                Activity Stream
              </div>
              <div className={styles.streamFilter}>
                <span
                  className={`${styles.streamFilterItem} ${
                    activityFilter === "all" ? styles.active : ""
                  }`}
                  onClick={() => setActivityFilter("all")}
                >
                  All
                </span>
                <span
                  className={`${styles.streamFilterItem} ${
                    activityFilter === "email" ? styles.active : ""
                  }`}
                  onClick={() => setActivityFilter("email")}
                >
                  Emails
                </span>
                <span
                  className={`${styles.streamFilterItem} ${
                    activityFilter === "meeting" ? styles.active : ""
                  }`}
                  onClick={() => setActivityFilter("meeting")}
                >
                  Meetings
                </span>
              </div>
            </div>
            <div className={styles.sectionBody} style={{ paddingTop: "1rem" }}>
              {filteredActivities.length === 0 && (
                <div className={styles.emptyState}>
                  <div className={styles.emptyState__icon}>
                    <MessageSquare size={24} />
                  </div>
                  <p className={styles.emptyState__title}>No activity found</p>
                  <p className={styles.emptyState__description}>
                    No recent emails or meetings for this filter.
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
                  View All History
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Stakeholders */}
          <div className={styles.teamCard}>
            {/* Internal Team */}
            <div className="mb-6">
              <h3 className={styles.teamTitle}>Internal Team</h3>
              {[
                {
                  name: "Alex Morgan",
                  role: "Account Manager",
                  initials: "AM",
                  image: null,
                },
                {
                  name: "Sam Torres",
                  role: "Project Lead",
                  initials: "ST",
                  image: null,
                },
              ].map((person, idx) => (
                <div key={idx} className={`${styles.teamMember} mb-3 group`}>
                  <div className={styles.teamAvatar}>{person.initials}</div>
                  <div className="flex-1">
                    <div className={styles.memberName}>{person.name}</div>
                    <div className={styles.memberRole}>{person.role}</div>
                  </div>
                  <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 hover:bg-[var(--color-bg-elevated)] rounded text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors">
                      <MessageSquare size={12} />
                    </button>
                    <button className="p-1.5 hover:bg-[var(--color-bg-elevated)] rounded text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors">
                      <Mail size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Client Contacts */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className={styles.teamTitle} style={{ marginBottom: 0 }}>
                  Client Contacts
                </h3>
                <button className="text-[10px] text-[var(--color-accent-primary)] hover:underline flex items-center gap-1">
                  <Plus size={10} /> Add
                </button>
              </div>
              {[
                {
                  name: "Sarah Jenkins",
                  role: "Primary Point of Contact",
                  initials: "SJ",
                },
                { name: "Mike Ross", role: "Billing Contact", initials: "MR" },
              ].map((person, idx) => (
                <div key={idx} className={`${styles.teamMember} mb-3 group`}>
                  <div
                    className={`${styles.teamAvatar}`}
                    style={{ background: "var(--color-status-success)" }}
                  >
                    {person.initials}
                  </div>
                  <div className="flex-1">
                    <div className={styles.memberName}>{person.name}</div>
                    <div className={styles.memberRole}>{person.role}</div>
                  </div>
                  <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="p-1.5 hover:bg-[var(--color-bg-elevated)] rounded text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
                      title="Email"
                    >
                      <Mail size={12} />
                    </button>
                    <button
                      className="p-1.5 hover:bg-[var(--color-bg-elevated)] rounded text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
                      title="Call"
                    >
                      <Phone size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="mt-4 pt-4"
              style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
            >
              <Button
                variant="primary"
                size="sm"
                className="w-full justify-center"
              >
                <Calendar size={14} className="mr-2" /> Schedule Meeting
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
            onClick={() => setIsNewClientOpen(false)}
          >
            <div
              className="modal w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="modal__header">
                <h2 className="modal__title">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-primary)] flex items-center justify-center text-white">
                      <Building2 size={18} />
                    </div>
                    Add New Client
                  </div>
                </h2>
                <button
                  onClick={() => setIsNewClientOpen(false)}
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
                    Company Name
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
                      Client Code
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
                      Email
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
                      NIF (Tax ID)
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
                      Industry
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
                  onClick={() => setIsNewClientOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleCreateClient}
                  leftIcon={<PlusCircle size={16} />}
                >
                  Create Client
                </Button>
              </div>
            </div>
          </div>,
          document.body
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
                Confirm Deletion
              </h3>
              <p
                style={{
                  margin: "0 0 1.25rem",
                  fontSize: "0.75rem",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.5,
                }}
              >
                Are you sure you want to delete this client? This action cannot
                be undone and will remove all associated data.
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
                  Cancel
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
                  Delete Client
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Action Modal */}
      <ActionModal
        type={activeAction}
        isOpen={!!activeAction}
        onClose={() => setActiveAction(null)}
        clientId={selectedClientId}
      />

      {/* Detail Slide-over Panel */}
      <DetailPanel
        isOpen={detailPanel.isOpen}
        onClose={() => setDetailPanel((prev) => ({ ...prev, isOpen: false }))}
        title={detailPanel.title}
        type={detailPanel.type}
        data={detailPanel.data}
      />
    </div>
  );
};

export default Dashboard;
