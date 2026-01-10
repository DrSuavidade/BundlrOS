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
  Calendar,
  Target,
  Activity,
  ArrowUpRight,
  PlayCircle,
} from "lucide-react";
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
import { fetchClientData } from "../services/mockData";
import { generateClientInsight } from "../services/geminiService";
import { Button, Badge } from "@bundlros/ui";
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
  const [data, setData] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);

  useEffect(() => {
    fetchClientData("c-101").then((d) => {
      setData(d);
      setLoading(false);
    });
  }, []);

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
          <p className={styles.loadingText}>Loading Client 360...</p>
        </div>
      </div>
    );
  }

  if (!data) return <div>Error loading data.</div>;

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.clientInfo}>
          <div className={styles.clientAvatar}>{data.name.charAt(0)}</div>
          <div className={styles.clientDetails}>
            <h1>
              {data.name}
              <Badge variant="info">{data.tier}</Badge>
            </h1>
            <div className={styles.clientMeta}>
              <span>{data.industry}</span>
              <span>•</span>
              <span>Client Overview</span>
            </div>
          </div>
        </div>
        <div className={styles.statusBadge}>
          <div className={styles.statusDot} />
          Active Engagement
        </div>
      </header>

      {/* AI Insight Section */}
      <section className={styles.aiSection}>
        <div className={styles.aiHeader}>
          <div className={styles.aiTitle}>
            <div className={styles.aiIcon}>
              <Sparkles size={16} className="text-yellow-300" />
            </div>
            <div>
              <h2>AI Cockpit Assistant</h2>
              <p>Powered by Gemini</p>
            </div>
          </div>
          <button
            onClick={handleGenerateInsight}
            disabled={insightLoading}
            className={styles.aiButton}
          >
            {insightLoading ? "Analyzing..." : "Refresh Insight"}
          </button>
        </div>
        <div className={styles.aiContent}>
          {aiInsight ? (
            <p>{aiInsight}</p>
          ) : (
            <div className={styles.aiPlaceholder}>
              <PlayCircle size={16} />
              <span>
                Click "Refresh Insight" to generate a health summary using
                Gemini AI.
              </span>
            </div>
          )}
        </div>
      </section>

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
                  Contracts
                </div>
                <a href="#" className={styles.sectionAction}>
                  View All <ArrowUpRight size={10} />
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
                  Deliverables
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
              <select className="text-xs bg-transparent border border-[var(--color-border-subtle)] rounded px-2 py-1 text-[var(--color-text-secondary)]">
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
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
                Timeline
              </div>
            </div>
            <div className={styles.sectionBody}>
              {data.timeline.map((event, idx) => (
                <TimelineItem
                  key={event.id}
                  event={event}
                  isLast={idx === data.timeline.length - 1}
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
    </div>
  );
};

export default Dashboard;
