import React from 'react';
import { Asset, AssetType } from '../types';
import { FileImage, FileVideo, FileText, MoreVertical, Box } from 'lucide-react';
import { format } from 'date-fns';

interface AssetListProps {
  assets: Asset[];
  onAssetClick: (asset: Asset) => void;
}

export const AssetList: React.FC<AssetListProps> = ({ assets, onAssetClick }) => {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
      <table className="w-full text-left text-sm text-slate-400">
        <thead className="bg-slate-900 text-xs uppercase font-semibold text-slate-500">
          <tr>
            <th className="px-6 py-4">Name</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Size</th>
            <th className="px-6 py-4">Version</th>
            <th className="px-6 py-4">Date</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {assets.map((asset) => (
            <tr 
                key={asset.id} 
                onClick={() => onAssetClick(asset)}
                className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
            >
              <td className="px-6 py-4 font-medium text-slate-200 flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                    {asset.type === AssetType.IMAGE ? (
                        <img src={asset.previewUrl} className="h-full w-full object-cover" />
                    ) : asset.type === AssetType.VIDEO ? (
                        <FileVideo size={16} />
                    ) : (
                        <FileText size={16} />
                    )}
                </div>
                <div className="flex flex-col">
                    <span className="truncate max-w-[200px]">{asset.filename}</span>
                    {asset.deliverableId && <span className="text-[10px] text-indigo-400 flex items-center"><Box size={10} className="mr-1"/> Attached</span>}
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center rounded-full bg-emerald-400/10 px-2 py-1 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-400/20">
                  Ready
                </span>
              </td>
              <td className="px-6 py-4">{(asset.size / 1024 / 1024).toFixed(2)} MB</td>
              <td className="px-6 py-4">
                <span className="text-slate-300 font-mono">v{asset.currentVersion}</span>
              </td>
              <td className="px-6 py-4">{format(new Date(asset.updatedAt), 'MMM d, yyyy')}</td>
              <td className="px-6 py-4 text-right">
                <button className="p-1 hover:bg-slate-700 rounded text-slate-500 hover:text-white">
                    <MoreVertical size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};