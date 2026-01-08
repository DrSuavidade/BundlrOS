import React, { useEffect, useState } from "react";
import { MockAPI } from "../services/mockBackend";
import { Client, Deliverable, SystemEvent } from "../types";
import { StatusPill } from "../components/ui/StatusPill";
import { Activity, Clock, FileCheck, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
        {value}
      </h3>
    </div>
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon size={20} className="text-white" />
    </div>
  </div>
);

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
        <p className="text-slate-500 mt-1">
          System status and recent activity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Clients"
          value={clients.length}
          icon={Activity}
          color="bg-blue-500"
        />
        <StatCard
          title="Active Work Items"
          value={pendingDeliverables}
          icon={Clock}
          color="bg-amber-500"
        />
        <StatCard
          title="Published Items"
          value={publishedDeliverables}
          icon={FileCheck}
          color="bg-emerald-500"
        />
        <StatCard
          title="Recent Events"
          value={events.length}
          icon={AlertCircle}
          color="bg-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Events Log */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-semibold text-slate-900">System Logs</h2>
            <span className="text-xs font-mono text-slate-400">
              LAST 100 EVENTS
            </span>
          </div>
          <div className="flex-1 overflow-auto max-h-[400px]">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-medium sticky top-0">
                <tr>
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3">Event Type</th>
                  <th className="px-6 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.slice(0, 10).map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">
                      {new Date(event.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                        {event.type}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-600 truncate max-w-xs">
                      {event.details}
                    </td>
                  </tr>
                ))}
                {events.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-8 text-center text-slate-400"
                    >
                      No events recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Deliverable Status Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-6">
            Deliverable Status
          </h2>
          <div className="space-y-4">
            {[
              "draft",
              "awaiting_approval",
              "approved",
              "in_qa",
              "ready",
              "published",
            ].map((status) => {
              const count = deliverables.filter(
                (d) => d.status === status
              ).length;
              const percentage = deliverables.length
                ? Math.round((count / deliverables.length) * 100)
                : 0;
              return (
                <div key={status} className="group">
                  <div className="flex justify-between text-xs mb-1">
                    <StatusPill status={status} />
                    <span className="text-slate-500 font-mono">{count}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-8 pt-6 border-t border-slate-100">
            <Link
              to="/deliverables"
              className="text-sm text-indigo-600 font-medium hover:text-indigo-800"
            >
              View All Deliverables &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
