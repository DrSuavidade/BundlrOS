import React from "react";
import { Asset, AssetType } from "../types";
import { FileImage, FileVideo, FileText, Clock, Box } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import styles from "./Assets.module.css";

interface AssetCardProps {
  asset: Asset;
  onClick: (asset: Asset) => void;
}

export const AssetCard: React.FC<AssetCardProps> = ({ asset, onClick }) => {
  const isImage = asset.type === AssetType.IMAGE;

  return (
    <div onClick={() => onClick(asset)} className={styles.assetCard}>
      {/* Thumbnail Area */}
      <div className={styles.thumbnailArea}>
        {isImage && asset.previewUrl ? (
          <img
            src={asset.previewUrl}
            alt={asset.filename}
            className={styles.thumbnailImg}
          />
        ) : (
          <div className={styles.thumbnailPlaceholder}>
            {asset.type === AssetType.VIDEO ? (
              <FileVideo size={48} />
            ) : (
              <FileText size={48} />
            )}
          </div>
        )}

        {/* Overlay Badges */}
        <div className={styles.badges}>
          <span className={styles.badge}>v{asset.currentVersion}</span>
          {asset.type === AssetType.VIDEO && (
            <span className={styles.badge}>VID</span>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className={styles.cardContent}>
        <div>
          <h3 className={styles.cardTitle} title={asset.filename}>
            {asset.filename}
          </h3>
          <div className={styles.cardMeta}>
            <span className="flex items-center">
              <Clock size={10} className="mr-1" />
              {formatDistanceToNow(new Date(asset.updatedAt))} ago
            </span>
            <span>•</span>
            <span className="uppercase">{asset.mimeType.split("/")[1]}</span>
          </div>
        </div>

        {/* Footer info (client/deliverable hint) */}
        {asset.deliverableId && (
          <div className={styles.cardFooter}>
            <Box size={10} />
            <span className="truncate">Attached</span>
          </div>
        )}
      </div>
    </div>
  );
};
