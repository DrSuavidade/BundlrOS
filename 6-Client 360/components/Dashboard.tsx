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
  Calendar, // Added Calendar icon
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
    industry: "",
    status: "active" as const,
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

    try {
      const created = await ClientService.createClient(newClient);
      if (created) {
        // Refresh list and select new client
        const list = await ClientService.getClientList();
        setClients(list);
        setSelectedClientId(created.id);
        setIsNewClientOpen(false);
        setNewClient({ name: "", code: "", industry: "", status: "active" });
      }
    } catch (error) {
      console.error("Failed to create client", error);
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
                  <button
                    onClick={() => setIsNewClientOpen(true)}
                    className="flex items-center justify-center w-6 h-6 rounded-full border border-white text-white hover:border-gray-400 hover:text-gray-400 transition-all ml-2"
                    title="Add Client"
                  >
                    <Plus size={14} />
                  </button>
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
        <div className={styles.statusBadge}>
          <div className={styles.statusDot} />
          Active Engagement
        </div>
      </header>

      {/* AI Insight Section */}

      {/* Quick Actions */}
      <div className={styles.actionsGrid}>
        {[
          { icon: FileText, label: "New Contract" },
          { icon: Briefcase, label: "Log Meeting" },
          { icon: CheckCircle, label: "Add Task", accent: true },
          { icon: ImageIcon, label: "Upload Asset" },
          { icon: MessageSquare, label: "Send Email" },
          { icon: AlertCircle, label: "Report Bug" },
        ].map(({ icon: Icon, label, accent }) => (
          <button
            key={label}
            className={`${styles.actionButton} ${accent ? styles.accent : ""}`}
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
                <a href="#" className={styles.sectionAction}>
                  {t("clients.viewAll")} <ArrowUpRight size={10} />
                </a>
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
                <a href="#" className={styles.sectionAction}>
                  Roadmap <ArrowUpRight size={10} />
                </a>
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
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>
                <Activity
                  size={14}
                  className="text-[var(--color-accent-primary)]"
                />
                Engagement & ROI
              </div>
              <select
                className="form-select text-xs"
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  color: "var(--color-text-secondary)",
                  fontWeight: 600,
                  paddingLeft: 0,
                  outline: "none",
                  width: "auto",
                }}
              >
                <option
                  style={{
                    backgroundColor: "var(--color-bg-card)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  Last 30 Days
                </option>
                <option
                  style={{
                    backgroundColor: "var(--color-bg-card)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  Last 90 Days
                </option>
              </select>
            </div>
            <div className={styles.sectionBody}>
              <div style={{ height: 180, width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={data.kpis.engagement}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorEng" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="var(--color-accent-primary)"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-accent-primary)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="var(--color-border-subtle)"
                    />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 9, fill: "var(--color-text-tertiary)" }}
                      dy={8}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 9, fill: "var(--color-text-tertiary)" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--color-bg-card)",
                        borderRadius: "8px",
                        border: "1px solid var(--color-border-subtle)",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                        fontSize: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="var(--color-accent-primary)"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorEng)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Side Column */}
        <div className={styles.sideColumn}>
          {/* Timeline */}
          <div className={`${styles.sectionCard} ${styles.timelineCard}`}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>
                <Clock
                  size={14}
                  className="text-[var(--color-accent-primary)]"
                />
                {t("clients.recentActivity")}
              </div>
            </div>
            <div className={styles.sectionBody}>
              {data.timeline.slice(0, 3).map((event, idx) => (
                <TimelineItem
                  key={event.id}
                  event={event}
                  isLast={idx === 2 || idx === data.timeline.length - 1}
                />
              ))}
            </div>
          </div>

          {/* Account Team */}
          <div className={styles.teamCard}>
            <h3 className={styles.teamTitle}>Account Team</h3>
            {[
              {
                name: "Alex Morgan",
                role: "Senior Strategist",
                initials: "AM",
              },
              { name: "Sam Torres", role: "Project Lead", initials: "ST" },
            ].map((person, idx) => (
              <div key={idx} className={styles.teamMember}>
                <div className={styles.teamAvatar}>{person.initials}</div>
                <div>
                  <div className={styles.memberName}>{person.name}</div>
                  <div className={styles.memberRole}>{person.role}</div>
                </div>
              </div>
            ))}
            <div className={styles.teamActions}>
              <Button
                variant="ghost"
                size="sm"
                className="!bg-white/10 !text-white hover:!bg-white/20 !border-white/10"
              >
                <MessageSquare size={12} className="mr-1.5" /> Chat
              </Button>
              <Button variant="primary" size="sm">
                <Calendar size={12} className="mr-1.5" /> Schedule
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
    </div>
  );
};

export default Dashboard;
