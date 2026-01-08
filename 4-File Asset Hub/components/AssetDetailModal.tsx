import React, { useState, useEffect } from 'react';
import { Asset, Deliverable, AssetType } from '../types';
import { X, Download, Tag, Box, Sparkles, Layers, FileCode } from 'lucide-react';
import Button from './Button';
import { format } from 'date-fns';
import { geminiService } from '../services/geminiService';
import { backend } from '../services/mockBackend';

interface AssetDetailModalProps {
  asset: Asset;
  onClose: () => void;
  onUpdate: (updatedAsset: Asset) => void;
  deliverables: Deliverable[];
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({ asset, onClose, onUpdate, deliverables }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'versions'>('info');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState<string>(asset.deliverableId || '');
  const [isSaving, setIsSaving] = useState(false);

  // Convert image URL to base64 for Gemini (In real app, backend handles this or frontend fetches blob)
  const urlToBase64 = async (url: string): Promise<string> => {
    const data = await fetch(url);
    const blob = await data.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  };

  const handleAIAnalysis = async () => {
    if (asset.type !== AssetType.IMAGE) return;
    setIsAnalyzing(true);
    try {
      const base64Full = await urlToBase64(asset.previewUrl);
      const base64Data = base64Full.split(',')[1];
      const result = await geminiService.analyzeImage(base64Data, asset.mimeType);
      
      const updatedAsset = await backend.updateAssetMetadata(asset.id, result.tags, result.description);
      onUpdate(updatedAsset);
    } catch (e) {
      console.error("Analysis failed", e);
      alert("Failed to analyze image. Check API Key or Console.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAttach = async () => {
    if (!selectedDeliverable || selectedDeliverable === asset.deliverableId) return;
    setIsSaving(true);
    try {
        const updated = await backend.attachAssetToDeliverable(asset.id, selectedDeliverable);
        onUpdate(updated);
    } finally {
        setIsSaving(false);
    }
  };

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl h-[85vh] rounded-2xl flex overflow-hidden shadow-2xl relative">
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
        >
            <X size={20} />
        </button>

        {/* Left: Preview */}
        <div className="w-2/3 bg-black flex items-center justify-center relative group">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800/20 via-black to-black pointer-events-none" />
            
            {asset.type === AssetType.IMAGE ? (
                <img src={asset.previewUrl} alt={asset.filename} className="max-w-full max-h-full object-contain shadow-2xl" />
            ) : (
                <div className="text-slate-500 flex flex-col items-center">
                    <FileCode size={80} />
                    <p className="mt-4 text-lg font-medium">Preview not available</p>
                </div>
            )}
        </div>

        {/* Right: Sidebar */}
        <div className="w-1/3 border-l border-slate-800 bg-slate-900 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-800">
                <h2 className="text-xl font-semibold text-white truncate" title={asset.filename}>{asset.filename}</h2>
                <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">
                        {asset.mimeType}
                    </span>
                    <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">
                        {(asset.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <span className="text-xs font-mono bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded border border-indigo-500/20">
                        v{asset.currentVersion}
                    </span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-800">
                <button 
                    onClick={() => setActiveTab('info')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'info' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    Metadata
                </button>
                <button 
                    onClick={() => setActiveTab('versions')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'versions' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    History
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {activeTab === 'info' ? (
                    <>
                        {/* Attach Deliverable */}
                        <div className="space-y-3">
                            <label className="text-xs font-semibold uppercase text-slate-500 flex items-center gap-2">
                                <Box size={14} /> Attached Deliverable
                            </label>
                            <div className="flex gap-2">
                                <select 
                                    value={selectedDeliverable}
                                    onChange={(e) => setSelectedDeliverable(e.target.value)}
                                    className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="">Unattached</option>
                                    {deliverables.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                                <Button 
                                    size="sm" 
                                    disabled={selectedDeliverable === (asset.deliverableId || '')}
                                    onClick={handleAttach}
                                    isLoading={isSaving}
                                >
                                    Save
                                </Button>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold uppercase text-slate-500 flex items-center gap-2">
                                    Description
                                </label>
                                {asset.type === AssetType.IMAGE && (
                                    <button 
                                        onClick={handleAIAnalysis}
                                        disabled={isAnalyzing}
                                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 disabled:opacity-50"
                                    >
                                        <Sparkles size={12} />
                                        {isAnalyzing ? 'Analyzing...' : 'Auto-Generate'}
                                    </button>
                                )}
                            </div>
                            <p className="text-sm text-slate-300 bg-slate-950 p-3 rounded border border-slate-800 min-h-[80px]">
                                {asset.description || <span className="text-slate-600 italic">No description available.</span>}
                            </p>
                        </div>

                        {/* Tags */}
                        <div className="space-y-3">
                            <label className="text-xs font-semibold uppercase text-slate-500 flex items-center gap-2">
                                <Tag size={14} /> Tags
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {asset.tags.length > 0 ? asset.tags.map(tag => (
                                    <span key={tag} className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-xs border border-slate-700">
                                        #{tag}
                                    </span>
                                )) : (
                                    <span className="text-sm text-slate-600 italic">No tags.</span>
                                )}
                            </div>
                        </div>
                        
                        {/* Checksum */}
                        <div className="pt-4 border-t border-slate-800">
                             <p className="text-xs text-slate-600 font-mono">MD5: {asset.checksum}</p>
                             <p className="text-xs text-slate-600 mt-1">Uploaded: {format(new Date(asset.uploadedAt), 'PP pp')}</p>
                        </div>
                    </>
                ) : (
                    <div className="space-y-4">
                        {asset.versions.map((v) => (
                            <div key={v.version} className="flex items-center gap-4 p-3 rounded bg-slate-950 border border-slate-800">
                                <div className="h-10 w-10 bg-slate-900 rounded flex items-center justify-center font-bold text-slate-500">
                                    v{v.version}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-slate-300 font-medium">Version {v.version}</p>
                                    <p className="text-xs text-slate-500">{format(new Date(v.createdAt), 'MMM d, HH:mm')}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500 font-mono">{(v.size / 1024 / 1024).toFixed(2)} MB</p>
                                    <a href={v.url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:underline mt-1 block">
                                        Download
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Action */}
            <div className="p-6 border-t border-slate-800 bg-slate-900">
                <Button className="w-full" icon={<Download size={18}/>}>
                    Download Original
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
};