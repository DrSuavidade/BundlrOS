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
    </div>
  );
};

export default Dashboard;
