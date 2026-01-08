import React, { useEffect, useState } from 'react';
import { Client } from '../types';
import { MockAPI } from '../services/mockBackend';
import { StatusPill } from '../components/ui/StatusPill';
import { Building2, Plus, MoreHorizontal } from 'lucide-react';

export const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    MockAPI.getClients().then(setClients);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
          <p className="text-slate-500 mt-1">Directory of all client organizations.</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Plus size={18} />
          Add Client
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map(client => (
          <div key={client.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                <Building2 size={20} />
              </div>
              <button className="text-slate-400 hover:text-slate-600">
                <MoreHorizontal size={20} />
              </button>
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 mb-1">{client.name}</h3>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
              <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">{client.code}</span>
              <span>•</span>
              <span>{client.industry}</span>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-400">Added {new Date(client.created_at).toLocaleDateString()}</span>
              <StatusPill status={client.status} />
            </div>
          </div>
        ))}

        {/* Empty State / Add Placeholder */}
        <button className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors h-full min-h-[180px]">
          <Plus size={32} className="mb-2" />
          <span className="font-medium text-sm">Register New Client</span>
        </button>
      </div>
    </div>
  );
};