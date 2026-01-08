import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MockService } from '../services/mockData';
import { AutomationRun } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { PlayCircle, ArrowRight } from 'lucide-react';

export const RunsPage: React.FC = () => {
  const [runs, setRuns] = useState<AutomationRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const data = await MockService.getRuns();
      setRuns(data.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()));
      setLoading(false);
    };
    fetch();
    const interval = setInterval(fetch, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Automation Runs</h1>
        <p className="text-slate-400">Global execution history across all workflows.</p>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400">
              <th className="px-6 py-4 font-semibold">Run ID</th>
              <th className="px-6 py-4 font-semibold">Event ID</th>
              <th className="px-6 py-4 font-semibold">Workflow</th>
              <th className="px-6 py-4 font-semibold">Started At</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading runs...</td></tr>
            ) : runs.map((run) => (
              <tr key={run.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4 font-mono text-slate-300">{run.id}</td>
                <td className="px-6 py-4 font-mono text-indigo-400 hover:underline">
                    <Link to={`/events/${run.eventId}`}>{run.eventId}</Link>
                </td>
                <td className="px-6 py-4 text-slate-400">{run.workflowId}</td>
                <td className="px-6 py-4 text-slate-400">
                  {new Date(run.startedAt).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={run.status} size="sm" />
                </td>
                <td className="px-6 py-4 text-right">
                  <Link 
                    to={`/events/${run.eventId}`} // Simplified navigation: go to event to see run details
                    className="text-slate-500 hover:text-indigo-400 inline-flex items-center gap-1 transition-colors"
                  >
                    View <ArrowRight size={14} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
