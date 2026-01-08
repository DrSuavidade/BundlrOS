import React from 'react';
import { Asset, AssetType } from '../types';
import { FileImage, FileVideo, FileText, Clock, Box } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AssetCardProps {
  asset: Asset;
  onClick: (asset: Asset) => void;
}

export const AssetCard: React.FC<AssetCardProps> = ({ asset, onClick }) => {
  const isImage = asset.type === AssetType.IMAGE;
  
  return (
    <div 
      onClick={() => onClick(asset)}
      className="group relative bg-slate-900 border border-slate-800 rounded-xl overflow-hidden cursor-pointer hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col h-[280px]"
    >
      {/* Thumbnail Area */}
      <div className="relative h-48 w-full bg-slate-950 overflow-hidden">
        {isImage && asset.previewUrl ? (
          <img 
            src={asset.previewUrl} 
            alt={asset.filename}
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600">
            {asset.type === AssetType.VIDEO ? <FileVideo size={48} /> : <FileText size={48} />}
          </div>
        )}
        
        {/* Overlay Badges */}
        <div className="absolute top-2 right-2 flex gap-1">
            <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10">
                v{asset.currentVersion}
            </span>
            {asset.type === AssetType.VIDEO && (
                <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10">
                    VID
                </span>
            )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-3 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-medium text-slate-200 truncate pr-4" title={asset.filename}>
            {asset.filename}
          </h3>
          <div className="flex items-center mt-1 space-x-2">
             <p className="text-xs text-slate-500 flex items-center">
                <Clock size={10} className="mr-1" />
                {formatDistanceToNow(new Date(asset.updatedAt))} ago
             </p>
             <span className="text-slate-700 text-[10px]">•</span>
             <p className="text-xs text-slate-500 uppercase">
                {asset.mimeType.split('/')[1]}
             </p>
          </div>
        </div>
        
        {/* Footer info (client/deliverable hint) */}
        {asset.deliverableId && (
            <div className="flex items-center text-[10px] text-indigo-400 mt-2">
                <Box size={10} className="mr-1" />
                <span className="truncate max-w-full">Attached</span>
            </div>
        )}
      </div>
    </div>
  );
};