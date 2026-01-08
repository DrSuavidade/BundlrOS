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
}> = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-[var(--color-bg-card-hover)] border border-transparent hover:border-[var(--color-border-subtle)] transition-all group shrink-0"
  >
    <div className="bg-[var(--color-accent-subtle)] text-[var(--color-accent-primary)] p-2 rounded-full mb-2 group-hover:scale-110 transition-transform">
      <Icon size={18} />
    </div>
    <span className="text-[10px] font-medium text-[var(--color-text-secondary)] text-center">
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

  return (
    <div className="flex gap-3 relative">
      {!isLast && (
        <div className="absolute left-[15px] top-8 bottom-[-8px] w-px bg-[var(--color-border-subtle)]" />
      )}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border z-10 ${
          event.type === "contract"
            ? "bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning)] border-[var(--color-status-warning)]"
            : "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)]"
        }`}
      >
        {icons[event.type as keyof typeof icons] || <Zap size={14} />}
      </div>
      <div className="pb-6">
        <p className="text-sm font-medium text-[var(--color-text-primary)]">
          {event.title}
        </p>
        <p className="text-xs text-[var(--color-text-secondary)] mb-1">
          {event.description}
        </p>
        <span className="text-[10px] text-[var(--color-text-tertiary)] font-medium uppercase tracking-wider">
          {event.timestamp}
        </span>
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
      <div className="h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[var(--color-accent-primary)] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[var(--color-text-secondary)] text-sm animate-pulse tracking-tight">
            Initializing Cockpit...
          </p>
        </div>
      </div>
    );
  }

  if (!data) return <div>Error loading data.</div>;

  return (
    <div className="h-full">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
            {data.name}
          </h1>
          <Badge variant="info">{data.tier}</Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
          <span className="font-medium text-[var(--color-text-secondary)]">
            {data.industry}
          </span>
          <span className="opacity-30">/</span>
          <span>Overview</span>
        </div>
      </div>

      <div className="space-y-6 pb-12">
        {/* AI Insight Header Section */}
        <section>
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Sparkles size={120} />
            </div>

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-yellow-300" size={20} />
                  <h2 className="font-bold text-lg">AI Cockpit Assistant</h2>
                </div>
                <button
                  onClick={handleGenerateInsight}
                  disabled={insightLoading}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {insightLoading ? "Analyzing..." : "Refresh Insight"}
                </button>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 min-h-[80px]">
                {aiInsight ? (
                  <p className="text-indigo-50 leading-relaxed text-sm animate-fade-in">
                    {aiInsight}
                  </p>
                ) : (
                  <div className="flex items-center gap-3 text-indigo-200">
                    <div
                      className="w-1 h-1 bg-white rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-1 h-1 bg-white rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-1 h-1 bg-white rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                    <span className="text-sm">
                      Click "Refresh Insight" to generate a health summary using
                      Gemini.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Modular Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN (Main Content) */}
          <div className="md:col-span-8 lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick Actions (Full Width) */}
            <div className="md:col-span-2 bg-[var(--color-bg-card)] rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] p-4 flex justify-between items-center shadow-sm overflow-x-auto gap-4">
              <QuickAction icon={FileText} label="New Contract" />
              <QuickAction icon={Briefcase} label="Log Meeting" />
              <QuickAction icon={CheckCircle} label="Add Task" />
              <QuickAction icon={ImageIcon} label="Upload Asset" />
              <div className="h-10 w-px bg-[var(--color-border-subtle)] mx-2"></div>
              <QuickAction icon={MessageSquare} label="Send Email" />
              <QuickAction icon={AlertCircle} label="Report Bug" />
            </div>

            {/* Contracts Card */}
            <div className="md:col-span-1">
              <Card>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-[var(--color-text-primary)] text-sm">
                    Contracts
                  </h3>
                  <button className="text-[10px] text-[var(--color-accent-primary)] hover:underline">
                    View All
                  </button>
                </div>
                <div className="space-y-2">
                  {data.contracts.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-2 rounded-md bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)]"
                    >
                      <div>
                        <h4 className="text-xs font-semibold text-[var(--color-text-primary)]">
                          {c.title}
                        </h4>
                        <span className="text-[10px] text-[var(--color-text-tertiary)]">
                          {c.endDate}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-[var(--color-text-primary)]">
                          {c.value}
                        </div>
                        <Badge
                          variant={
                            c.status === "active" ? "success" : "warning"
                          }
                        >
                          {c.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Deliverables Card */}
            <div className="md:col-span-1">
              <Card>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-[var(--color-text-primary)] text-sm">
                    Deliverables
                  </h3>
                  <button className="text-[10px] text-[var(--color-accent-primary)] hover:underline">
                    Roadmap
                  </button>
                </div>
                <div className="space-y-4">
                  {data.deliverables.map((d) => (
                    <div key={d.id}>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="font-medium text-[var(--color-text-secondary)]">
                          {d.title}
                        </span>
                        <span
                          className={`${
                            d.status === "at-risk"
                              ? "text-[var(--color-status-danger)]"
                              : "text-[var(--color-text-tertiary)]"
                          }`}
                        >
                          {d.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-[var(--color-bg-elevated)] rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-500 ${
                            d.status === "completed"
                              ? "bg-[var(--color-status-success)]"
                              : d.status === "at-risk"
                              ? "bg-[var(--color-status-danger)]"
                              : "bg-[var(--color-accent-primary)]"
                          }`}
                          style={{ width: `${d.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* KPI Chart (Full Width in column) */}
            <div className="md:col-span-2">
              <Card className="min-h-[300px]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-[var(--color-text-primary)] text-sm">
                    Engagement & ROI
                  </h3>
                  <select className="bg-[var(--color-bg-subtle)] border-none text-[10px] text-[var(--color-text-tertiary)] rounded-md focus:ring-0 cursor-pointer">
                    <option>Last 30 Days</option>
                  </select>
                </div>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={data.kpis.engagement}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorEng"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="var(--color-accent-primary)"
                            stopOpacity={0.1}
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
                          borderRadius: "8px",
                          border: "1px solid var(--color-border-subtle)",
                          boxShadow: "var(--shadow-md)",
                          color: "var(--color-text-primary)",
                        }}
                        itemStyle={{
                          color: "var(--color-text-secondary)",
                          fontSize: "10px",
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
              </Card>
            </div>

            {/* Inbox */}
            <div className="md:col-span-1">
              <Card>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-[var(--color-text-primary)] text-sm">
                    Inbox
                  </h3>
                  <span className="bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger)] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {data.inbox.filter((m) => !m.read).length} new
                  </span>
                </div>
                <div className="space-y-0 divide-y divide-[var(--color-border-subtle)]">
                  {data.inbox.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-2 -mx-2 rounded-md cursor-pointer hover:bg-[var(--color-bg-subtle)] transition-colors group ${
                        !msg.read ? "bg-[var(--color-accent-subtle)]" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start mb-0.5">
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
                        className={`text-[10px] ${
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
              </Card>
            </div>

            {/* QA & Approvals Grid */}
            <div className="md:col-span-1 space-y-6">
              <Card className="min-h-fit">
                <h3 className="font-semibold text-[var(--color-text-primary)] text-sm mb-4">
                  Approvals
                </h3>
                <div className="space-y-2">
                  {data.approvals.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center gap-3 p-2 rounded-md border border-[var(--color-border-subtle)] hover:border-[var(--color-accent-primary)] transition-colors"
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${
                          app.type === "Budget"
                            ? "bg-[var(--color-status-success)]"
                            : "bg-purple-500"
                        }`}
                      >
                        {app.type[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-medium text-[var(--color-text-primary)] truncate">
                          {app.description}
                        </p>
                      </div>
                      <button className="text-[10px] bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-active)] px-2 py-0.5 rounded text-[var(--color-text-primary)]">
                        Review
                      </button>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold text-[var(--color-text-primary)] text-sm mb-4">
                  QA Health
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {data.qa.map((q) => (
                    <div
                      key={q.id}
                      className="bg-[var(--color-bg-subtle)] rounded-lg p-2 text-center border border-[var(--color-border-subtle)]"
                    >
                      <div className="text-[9px] text-[var(--color-text-tertiary)] mb-1 truncate">
                        {q.metric}
                      </div>
                      <div
                        className={`text-sm font-bold ${
                          q.status === "warn"
                            ? "text-[var(--color-status-warning)]"
                            : "text-[var(--color-text-primary)]"
                        }`}
                      >
                        {q.value}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Assets */}
            <div className="md:col-span-2">
              <Card>
                <h3 className="font-semibold text-[var(--color-text-primary)] text-sm mb-4">
                  Assets
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {data.assets.map((asset) => (
                    <div
                      key={asset.id}
                      className="group relative aspect-square bg-[var(--color-bg-subtle)] rounded-lg overflow-hidden border border-[var(--color-border-subtle)] cursor-pointer"
                    >
                      {asset.type === "image" ? (
                        <img
                          src={asset.url}
                          alt={asset.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--color-text-tertiary)] bg-[var(--color-bg-elevated)]">
                          <FileText size={24} />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                        <p className="text-[10px] text-white font-medium truncate">
                          {asset.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* RIGHT COLUMN (Timeline & Details) */}
          <div className="md:col-span-4 lg:col-span-3 space-y-6">
            {/* Timeline Widget */}
            <div className="bg-[var(--color-bg-card)] rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] shadow-sm p-5 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-[var(--color-text-primary)] text-sm flex items-center gap-2">
                  <Clock
                    size={14}
                    className="text-[var(--color-text-tertiary)]"
                  />
                  Timeline
                </h3>
              </div>

              <div className="pl-2">
                {data.timeline.map((event, idx) => (
                  <TimelineItem
                    key={event.id}
                    event={event}
                    isLast={idx === data.timeline.length - 1}
                  />
                ))}
              </div>

              <button className="w-full mt-2 py-2 text-[10px] font-medium text-[var(--color-text-secondary)] bg-[var(--color-bg-elevated)] rounded-md hover:bg-[var(--color-bg-card-hover)] transition-colors border border-[var(--color-border-subtle)]">
                View History
              </button>
            </div>

            {/* Account Manager Contact Card */}
            <div className="bg-gradient-to-br from-[#1a1c2e] to-[var(--color-bg-app)] rounded-xl border border-[var(--color-border-subtle)] shadow-lg p-5 text-white">
              <h3 className="text-xs font-semibold text-indigo-200 mb-4">
                Account Manager
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[var(--color-accent-primary)] rounded-full flex items-center justify-center font-bold text-sm">
                  AM
                </div>
                <div>
                  <p className="font-medium text-sm">Alex Morgan</p>
                  <p className="text-[10px] text-indigo-300">
                    Senior Strategist
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs !bg-white/5 !text-white hover:!bg-white/10"
                >
                  <MessageSquare size={14} className="mr-2" /> Chat
                </Button>
                <Button variant="primary" size="sm" className="text-xs">
                  <Briefcase size={14} className="mr-2" /> Meet
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
