import React, { useEffect, useState } from "react";
import {
  Briefcase,
  CheckCircle,
  Clock,
  FileText,
  TrendingUp,
  AlertCircle,
  MoreHorizontal,
  ShieldCheck,
  Image as ImageIcon,
  Zap,
  Sparkles,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  Target,
  Activity,
  Users,
  ArrowUpRight,
  PlayCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { ClientData } from "../types";
import { fetchClientData } from "../services/mockData";
import { generateClientInsight } from "../services/geminiService";
import { Card, Button, Badge } from "@bundlros/ui";

// --- Utility Components ---

const QuickAction: React.FC<{
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  accent?: boolean;
}> = ({ icon: Icon, label, onClick, accent }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all group shrink-0 border ${
      accent
        ? "bg-[var(--color-accent-subtle)] border-[var(--color-accent-primary)]/20 hover:border-[var(--color-accent-primary)]"
        : "bg-[var(--color-bg-subtle)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] hover:bg-[var(--color-bg-elevated)]"
    }`}
  >
    <div
      className={`p-2.5 rounded-xl mb-2 group-hover:scale-110 transition-transform ${
        accent
          ? "bg-[var(--color-accent-primary)] text-white"
          : "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent-primary)]"
      }`}
    >
      <Icon size={18} />
    </div>
    <span className="text-[10px] font-semibold text-[var(--color-text-secondary)] text-center uppercase tracking-wide">
      {label}
    </span>
  </button>
);

const TimelineItem: React.FC<{ event: any; isLast?: boolean }> = ({
  event,
  isLast,
}) => {
  const icons = {
    meeting: <Briefcase size={14} />,
    delivery: <CheckCircle size={14} />,
    contract: <FileText size={14} />,
    system: <Zap size={14} />,
  };

  const colors = {
    meeting: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    delivery: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    contract: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    system: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };

  return (
    <div className="flex gap-4 relative">
      {!isLast && (
        <div className="absolute left-[17px] top-10 bottom-0 w-px bg-gradient-to-b from-[var(--color-border-subtle)] to-transparent" />
      )}
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border z-10 ${
          colors[event.type as keyof typeof colors] ||
          "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)]"
        }`}
      >
        {icons[event.type as keyof typeof icons] || <Zap size={14} />}
      </div>
      <div className="pb-6 flex-1">
        <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">
          {event.title}
        </p>
        <p className="text-xs text-[var(--color-text-secondary)] mb-2 leading-relaxed">
          {event.description}
        </p>
        <span className="text-[10px] text-[var(--color-text-tertiary)] font-medium bg-[var(--color-bg-subtle)] px-2 py-0.5 rounded-md border border-[var(--color-border-subtle)]">
          {event.timestamp}
        </span>
      </div>
    </div>
  );
};

