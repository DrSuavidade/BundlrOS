import React, { useState, useEffect } from 'react';
import { Integration, PROVIDERS, FieldMapping, HealthStatus, LogEntry } from '../types';
import { X, Save, Wand2, ShieldCheck, Activity, Database, ArrowRight, Loader2 } from 'lucide-react';
import { generateSmartMappings, analyzeErrorLog } from '../services/geminiService';

interface IntegrationModalProps {
  integration: Integration;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Integration) => void;
}

export const IntegrationModal: React.FC<IntegrationModalProps> = ({ integration, isOpen, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'mapping' | 'logs'>('settings');
  const [localConfig, setLocalConfig] = useState(integration.config);
  const [mappings, setMappings] = useState<FieldMapping[]>(integration.mappings);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [analyzedError, setAnalyzedError] = useState<string | null>(null);

  const provider = PROVIDERS[integration.providerId];
  
  // Mock source fields (normally would come from Client's internal schema)
  const clientSourceFields = ['id', 'user_email', 'full_name', 'organization', 'phone_number', 'signup_date', 'status_code'];

  useEffect(() => {
    if (isOpen) {
      setLocalConfig(integration.config);
      setMappings(integration.mappings);
      setActiveTab('settings');
      setAnalyzedError(null);
    }
  }, [isOpen, integration]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      ...integration,
      config: localConfig,
      mappings: mappings
    });
    onClose();
  };

  const handleAutoMap = async () => {
    setIsAiLoading(true);
    const newMappings = await generateSmartMappings(clientSourceFields, provider.defaultFields);
    setMappings(newMappings);
    setIsAiLoading(false);
  };

  const analyzeLatestError = async () => {
    const lastError = integration.logs.find(l => l.level === 'error');
    if (lastError) {
      setIsAiLoading(true);
      const analysis = await analyzeErrorLog(lastError.message, provider.name);
      setAnalyzedError(analysis);
      setIsAiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                {provider?.logo}
             </div>
             <div>
               <h2 className="text-lg font-bold text-slate-900">{integration.name}</h2>
               <p className="text-xs text-slate-500">Managing connection to {provider?.name}</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-6">
          <button 
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'settings' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Configuration
          </button>
          <button 
            onClick={() => setActiveTab('mapping')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'mapping' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Field Mapping
          </button>
           <button 
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'logs' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Health & Logs
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          
          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-900">Secure Vault Storage</h4>
                  <p className="text-xs text-blue-700 mt-1">Credentials are encrypted and stored in Vaultwarden. They are never exposed in plain text to the client.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">API Key / Token</label>
                  <div className="relative">
                    <input 
                      type="password" 
                      value={localConfig.apiKey || 'mock-secret-value-123'} 
                      disabled
                      className="w-full pl-3 pr-10 py-2 border border-slate-300 rounded-md bg-slate-50 text-slate-500 text-sm font-mono"
                    />
                    <div className="absolute right-3 top-2.5 text-xs text-emerald-600 font-medium bg-emerald-50 px-2 rounded-full border border-emerald-100">
                      Vaulted
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">To rotate keys, please use the Provider Dashboard.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Endpoint URL</label>
                  <input 
                    type="text" 
                    value={localConfig.endpointUrl || ''}
                    onChange={(e) => setLocalConfig({...localConfig, endpointUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="https://api.example.com/v1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Mapping Tab */}
          {activeTab === 'mapping' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-slate-500">Map fields from your source data to {provider.name}.</p>
                <button 
                  onClick={handleAutoMap}
                  disabled={isAiLoading}
                  className="px-3 py-1.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-md hover:bg-purple-200 flex items-center gap-2 transition-colors"
                >
                  {isAiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                  AI Auto-Map
                </button>
              </div>

              <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                <div className="grid grid-cols-3 gap-4 px-4 py-2 bg-slate-100 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                  <div>Source Field</div>
                  <div className="flex justify-center">Direction</div>
                  <div>Destination ({provider.name})</div>
                </div>
                
                <div className="divide-y divide-slate-200 max-h-[400px] overflow-y-auto">
                  {mappings.map((mapping, idx) => (
                    <div key={idx} className="grid grid-cols-3 gap-4 px-4 py-3 items-center hover:bg-white transition-colors">
                      <div className="font-mono text-xs text-slate-700 bg-white border border-slate-200 px-2 py-1 rounded inline-block w-fit">
                        {mapping.sourceField}
                      </div>
                      <div className="flex justify-center text-slate-400">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                      <div className="font-mono text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded inline-block w-fit">
                        {mapping.destinationField}
                      </div>
                    </div>
                  ))}
                  {mappings.length === 0 && (
                    <div className="p-8 text-center text-slate-400 text-sm">
                      No fields mapped yet. Try Auto-Map.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
                 <div className={`w-3 h-3 rounded-full ${integration.status === HealthStatus.HEALTHY ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                 <div>
                   <p className="text-sm font-medium text-slate-900">Current Status: <span className="uppercase">{integration.status}</span></p>
                   <p className="text-xs text-slate-500">Last health check: 2 minutes ago</p>
                 </div>
                 {integration.status === HealthStatus.FAILED && (
                   <button 
                    onClick={analyzeLatestError}
                    disabled={isAiLoading}
                    className="ml-auto text-xs bg-rose-100 text-rose-700 px-3 py-1.5 rounded-md font-medium hover:bg-rose-200 flex items-center gap-2"
                   >
                     {isAiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                     Analyze Root Cause
                   </button>
                 )}
              </div>

              {analyzedError && (
                 <div className="p-4 bg-purple-50 border border-purple-100 rounded-lg">
                   <h5 className="text-xs font-bold text-purple-800 uppercase mb-1 flex items-center gap-2">
                     <Wand2 className="w-3 h-3"/> AI Analysis
                   </h5>
                   <p className="text-sm text-purple-900 leading-relaxed">{analyzedError}</p>
                 </div>
              )}

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-slate-600 text-xs uppercase font-medium">
                    <tr>
                      <th className="px-4 py-2">Timestamp</th>
                      <th className="px-4 py-2">Level</th>
                      <th className="px-4 py-2">Message</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {[...integration.logs].reverse().map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="px-4 py-2 font-mono text-xs text-slate-500 whitespace-nowrap">
                          {log.timestamp}
                        </td>
                         <td className="px-4 py-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium 
                            ${log.level === 'error' ? 'bg-rose-100 text-rose-800' : 
                              log.level === 'warn' ? 'bg-amber-100 text-amber-800' : 
                              log.level === 'success' ? 'bg-emerald-100 text-emerald-800' : 
                              'bg-slate-100 text-slate-800'}`}>
                            {log.level}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-slate-700 font-mono text-xs truncate max-w-xs" title={log.message}>
                          {log.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 shadow-sm flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};