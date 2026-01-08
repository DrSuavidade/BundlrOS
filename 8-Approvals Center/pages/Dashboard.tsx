import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApprovalService } from '../services/approvalService';
import { ApprovalRequest, Stats } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { ApprovalStats } from '../components/ApprovalStats';
import { ArrowRight, FileText, Calendar, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const Dashboard: React.FC = () => {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await ApprovalService.getAll();
      const statsData = await ApprovalService.getStats();
      setApprovals(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setStats(statsData);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
      return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
             <div>
                <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wider">Pending Action</h3>
                <p className="text-4xl font-bold text-slate-800 mt-2">{stats?.pending || 0}</p>
             </div>
             <div className="mt-4 text-sm text-slate-400">
                Need attention
             </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
             <div>
                <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wider">Total processed</h3>
                <p className="text-4xl font-bold text-slate-800 mt-2">{(stats?.approved || 0) + (stats?.rejected || 0)}</p>
             </div>
             <div className="mt-4 text-sm text-slate-400">
                Lifetime decisions
             </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
             <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wider mb-2">Distribution</h3>
             {stats && <ApprovalStats stats={stats} />}
        </div>
      </div>

      {/* List Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-semibold text-slate-800">Recent Requests</h3>
            <button className="text-sm text-indigo-600 font-medium hover:text-indigo-800">View All</button>
        </div>
        
        <div className="divide-y divide-slate-100">
            {approvals.map((approval) => (
                <div key={approval.id} className="p-6 hover:bg-slate-50 transition-colors group">
                    <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                            <div className="mt-1 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                                <FileText size={20} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                    <Link to={`/approval/${approval.id}`}>{approval.title}</Link>
                                </h4>
                                <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                                    <span>{approval.clientName}</span>
                                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                    <span className="flex items-center gap-1">
                                        <Calendar size={14} />
                                        {formatDistanceToNow(new Date(approval.createdAt), { addSuffix: true })}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <StatusBadge status={approval.status} />
                            <Link 
                                to={`/approval/${approval.id}`} 
                                className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
                            >
                                <ArrowRight size={20} />
                            </Link>
                        </div>
                    </div>
                </div>
            ))}
            
            {approvals.length === 0 && (
                <div className="p-12 text-center text-slate-400">
                    No approval requests found.
                </div>
            )}
        </div>
      </div>
    </div>
  );
};