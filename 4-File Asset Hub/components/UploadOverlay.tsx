import React, { useRef, useState } from 'react';
import { UploadCloud, X, Check, File as FileIcon } from 'lucide-react';
import Button from './Button';
import { backend } from '../services/mockBackend';
import { UploadProgress } from '../types';

interface UploadOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
}

export const UploadOverlay: React.FC<UploadOverlayProps> = ({ isOpen, onClose, onUploadComplete }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<UploadProgress[]>([]);

  if (!isOpen) return null;

  const handleFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const newUploads = files.map(f => ({
        id: Math.random().toString(),
        filename: f.name,
        progress: 0,
        status: 'uploading' as const
      }));
      
      setUploads(prev => [...prev, ...newUploads]);

      // Process sequentially for mock simplicity (parallel in real app)
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadId = newUploads[i].id;

        try {
          // 1. Get Presigned URL
          const { uploadUrl, key } = await backend.getPresignedUrl(file.name, file.type);
          
          // 2. Upload to MinIO (Mock)
          const previewUrl = await backend.uploadFileToMinIO(uploadUrl, file, (progress) => {
             setUploads(prev => prev.map(u => u.id === uploadId ? { ...u, progress } : u));
          });

          // 3. Finalize
          await backend.createAsset(file, key, previewUrl);

          setUploads(prev => prev.map(u => u.id === uploadId ? { ...u, status: 'completed', progress: 100 } : u));
        } catch (error) {
           setUploads(prev => prev.map(u => u.id === uploadId ? { ...u, status: 'error' } : u));
        }
      }
      onUploadComplete();
    }
  };

  const completedCount = uploads.filter(u => u.status === 'completed').length;
  const isAllDone = uploads.length > 0 && completedCount === uploads.length;

  return (
    <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-slate-500 hover:text-white"
        >
            <X size={20}/>
        </button>

        <h2 className="text-xl font-semibold mb-2">Upload Assets</h2>
        <p className="text-slate-400 text-sm mb-6">Secure upload to MinIO storage. Supports Images, Videos, PDFs.</p>

        {uploads.length === 0 ? (
            <div 
                className="border-2 border-dashed border-slate-700 rounded-xl h-48 flex flex-col items-center justify-center text-slate-500 hover:border-indigo-500 hover:text-indigo-400 hover:bg-slate-800/50 transition-all cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
            >
                <UploadCloud size={40} className="mb-2" />
                <span className="font-medium">Click to select files</span>
                <span className="text-xs mt-1 text-slate-600">Max 50MB per file</span>
                <input 
                    type="file" 
                    multiple 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFiles}
                />
            </div>
        ) : (
            <div className="space-y-4 max-h-60 overflow-y-auto mb-6 pr-2">
                {uploads.map(u => (
                    <div key={u.id} className="bg-slate-950 p-3 rounded border border-slate-800 flex items-center gap-3">
                         <div className="h-10 w-10 bg-slate-900 rounded flex items-center justify-center text-slate-500">
                            {u.status === 'completed' ? <Check size={20} className="text-emerald-500" /> : <FileIcon size={20} />}
                         </div>
                         <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-200 truncate max-w-[200px]">{u.filename}</span>
                                <span className="text-slate-500">{u.progress}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-300 ${u.status === 'error' ? 'bg-red-500' : 'bg-indigo-500'}`} 
                                    style={{ width: `${u.progress}%` }}
                                />
                            </div>
                         </div>
                    </div>
                ))}
            </div>
        )}

        {isAllDone && (
            <div className="mt-6 flex justify-end">
                <Button onClick={onClose}>Done</Button>
            </div>
        )}
      </div>
    </div>
  );
};