import React from 'react';
import { Client } from '../types';
import { AlertTriangle, TrendingDown, Activity } from 'lucide-react';

interface RiskTableProps {
  clients: Client[];
}

const RiskTable: React.FC<RiskTableProps> = ({ clients }) => {
  const sortedClients = [...clients].sort((a, b) => b.riskScore - a.riskScore);

  return (
    <div className="overflow-hidden">
      <table className="min-w-full text-left text-sm whitespace-nowrap">
        <thead className="uppercase tracking-wider border-b border-slate-700 bg-slate-800/50 text-slate-400 font-medium">
          <tr>
            <th scope="col" className="px-6 py-4">Client</th>
            <th scope="col" className="px-6 py-4 text-center">Risk Score</th>
            <th scope="col" className="px-6 py-4 text-center">SLA Status</th>
            <th scope="col" className="px-6 py-4 text-center">Churn Risk</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {sortedClients.map((client) => (
            <tr key={client.id} className="hover:bg-slate-800/50 transition-colors">
              <td className="px-6 py-4 font-medium text-slate-200">
                {client.name}
              </td>
              <td className="px-6 py-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${client.riskScore > 70 ? 'bg-rose-500' : client.riskScore > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${client.riskScore}%` }}
                    />
                  </div>
                  <span className={`text-xs ${client.riskScore > 70 ? 'text-rose-400' : 'text-slate-400'}`}>
                    {client.riskScore}%
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                 <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${client.sla < 90 ? 'bg-rose-500/10 text-rose-400' : client.sla < 95 ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                   <Activity size={12} />
                   {client.sla.toFixed(1)}%
                 </span>
              </td>
              <td className="px-6 py-4 text-center">
                {client.churnRisk ? (
                   <span className="inline-flex items-center gap-1 text-rose-400">
                     <AlertTriangle size={14} />
                     <span className="text-xs font-bold">HIGH</span>
                   </span>
                ) : (
                  <span className="text-slate-600">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RiskTable;