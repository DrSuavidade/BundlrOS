import React, { useState, useEffect } from "react";
import { Asset, Deliverable } from "../types";
import {
  X,
  Download,
  Tag,
  Box,
  Sparkles,
  Layers,
  FileCode,
} from "lucide-react";
import { AppShell, Button } from "@bundlros/ui";
import { format } from "date-fns";
import { geminiService } from "../services/geminiService";
import { backend } from "../services";
import styles from "./Assets.module.css";

interface AssetDetailModalProps {
  asset: Asset;
  onClose: () => void;
  onUpdate: (updatedAsset: Asset) => void;
  deliverables: Deliverable[];
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  asset,
  onClose,
  onUpdate,
  deliverables,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState<string>(
    asset.deliverableId || ""
  );
  const [isSaving, setIsSaving] = useState(false);

  // Convert image URL to base64 for Gemini
  const urlToBase64 = async (url: string): Promise<string> => {
    const data = await fetch(url);
    const blob = await data.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  };

  // Infer mime type from URL extension
  const getMimeType = (filename: string): string => {
    const ext = filename.split(".").pop()?.toLowerCase();
    const mimeMap: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      mp4: "video/mp4",
      pdf: "application/pdf",
    };
    return mimeMap[ext || ""] || "application/octet-stream";
  };

  const handleAIAnalysis = async () => {
    if (asset.type !== "image") return;
    setIsAnalyzing(true);
    try {
      const base64Full = await urlToBase64(asset.previewUrl || asset.url);
      const base64Data = base64Full.split(",")[1];
      const mimeType = getMimeType(asset.filename);
      const result = await geminiService.analyzeImage(base64Data, mimeType);

      const updatedAsset = await backend.updateAssetMetadata(
        asset.id,
        result.tags,
        result.description
      );
      onUpdate(updatedAsset);
    } catch (e) {
      console.error("Analysis failed", e);
      alert("Failed to analyze image. Check API Key or Console.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAttach = async () => {
    if (!selectedDeliverable || selectedDeliverable === asset.deliverableId)
      return;
    setIsSaving(true);
    try {
      const updated = await backend.attachAssetToDeliverable(
        asset.id,
        selectedDeliverable
      );
      onUpdate(updated);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    window.open(asset.url, "_blank");
  };

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContainer}>
        <button onClick={onClose} className={styles.modalCloseBtn}>
          <X size={20} />
        </button>

        {/* Left: Preview */}
        <div className={styles.modalPreview}>
          <div className={styles.modalPreviewGradient} />

          {asset.type === "image" ? (
            <img
              src={asset.previewUrl || asset.url}
              alt={asset.filename}
              className={styles.previewImage}
            />
          ) : (
            <div className={styles.previewPlaceholder}>
              <FileCode size={80} />
              <p className="mt-4 text-lg font-medium">Preview not available</p>
            </div>
          )}
        </div>

        {/* Right: Sidebar */}
        <div className={styles.modalSidebar}>
          {/* Header */}
          <div className={styles.modalHeader}>
            <h2 className={styles.modalFilename} title={asset.filename}>
              {asset.filename}
            </h2>
            <div className={styles.modalMetaRow}>
              <span className={styles.metaBadge}>
                {asset.type.toUpperCase()}
              </span>
              <span className={styles.metaBadge}>
                {(asset.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          </div>

          {/* Content */}
          <div className={styles.modalContent}>
            {/* Attach Deliverable */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <Box size={14} /> Attached Deliverable
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedDeliverable}
                  onChange={(e) => setSelectedDeliverable(e.target.value)}
                  className={styles.formSelect}
                >
                  <option value="">Unattached</option>
                  {deliverables.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <Button
                  size="sm"
                  disabled={selectedDeliverable === (asset.deliverableId || "")}
                  onClick={handleAttach}
                  isLoading={isSaving}
                >
                  Save
                </Button>
              </div>
            </div>

            {/* Description */}
            <div className={styles.formGroup}>
              <div className="flex items-center justify-between">
                <label className={styles.formLabel}>Description</label>
                {asset.type === "image" && (
                  <button
                    onClick={handleAIAnalysis}
                    disabled={isAnalyzing}
                    className={styles.analyzeBtn}
                  >
                    <Sparkles size={12} />
                    {isAnalyzing ? "Analyzing..." : "Auto-Generate"}
                  </button>
                )}
              </div>
              <p className={styles.descriptionBox}>
                {asset.description || (
                  <span className="opacity-50 italic">
                    No description available.
                  </span>
                )}
              </p>
            </div>

            {/* Tags */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <Tag size={14} /> Tags
              </label>
              <div className={styles.tagContainer}>
                {asset.tags.length > 0 ? (
                  asset.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      #{tag}
                    </span>
                  ))
                ) : (
                  <span className="text-sm opacity-50 italic">No tags.</span>
                )}
              </div>
            </div>

            {/* Upload Date */}
            <div className="pt-4 border-t border-[var(--color-border-subtle)]">
              <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                Uploaded: {format(new Date(asset.uploadedAt), "PP pp")}
              </p>
            </div>
          </div>

          {/* Footer Action */}
          <div className={styles.modalFooter}>
            <Button
              className="w-full"
              leftIcon={<Download size={18} />}
              onClick={handleDownload}
            >
              Download Original
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
