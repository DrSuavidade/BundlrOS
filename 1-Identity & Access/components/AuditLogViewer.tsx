import React, { useState, useEffect } from 'react';
import { AuditService } from '../services/store';
import { AuditLog } from '../types';
import { GlassCard } from './ui/GlassCard';
import { Terminal } from 'lucide-react';

export const AuditLogViewer: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);

    useEffect(() => {
        setLogs(AuditService.getAll());
    }, []);

    return (
        <div className="p-8 h-screen flex flex-col">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Audit Logs</h1>
                <p className="text-zinc-400">System events and security audit trail.</p>
            </header>

            <GlassCard noPadding className="flex-1 overflow-hidden flex flex-col">
                <div className="p-4 bg-zinc-900/50 border-b border-white/5 flex items-center gap-2">
                    <Terminal size={16} className="text-zinc-500" />
                    <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">System Stream</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-[#0c0c0e]">
                    {logs.map(log => (
                        <div key={log.id} className="font-mono text-sm flex gap-4 py-1 hover:bg-white/5 px-2 rounded cursor-default group">
                            <span className="text-zinc-600 shrink-0 w-40">{new Date(log.timestamp).toLocaleString()}</span>
                            <span className={`shrink-0 w-32 font-bold ${
                                log.action.includes('error') ? 'text-red-400' :
                                log.action.includes('created') ? 'text-green-400' :
                                log.action.includes('updated') ? 'text-blue-400' :
                                log.action.includes('deactivated') ? 'text-orange-400' :
                                'text-purple-400'
                            }`}>
                                {log.action}
                            </span>
                            <span className="text-zinc-300 flex-1">{log.details}</span>
                            <span className="text-zinc-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                ID: {log.id} • By: {log.performerName}
                            </span>
                        </div>
                    ))}
                </div>
            </GlassCard>
        </div>
    );
};