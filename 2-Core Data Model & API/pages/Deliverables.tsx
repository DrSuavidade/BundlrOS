import React, { useEffect, useState } from 'react';
import { 
  Deliverable, DeliverableStatus, Project, Client 
} from '../types';
import { MockAPI } from '../services/mockBackend';
import { StatusPill } from '../components/ui/StatusPill';
import { 
  Plus, Filter, ArrowRight, CheckCircle, XCircle, FileText, 
  ChevronRight, Calendar, Archive
} from 'lucide-react';

const ALLOWED_TRANSITIONS: Record<string, DeliverableStatus[]> = {
  [DeliverableStatus.DRAFT]: [DeliverableStatus.AWAITING_APPROVAL],
  [DeliverableStatus.AWAITING_APPROVAL]: [DeliverableStatus.APPROVED, DeliverableStatus.DRAFT],
  [DeliverableStatus.APPROVED]: [DeliverableStatus.IN_QA],
  [DeliverableStatus.IN_QA]: [DeliverableStatus.READY, DeliverableStatus.QA_FAILED],
  [DeliverableStatus.QA_FAILED]: [DeliverableStatus.IN_QA],
  [DeliverableStatus.READY]: [DeliverableStatus.PUBLISHED],
  [DeliverableStatus.PUBLISHED]: [DeliverableStatus.ARCHIVED],
  [DeliverableStatus.ARCHIVED]: [], // Terminal state
};

export const Deliverables: React.FC = () => {
  const [items, setItems] = useState<Deliverable[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // New Item State
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemProject, setNewItemProject] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [d, p] = await Promise.all([
      MockAPI.getDeliverables(),
      MockAPI.getProjects()
    ]);
    setItems(d);
    setProjects(p);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle || !newItemProject) return;

    await MockAPI.createDeliverable({
      project_id: newItemProject,
      title: newItemTitle,
      type: 'document',
      status: DeliverableStatus.DRAFT,
      version: 'v0.1',
      due_date: new Date().toISOString().split('T')[0]
    });
    
    setIsCreateModalOpen(false);
    setNewItemTitle('');
    setNewItemProject('');
    fetchData();
  };

  const handleTransition = async (id: string, newStatus: DeliverableStatus) => {
    await MockAPI.transitionDeliverable(id, newStatus);
    fetchData();
  };

  const filteredItems = filterStatus === 'all' 
    ? items 
    : items.filter(i => i.status === filterStatus);

  const getTransitionActions = (item: Deliverable) => {
    const targets = ALLOWED_TRANSITIONS[item.status] || [];
    
    return targets.map(target => {
      let label = 'Advance';
      let Icon = ArrowRight;
      let btnClass = 'text-slate-600 hover:bg-slate-100 hover:text-slate-900';

      if (target === DeliverableStatus.APPROVED) {
        label = 'Approve';
        Icon = CheckCircle;
        btnClass = 'text-green-600 hover:bg-green-50';
      } else if (target === DeliverableStatus.QA_FAILED || (item.status === 'awaiting_approval' && target === 'draft')) {
        label = 'Reject/Fail';
        Icon = XCircle;
        btnClass = 'text-red-600 hover:bg-red-50';
      } else if (target === DeliverableStatus.PUBLISHED) {
        label = 'Publish';
        Icon = CheckCircle;
        btnClass = 'text-indigo-600 hover:bg-indigo-50';
      } else if (target === DeliverableStatus.ARCHIVED) {
        label = 'Archive';
        Icon = Archive;
        btnClass = 'text-slate-400 hover:bg-slate-100';
      }

      return (
        <button
          key={target}
          onClick={() => handleTransition(item.id, target)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border border-transparent hover:border-slate-200 ${btnClass}`}
          title={`Move to ${target}`}
        >
          <Icon size={14} className={Icon === Archive ? "" : ""} />
          {label}
        </button>
      );
    });
  };

  return (
    <div>
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Deliverables</h1>
          <p className="text-slate-500 mt-1">Manage project outputs and workflows.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={18} />
          New Deliverable
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-t-xl p-4 flex items-center gap-4">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Filter size={16} />
          <span className="font-medium">Filter Status:</span>
        </div>
        <div className="flex gap-2">
          {['all', 'draft', 'awaiting_approval', 'in_qa', 'published'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`
                px-3 py-1.5 rounded-full text-xs font-medium transition-colors border
                ${filterStatus === status 
                  ? 'bg-slate-100 border-slate-300 text-slate-800' 
                  : 'bg-white border-transparent text-slate-500 hover:bg-slate-50 hover:border-slate-200'}
              `}
            >
              {status.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border-x border-b border-slate-200 rounded-b-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold w-1/4">Title / ID</th>
              <th className="px-6 py-4 font-semibold">Project</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Version</th>
              <th className="px-6 py-4 font-semibold">Actions (State Transition)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.map(item => {
              const project = projects.find(p => p.id === item.project_id);
              return (
                <tr key={item.id} className="hover:bg-slate-50/50 group transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">{item.title}</span>
                      <span className="text-xs font-mono text-slate-400 mt-0.5">#{item.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                      {project?.name || 'Unknown Project'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusPill status={item.status} />
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">
                    {item.version}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 opacity-100 transition-opacity">
                      {getTransitionActions(item)}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  No deliverables found matching current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Simple Create Modal (Inline implementation for brevity in single file requirement context, effectively) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Create Deliverable</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input 
                  type="text" 
                  required
                  value={newItemTitle}
                  onChange={e => setNewItemTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  placeholder="e.g., Q3 Financial Report"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Project</label>
                <select 
                  required
                  value={newItemProject}
                  onChange={e => setNewItemProject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white"
                >
                  <option value="">Select Project...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Create Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};