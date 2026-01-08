import React from 'react';

interface ClientFormProps {
  clientName: string;
  projectName: string;
  notes: string;
  onChange: (field: string, value: string) => void;
  labels: any;
}

export const ClientForm: React.FC<ClientFormProps> = ({ clientName, projectName, notes, onChange, labels }) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6 transition-colors">
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">{labels.projectDetails}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{labels.clientName}</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="e.g. Acme Corp"
            value={clientName}
            onChange={(e) => onChange('clientName', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{labels.projectName}</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="e.g. Q3 Rebranding"
            value={projectName}
            onChange={(e) => onChange('projectName', e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{labels.notes}</label>
          <textarea
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            rows={3}
            placeholder="..."
            value={notes}
            onChange={(e) => onChange('notes', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
