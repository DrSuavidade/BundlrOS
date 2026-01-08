import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MockService } from '../services/mockData';
import { SystemEvent, AutomationRun, Status } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { JsonDisplay } from '../components/JsonDisplay';
import { ArrowLeft, Clock, Tag, Globe, Share2, AlertCircle, Terminal, Cpu } from 'lucide-react';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<SystemEvent | undefined>(undefined);
  const [runs, setRuns] = useState<AutomationRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
        setLoading(true);
        const e = await MockService.getEvent(id);
        const r = await MockService.getRunsByEvent(id);
        setEvent(e);
        setRuns(r);
        if (r.length > 0 && !selectedRunId) {
            setSelectedRunId(r[0].id);
        }
        setLoading(false);
    };
    load();
  }, [id]);

  const selectedRun = runs.find(r => r.id === selectedRunId);

  if (loading) return <div className="p-8 text-slate-500">Loading detail...</div>;
  if (!event) return <div className="p-8 text-rose-500">Event not found</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/30 px-8 py-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/events" className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold font-mono text-white tracking-tight">{event.type}</h1>
              <StatusBadge status={event.status} />
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500 font-mono">
              <span className="flex items-center gap-1.5"><Tag size={12} /> {event.id}</span>
              <span className="flex items-center gap-1.5"><Clock size={12} /> {new Date(event.createdAt).toISOString()}</span>
              <span className="flex items-center gap-1.5"><Globe size={12} /> {event.clientId}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded shadow-lg shadow-indigo-500/20 transition-all">
                Replay Event
            </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Event Payload & Run List */}
        <div className="w-1/3 border-r border-slate-800 bg-slate-950 flex flex-col overflow-hidden">
           {/* Runs List Section */}
           <div className="flex-1 overflow-y-auto border-b border-slate-800">
             <div className="px-6 py-4 bg-slate-900/20 border-b border-slate-800 sticky top-0 backdrop-blur-md">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Cpu size={14} /> Automation Runs ({runs.length})
                </h3>
             </div>
             <div>
                {runs.map(run => (
                    <div 
                        key={run.id}
                        onClick={() => setSelectedRunId(run.id)}
                        className={`px-6 py-4 border-b border-slate-800/50 cursor-pointer transition-colors ${selectedRunId === run.id ? 'bg-indigo-500/5 border-l-2 border-l-indigo-500' : 'hover:bg-slate-900/30 border-l-2 border-l-transparent'}`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-mono text-xs text-slate-400">{run.id}</span>
                            <StatusBadge status={run.status} size="sm" />
                        </div>
                        <div className="text-xs text-slate-500 mb-2">
                            Workflow: <span className="text-slate-300">{run.workflowId}</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-600 font-mono">
                           <span>{new Date(run.startedAt).toLocaleTimeString()}</span>
                           {run.completedAt && <span>{((new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()) / 1000).toFixed(2)}s</span>}
                        </div>
                    </div>
                ))}
             </div>
           </div>

           {/* Event Payload Section */}
           <div className="h-1/3 border-t border-slate-800 flex flex-col bg-slate-900/10">
              <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/30 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Share2 size={14} /> Event Payload
                  </h3>
                  <span className="text-[10px] font-mono text-slate-600">IDEMPOTENCY: {event.idempotencyKey.slice(0,8)}...</span>
              </div>
              <div className="flex-1 overflow-auto p-4">
                  <pre className="text-[10px] font-mono text-slate-400 leading-relaxed whitespace-pre-wrap">
                      {JSON.stringify(event.payload, null, 2)}
                  </pre>
              </div>
           </div>
        </div>

        {/* Right: Run Detail */}
        <div className="w-2/3 bg-slate-950/50 overflow-y-auto p-8">
            {selectedRun ? (
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="flex items-center justify-between">
                         <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Terminal size={18} className="text-indigo-400" />
                            Run Details
                         </h2>
                         <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                             {selectedRun.id}
                         </span>
                    </div>

                    {selectedRun.error && (
                        <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-4">
                            <h4 className="text-rose-400 text-sm font-semibold flex items-center gap-2 mb-2">
                                <AlertCircle size={16} /> Execution Error
                            </h4>
                            <p className="text-rose-300 text-sm mb-3">{selectedRun.error.message}</p>
                            <pre className="bg-rose-950/30 p-3 rounded text-[11px] font-mono text-rose-300/70 overflow-x-auto border border-rose-500/10">
                                {selectedRun.error.stack}
                            </pre>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-6">
                        <JsonDisplay title="Workflow Input" data={selectedRun.input} />
                        {selectedRun.output && (
                            <JsonDisplay title="Workflow Output" data={selectedRun.output} />
                        )}
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                    <Cpu size={48} className="mb-4 opacity-20" />
                    <p>Select a run to view details</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