const SectionHeader: React.FC<{
  title: string;
  icon?: React.ElementType;
  action?: { label: string; onClick?: () => void };
  badge?: string;
}> = ({ title, icon: Icon, action, badge }) => (
  <div className="flex justify-between items-center mb-4">
    <h3 className="font-bold text-[var(--color-text-primary)] text-sm flex items-center gap-2">
      {Icon && <Icon size={16} className="text-[var(--color-accent-primary)]" />}
      {title}
      {badge && (
        <span className="text-[10px] bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger)] px-2 py-0.5 rounded-full font-bold">
          {badge}
        </span>
      )}
    </h3>
    {action && (
      <button className="text-[10px] text-[var(--color-accent-primary)] hover:text-[var(--color-accent-hover)] font-semibold flex items-center gap-1 transition-colors">
        {action.label}
        <ArrowUpRight size={12} />
      </button>
    )}
  </div>
);

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
      <div className="h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-2 border-[var(--color-accent-primary)] border-t-transparent rounded-full animate-spin"></div>
            <Sparkles
              size={20}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--color-accent-primary)]"
            />
          </div>
          <p className="text-[var(--color-text-secondary)] text-sm animate-pulse tracking-tight">
            Initializing Client Cockpit...
          </p>
        </div>
      </div>
    );
  }

  if (!data) return <div>Error loading data.</div>;

  return (
    <div className="page-container pb-12">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-accent-primary)] to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {data.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
                    {data.name}
                  </h1>
                  <Badge variant="info">{data.tier}</Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
                  <span className="font-medium">{data.industry}</span>
                  <span className="opacity-30">•</span>
                  <span>Client Overview</span>
                </div>
              </div>
            </div>
          </div>
          <div className="status-pill status-pill--live">
            <div className="status-pill__dot" />
            ACTIVE ENGAGEMENT
          </div>
        </div>
      </header>

      <div className="space-y-6">
        {/* AI Insight Banner */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 rounded-2xl" />
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl" />

          <div className="relative z-10 p-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Sparkles className="text-yellow-300" size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-lg">AI Cockpit Assistant</h2>
                  <p className="text-xs text-white/70">Powered by Gemini</p>
                </div>
              </div>
              <Button
                onClick={handleGenerateInsight}
                disabled={insightLoading}
                variant="ghost"
                size="sm"
                className="!bg-white/20 hover:!bg-white/30 !text-white !border-white/20"
              >
                {insightLoading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  "Refresh Insight"
                )}
              </Button>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 min-h-[80px]">
              {aiInsight ? (
                <p className="text-indigo-50 leading-relaxed text-sm animate-fade-in">
                  {aiInsight}
                </p>
              ) : (
                <div className="flex items-center gap-3 text-indigo-200">
                  <PlayCircle size={20} className="opacity-60" />
                  <span className="text-sm">
                    Click "Refresh Insight" to generate a health summary using
                    Gemini AI.
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          <QuickAction icon={FileText} label="New Contract" />
          <QuickAction icon={Briefcase} label="Log Meeting" />
          <QuickAction icon={CheckCircle} label="Add Task" accent />
          <QuickAction icon={ImageIcon} label="Upload Asset" />
          <QuickAction icon={MessageSquare} label="Send Email" />
          <QuickAction icon={AlertCircle} label="Report Bug" />
        </section>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-8 space-y-6">
            {/* Contracts & Deliverables Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contracts */}
              <div className="card">
                <div className="card__header">
                  <SectionHeader
                    title="Contracts"
                    icon={FileText}
                    action={{ label: "View All" }}
                  />
                </div>
                <div className="card__body space-y-3">
                  {data.contracts.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] transition-all group cursor-pointer"
                    >
                      <div>
                        <h4 className="text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-primary)] transition-colors">
                          {c.title}
                        </h4>
                        <span className="text-[10px] text-[var(--color-text-tertiary)]">
                          Expires {c.endDate}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-[var(--color-text-primary)] mb-1">
                          {c.value}
                        </div>
                        <Badge variant={c.status === "active" ? "success" : "warning"}>
                          {c.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deliverables */}
              <div className="card">
                <div className="card__header">
                  <SectionHeader
                    title="Deliverables"
                    icon={Target}
                    action={{ label: "Roadmap" }}
                  />
                </div>
                <div className="card__body space-y-4">
                  {data.deliverables.map((d) => (
                    <div key={d.id} className="group">
                      <div className="flex justify-between text-xs mb-2">
                        <span className="font-semibold text-[var(--color-text-primary)]">
                          {d.title}
                        </span>
                        <span
                          className={`font-bold ${
                            d.status === "at-risk"
                              ? "text-[var(--color-status-danger)]"
                              : d.status === "completed"
                              ? "text-emerald-400"
                              : "text-[var(--color-accent-primary)]"
                          }`}
                        >
                          {d.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-[var(--color-bg-subtle)] rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-700 ${
                            d.status === "completed"
                              ? "bg-emerald-500"
                              : d.status === "at-risk"
                              ? "bg-red-500"
                              : "bg-[var(--color-accent-primary)]"
                          }`}
                          style={{ width: `${d.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Engagement Chart */}
            <div className="card card--elevated">
              <div className="card__header">
                <SectionHeader
                  title="Engagement & ROI"
                  icon={Activity}
                  action={{ label: "Full Report" }}
                />
                <select className="form-select text-xs">
                  <option>Last 30 Days</option>
                  <option>Last 90 Days</option>
                </select>
              </div>
              <div className="card__body">
                <div className="h-[220px] w-full">
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
                        tick={{
                          fontSize: 10,
                          fill: "var(--color-text-tertiary)",
                        }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 10,
                          fill: "var(--color-text-tertiary)",
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--color-bg-card)",
                          borderRadius: "12px",
                          border: "1px solid var(--color-border-subtle)",
                          boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
                          color: "var(--color-text-primary)",
                        }}
                        itemStyle={{
                          color: "var(--color-text-secondary)",
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

            {/* Inbox & Approvals Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Inbox */}
              <div className="card">
                <div className="card__header">
                  <SectionHeader
                    title="Inbox"
                    icon={Mail}
                    badge={`${data.inbox.filter((m) => !m.read).length} new`}
                  />
                </div>
                <div className="card__body p-0">
                  <div className="divide-y divide-[var(--color-border-subtle)]">
                    {data.inbox.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-4 cursor-pointer hover:bg-[var(--color-bg-subtle)] transition-colors ${
                          !msg.read ? "bg-[var(--color-accent-subtle)]/30" : ""
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span
                            className={`text-xs ${
                              !msg.read
                                ? "font-bold text-[var(--color-text-primary)]"
                                : "font-medium text-[var(--color-text-secondary)]"
                            }`}
                          >
                            {msg.from}
                          </span>
                          <span className="text-[10px] text-[var(--color-text-tertiary)]">
                            {msg.date}
                          </span>
                        </div>
                        <p
                          className={`text-xs ${
                            !msg.read
                              ? "text-[var(--color-text-primary)]"
                              : "text-[var(--color-text-tertiary)]"
                          } truncate`}
                        >
                          {msg.subject}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Approvals & QA */}
              <div className="space-y-6">
                <div className="card">
                  <div className="card__header py-3">
                    <SectionHeader title="Approvals" icon={ShieldCheck} />
                  </div>
                  <div className="card__body pt-0 space-y-2">
                    {data.approvals.map((app) => (
                      <div
                        key={app.id}
                        className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border-subtle)] hover:border-[var(--color-accent-primary)] transition-all group cursor-pointer"
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
                            app.type === "Budget" ? "bg-emerald-500" : "bg-purple-500"
                          }`}
                        >
                          {app.type[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-[var(--color-text-primary)] truncate">
                            {app.description}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-[10px]">
                          Review
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <div className="card__header py-3">
                    <SectionHeader title="QA Health" icon={ShieldCheck} />
                  </div>
                  <div className="card__body pt-0">
                    <div className="grid grid-cols-3 gap-3">
                      {data.qa.map((q) => (
                        <div
                          key={q.id}
                          className="bg-[var(--color-bg-subtle)] rounded-xl p-3 text-center border border-[var(--color-border-subtle)]"
                        >
                          <div className="text-[10px] text-[var(--color-text-tertiary)] mb-1 font-medium uppercase tracking-wide">
                            {q.metric}
                          </div>
                          <div
                            className={`text-lg font-bold ${
                              q.status === "warn"
                                ? "text-amber-400"
                                : "text-[var(--color-text-primary)]"
                            }`}
                          >
                            {q.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Assets */}
            <div className="card">
              <div className="card__header">
                <SectionHeader
                  title="Assets"
                  icon={ImageIcon}
                  action={{ label: "View Gallery" }}
                />
              </div>
              <div className="card__body">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {data.assets.map((asset) => (
                    <div
                      key={asset.id}
                      className="group relative aspect-square bg-[var(--color-bg-subtle)] rounded-xl overflow-hidden border border-[var(--color-border-subtle)] cursor-pointer hover:border-[var(--color-accent-primary)] transition-all"
                    >
                      {asset.type === "image" ? (
                        <img
                          src={asset.url}
                          alt={asset.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--color-text-tertiary)] bg-[var(--color-bg-elevated)]">
                          <FileText size={32} />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-xs text-white font-medium truncate">
                          {asset.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-4 space-y-6">
            {/* Timeline */}
            <div className="card card--elevated sticky top-24">
              <div className="card__header">
                <SectionHeader title="Timeline" icon={Clock} />
              </div>
              <div className="card__body">
                {data.timeline.map((event, idx) => (
                  <TimelineItem
                    key={event.id}
                    event={event}
                    isLast={idx === data.timeline.length - 1}
                  />
                ))}
                <button className="w-full mt-4 py-2.5 text-xs font-semibold text-[var(--color-text-secondary)] bg-[var(--color-bg-subtle)] rounded-xl hover:bg-[var(--color-bg-elevated)] transition-colors border border-[var(--color-border-subtle)]">
                  View Full History
                </button>
              </div>
            </div>

            {/* Account Team */}
            <div className="relative overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900" />
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl" />
              </div>

              <div className="relative z-10 p-6 text-white">
                <h3 className="text-xs font-bold text-indigo-200 uppercase tracking-wider mb-4">
                  Account Team
                </h3>

                {[
                  { name: "Alex Morgan", role: "Senior Strategist", initials: "AM" },
                  { name: "Sam Torres", role: "Project Lead", initials: "ST" },
                ].map((person, idx) => (
                  <div key={idx} className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-accent-primary)] to-purple-600 rounded-xl flex items-center justify-center font-bold text-sm shadow-lg">
                      {person.initials}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{person.name}</p>
                      <p className="text-[10px] text-indigo-300">{person.role}</p>
                    </div>
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="!bg-white/10 !text-white hover:!bg-white/20 !border-white/10"
                  >
                    <MessageSquare size={14} className="mr-2" /> Chat
                  </Button>
                  <Button variant="primary" size="sm">
                    <Calendar size={14} className="mr-2" /> Schedule
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

