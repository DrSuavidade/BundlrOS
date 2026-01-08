import React from 'react';
import { Report, ReportStatus } from '../types';
import { FileText, CheckCircle2, Clock, Send, ChevronRight, Plus } from 'lucide-react';

interface ReportListProps {
  reports: Report[];
  onSelectReport: (report: Report) => void;
  onRequestReport: () => void;
  isGenerating: boolean;
}

const ReportList: React.FC<ReportListProps> = ({ reports, onSelectReport, onRequestReport, isGenerating }) => {
  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.APPROVED: return 'bg-emerald-100 text-emerald-700';
      case ReportStatus.SENT: return 'bg-blue-100 text-blue-700';
      case ReportStatus.GENERATED: return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.APPROVED: return <CheckCircle2 className="w-3.5 h-3.5 mr-1" />;
      case ReportStatus.SENT: return <Send className="w-3.5 h-3.5 mr-1" />;
      case ReportStatus.GENERATED: return <FileText className="w-3.5 h-3.5 mr-1" />;
      default: return <Clock className="w-3.5 h-3.5 mr-1" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Executive Reports</h1>
          <p className="text-slate-500 mt-1">Manage narrative deliverables and approvals.</p>
        </div>
        <button
          onClick={onRequestReport}
          disabled={isGenerating}
          className={`flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium shadow-sm hover:bg-indigo-700 transition-all ${isGenerating ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Generate New Report</span>
            </>
          )}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {reports.length === 0 ? (
           <div className="p-12 text-center">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-slate-300" />
             </div>
             <h3 className="text-lg font-medium text-slate-900">No reports yet</h3>
             <p className="text-slate-500 mt-1">Generate your first executive summary to get started.</p>
           </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reports.map((report) => (
              <div 
                key={report.id} 
                onClick={() => onSelectReport(report)}
                className="p-5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center mt-1">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {report.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                      <span>{report.period}</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span>Created {new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                    {getStatusIcon(report.status)}
                    {report.status}
                  </span>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportList;