import React from 'react';

interface Props {
  data: any;
  title?: string;
  className?: string;
  error?: boolean;
}

export const JsonDisplay: React.FC<Props> = ({ data, title, className = '', error = false }) => {
  return (
    <div className={`rounded-lg overflow-hidden border ${error ? 'border-rose-900/50 bg-rose-950/10' : 'border-slate-800 bg-slate-900/50'} ${className}`}>
      {title && (
        <div className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b ${error ? 'border-rose-900/50 text-rose-300' : 'border-slate-800 text-slate-400'}`}>
          {title}
        </div>
      )}
      <div className="p-4 overflow-x-auto">
        <pre className={`font-mono text-xs leading-relaxed ${error ? 'text-rose-200' : 'text-slate-300'}`}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
};
