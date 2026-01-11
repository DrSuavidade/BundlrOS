import React, { useRef, useState } from "react";
import { UploadCloud, X, Check, File as FileIcon } from "lucide-react";
import { AppShell, Button } from "@bundlros/ui";
import { backend } from "../services/mockBackend";
import { UploadProgress } from "../types";
import styles from "./Assets.module.css";

interface UploadOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
}

export const UploadOverlay: React.FC<UploadOverlayProps> = ({
  isOpen,
  onClose,
  onUploadComplete,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<UploadProgress[]>([]);

  if (!isOpen) return null;

  const handleFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const newUploads = files.map((f) => ({
        id: Math.random().toString(),
        filename: f.name,
        progress: 0,
        status: "uploading" as const,
      }));

      setUploads((prev) => [...prev, ...newUploads]);

      // Process sequentially for mock simplicity (parallel in real app)
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadId = newUploads[i].id;

        try {
          // 1. Get Presigned URL
          const { uploadUrl, key } = await backend.getPresignedUrl(
            file.name,
            file.type
          );

          // 2. Upload to MinIO (Mock)
          const previewUrl = await backend.uploadFileToMinIO(
            uploadUrl,
            file,
            (progress) => {
              setUploads((prev) =>
                prev.map((u) => (u.id === uploadId ? { ...u, progress } : u))
              );
            }
          );

          // 3. Finalize
          await backend.createAsset(file, key, previewUrl);

          setUploads((prev) =>
            prev.map((u) =>
              u.id === uploadId
                ? { ...u, status: "completed", progress: 100 }
                : u
            )
          );
        } catch (error) {
          setUploads((prev) =>
            prev.map((u) => (u.id === uploadId ? { ...u, status: "error" } : u))
          );
        }
      }
      onUploadComplete();
    }
  };

  const completedCount = uploads.filter((u) => u.status === "completed").length;
  const isAllDone = uploads.length > 0 && completedCount === uploads.length;

  return (
    <div className={styles.overlayBackdrop}>
      <div className={styles.overlayPanel}>
        <button onClick={onClose} className={styles.overlayCloseBtn}>
          <X size={20} />
        </button>

        <h2 className={styles.overlayTitle}>Upload Assets</h2>
        <p className={styles.overlayDesc}>
          Secure upload to MinIO storage. Supports Images, Videos, PDFs.
        </p>

        {uploads.length === 0 ? (
          <div
            className={styles.dropzone}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud size={40} className="mb-2" />
            <span className="font-medium">Click to select files</span>
            <span className="text-xs mt-1 opacity-70">Max 50MB per file</span>
            <input
              type="file"
              multiple
              ref={fileInputRef}
              className="hidden"
              onChange={handleFiles}
            />
          </div>
        ) : (
          <div className={styles.uploadList}>
            {uploads.map((u) => (
              <div key={u.id} className={styles.uploadItem}>
                <div className={styles.uploadIconBox}>
                  {u.status === "completed" ? (
                    <Check
                      size={20}
                      className="text-[var(--color-status-success)]"
                    />
                  ) : (
                    <FileIcon size={20} />
                  )}
                </div>
                <div className={styles.uploadInfo}>
                  <div className={styles.uploadHeader}>
                    <span className={styles.uploadFilename}>{u.filename}</span>
                    <span className="text-[var(--color-text-tertiary)]">
                      {u.progress}%
                    </span>
                  </div>
                  <div className={styles.progressBarContainer}>
                    <div
                      className={`${styles.progressBar} ${
                        u.status === "error" ? styles.progressBarError : ""
                      }`}
                      style={{ width: `${u.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isAllDone && (
          <div className="flex justify-end">
            <Button ref={undefined} variant="primary" onClick={onClose}>
              Done
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
