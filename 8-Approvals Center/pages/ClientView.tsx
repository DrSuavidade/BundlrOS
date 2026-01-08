import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ApprovalService } from '../services/approvalService';
import { ApprovalRequest, ApprovalStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { CheckCircle2, XCircle, FileText, Loader2, Download } from 'lucide-react';
import { format } from 'date-fns';

export const ClientView: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [approval, setApproval] = useState<ApprovalRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [decisionMade, setDecisionMade] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      if (!token) return;
      const data = await ApprovalService.getByToken(token);
      setApproval(data || null);
      setLoading(false);
    };
    fetch();
  }, [token]);

  const handleQuickAction = async (status: ApprovalStatus) => {
      if(!approval) return;
      setLoading(true);
      await ApprovalService.updateStatus(approval.id, status, "Action taken via Client Link", approval.clientName);
      const updated = await ApprovalService.getById(approval.id);
      if(updated) setApproval(updated);
      setDecisionMade(true);
      setLoading(false);
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>;

  if (!approval) {
      return (
          <div className="text-center py-20">
              <div className="inline-flex bg-red-50 p-4 rounded-full text-red-500 mb-4">
                <XCircle size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Invalid Link</h2>
              <p className="text-slate-500 mt-2">This approval link is invalid or has expired.</p>
          </div>
      );
  }

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500">
      
      {/* Central Card */}
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
        
        {/* Top Status Bar */}
        <div className="bg-slate-50 px-8 py-4 border-b border-slate-100 flex justify-between items-center">
            <span className="text-sm font-medium text-slate-500">Request #{approval.id.slice(-4)}</span>
            <StatusBadge status={approval.status} />
        </div>

        <div className="p-8 md:p-12">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">{approval.title}</h1>
            <p className="text-slate-400 text-sm mb-8">Created {format(new Date(approval.createdAt), 'MMMM do, yyyy')}</p>

            <div className="prose prose-slate max-w-none mb-8 text-slate-600">
                {approval.description}
            </div>

            {/* Attachment Box */}
            {approval.attachmentName && (
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-lg border border-slate-100 flex items-center justify-center text-indigo-600 shadow-sm">
                            <FileText size={24} />
                        </div>
                        <div>
                            <p className="font-medium text-slate-800">{approval.attachmentName}</p>
                            <p className="text-xs text-slate-400">PDF • 2.4 MB</p>
                        </div>
                    </div>
                    <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                        <Download size={20} />
                    </button>
                </div>
            )}

            {/* Action Area */}
            {approval.status === ApprovalStatus.PENDING ? (
                 <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-slate-100">
                    <button 
                        onClick={() => handleQuickAction(ApprovalStatus.REJECTED)}
                        className="flex-1 py-4 px-6 rounded-xl border-2 border-slate-100 hover:border-red-100 hover:bg-red-50 text-slate-600 hover:text-red-700 font-semibold transition-all flex items-center justify-center gap-2"
                    >
                        <XCircle size={20} />
                        Reject Request
                    </button>
                    <button 
                        onClick={() => handleQuickAction(ApprovalStatus.APPROVED)}
                        className="flex-1 py-4 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-200 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                    >
                        <CheckCircle2 size={20} />
                        Approve Request
                    </button>
                 </div>
            ) : (
                <div className="pt-8 border-t border-slate-100 text-center">
                    <div className={`inline-flex p-4 rounded-full mb-4 ${approval.status === ApprovalStatus.APPROVED ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {approval.status === ApprovalStatus.APPROVED ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Decision Recorded</h3>
                    <p className="text-slate-500 mt-2">
                        You have {approval.status.toLowerCase()} this request on {format(new Date(approval.history[0].timestamp), 'PPP')}.
                    </p>
                </div>
            )}

        </div>
      </div>
      
      <div className="text-center mt-8 space-y-2">
         <p className="text-slate-400 text-sm">Need help? Contact <a href="#" className="text-indigo-600 underline decoration-indigo-200 underline-offset-2">support@zenapprove.com</a></p>
      </div>

    </div>
  );
};