import React, { useEffect, useState } from "react";
import { MockAPI } from "../services/mockBackend";
import { Client, Deliverable, SystemEvent } from "../types";
import { StatusPill } from "../components/ui/StatusPill";
import {
  Activity,
  Clock,
  FileCheck,
  AlertCircle,
  TrendingUp,
  Users,
  Zap,
  ArrowUpRight,
  BarChart3,
  Layers,
} from "lucide-react";
import { Link } from "react-router-dom";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
  accentColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  accentColor,
}) => (
  <div className="group relative bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl p-5 transition-all duration-300 hover:border-[var(--color-border-default)] hover:shadow-lg overflow-hidden">
    {/* Accent glow */}
    <div
      className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500 ${accentColor}`}
    />

    <div className="relative flex items-start justify-between">
      <div className="flex-1">
        <p className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">
          {title}
        </p>
        <h3 className="text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">
          {value}
        </h3>
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp
              size={12}
              className={trendUp ? "text-emerald-400" : "text-red-400"}
            />
            <span
              className={`text-xs font-medium ${
                trendUp ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {trend}
            </span>
          </div>
        )}
      </div>
      <div
        className={`p-3 rounded-xl ${accentColor} bg-opacity-10 border border-current border-opacity-20`}
      >
        <Icon size={22} className="opacity-80" />
      </div>
    </div>
  </div>
);

const EventTypeBadge: React.FC<{ type: string }> = ({ type }) => {
  const getTypeStyles = () => {
    switch (type) {
      case "deliverable.created":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "deliverable.updated":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "deliverable.status_changed":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "client.created":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)]";
    }
  };

  const formatType = (t: string) => {
    return t.replace(/\./g, " • ").replace(/_/g, " ").toUpperCase();
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-semibold border ${getTypeStyles()}`}
    >
      {formatType(type)}
    </span>
  );
};

export const Dashboard: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [events, setEvents] = useState<SystemEvent[]>([]);

  useEffect(() => {
    MockAPI.getClients().then(setClients);
    MockAPI.getDeliverables().then(setDeliverables);
    MockAPI.getEvents().then(setEvents);
  }, []);

  const pendingDeliverables = deliverables.filter((d) =>
    ["draft", "awaiting_approval", "in_qa"].includes(d.status)
  ).length;

  const publishedDeliverables = deliverables.filter(
    (d) => d.status === "published"
  ).length;

  const statusData = [
    {
      status: "draft",
      label: "Draft",
      color: "bg-[var(--color-text-tertiary)]",
    },
    {
      status: "awaiting_approval",
      label: "Awaiting Approval",
      color: "bg-amber-500",
    },
    { status: "approved", label: "Approved", color: "bg-blue-500" },
    { status: "in_qa", label: "In QA", color: "bg-purple-500" },
    { status: "ready", label: "Ready", color: "bg-emerald-500" },
    {
      status: "published",
      label: "Published",
      color: "bg-[var(--color-accent-primary)]",
    },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <header className="page-header">
        <div className="page-header__content">
          <h1 className="page-header__title flex items-center gap-3">
            <BarChart3
              className="text-[var(--color-accent-primary)]"
              size={24}
            />
            System Overview
          </h1>
          <p className="page-header__subtitle">
            Real-time dashboard of your core data model and system activity
          </p>
        </div>
        <div className="page-header__actions">
          <div className="status-pill status-pill--live">
            <div className="status-pill__dot" />
            ALL SYSTEMS OPERATIONAL
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="stats-grid mb-8">
        <StatCard
          title="Total Clients"
          value={clients.length}
          icon={Users}
          trend="+12% this month"
          trendUp={true}
          accentColor="text-blue-500"
        />
        <StatCard
          title="Active Work Items"
          value={pendingDeliverables}
          icon={Clock}
          trend={pendingDeliverables > 0 ? "Needs attention" : "All clear"}
          trendUp={pendingDeliverables === 0}
          accentColor="text-amber-500"
        />
        <StatCard
          title="Published Items"
          value={publishedDeliverables}
          icon={FileCheck}
          accentColor="text-emerald-500"
        />
        <StatCard
          title="Recent Events"
          value={events.length}
          icon={Zap}
          accentColor="text-purple-500"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Logs */}
        <div className="lg:col-span-2">
          <div className="card card--elevated h-full flex flex-col">
            <div className="card__header">
              <div className="flex items-center gap-2">
                <Activity
                  size={16}
                  className="text-[var(--color-accent-primary)]"
                />
                <h2 className="card__title">Activity Log</h2>
              </div>
              <span className="text-[10px] font-mono text-[var(--color-text-tertiary)] bg-[var(--color-bg-subtle)] px-2 py-1 rounded border border-[var(--color-border-subtle)]">
                LAST 100 EVENTS
              </span>
            </div>

            <div className="flex-1 overflow-hidden">
              {events.length === 0 ? (
                <div className="empty-state py-12">
                  <div className="empty-state__icon">
                    <AlertCircle size={28} />
                  </div>
                  <p className="empty-state__title">No Activity Yet</p>
                  <p className="empty-state__description">
                    Events will appear here as you interact with the system
                  </p>
                </div>
              ) : (
                <div className="overflow-auto max-h-[400px]">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th style={{ width: "180px" }}>Timestamp</th>
                        <th style={{ width: "200px" }}>Event Type</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.slice(0, 10).map((event) => (
                        <tr key={event.id}>
                          <td className="font-mono text-xs whitespace-nowrap">
                            {new Date(event.timestamp).toLocaleString()}
                          </td>
                          <td>
                            <EventTypeBadge type={event.type} />
                          </td>
                          <td className="truncate max-w-xs">{event.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Deliverable Status Breakdown */}
        <div className="lg:col-span-1">
          <div className="card card--elevated h-full flex flex-col">
            <div className="card__header">
              <div className="flex items-center gap-2">
                <Layers
                  size={16}
                  className="text-[var(--color-accent-primary)]"
                />
                <h2 className="card__title">Deliverable Pipeline</h2>
              </div>
            </div>

            <div className="card__body flex-1">
              <div className="space-y-4">
                {statusData.map(({ status, label, color }) => {
                  const count = deliverables.filter(
                    (d) => d.status === status
                  ).length;
                  const percentage = deliverables.length
                    ? Math.round((count / deliverables.length) * 100)
                    : 0;

                  return (
                    <div key={status} className="group">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${color}`} />
                          <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                            {label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-[var(--color-text-tertiary)]">
                            {percentage}%
                          </span>
                          <span className="text-sm font-bold text-[var(--color-text-primary)]">
                            {count}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-[var(--color-bg-subtle)] rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`${color} h-1.5 rounded-full transition-all duration-700 ease-out`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Stats */}
              <div className="mt-6 pt-6 border-t border-[var(--color-border-subtle)]">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[var(--color-bg-subtle)] rounded-lg p-3 border border-[var(--color-border-subtle)]">
                    <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1">
                      Total
                    </p>
                    <p className="text-xl font-bold text-[var(--color-text-primary)]">
                      {deliverables.length}
                    </p>
                  </div>
                  <div className="bg-[var(--color-bg-subtle)] rounded-lg p-3 border border-[var(--color-border-subtle)]">
                    <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1">
                      Completion
                    </p>
                    <p className="text-xl font-bold text-emerald-400">
                      {deliverables.length
                        ? Math.round(
                            (publishedDeliverables / deliverables.length) * 100
                          )
                        : 0}
                      %
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card__footer">
              <Link
                to="deliverables"
                className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium text-[var(--color-accent-primary)] hover:text-[var(--color-accent-hover)] transition-colors group"
              >
                View All Deliverables
                <ArrowUpRight
                  size={14}
                  className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
