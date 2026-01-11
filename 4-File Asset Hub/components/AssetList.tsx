import React from "react";
import { Asset, AssetType } from "../types";
import {
  FileImage,
  FileVideo,
  FileText,
  MoreVertical,
  Box,
} from "lucide-react";
import { format } from "date-fns";
import styles from "./Assets.module.css";

interface AssetListProps {
  assets: Asset[];
  onAssetClick: (asset: Asset) => void;
}

export const AssetList: React.FC<AssetListProps> = ({
  assets,
  onAssetClick,
}) => {
  return (
    <div className="w-full">
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Size</th>
            <th>Version</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <tr
              key={asset.id}
              onClick={() => onAssetClick(asset)}
              className={styles.tableRow}
            >
              <td>
                <div className={styles.itemName}>
                  <div className={styles.itemIcon}>
                    {asset.type === AssetType.IMAGE ? (
                      <img
                        src={asset.previewUrl}
                        className="h-full w-full object-cover"
                      />
                    ) : asset.type === AssetType.VIDEO ? (
                      <FileVideo size={16} />
                    ) : (
                      <FileText size={16} />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span>{asset.filename}</span>
                    {asset.deliverableId && (
                      <span className="text-[10px] text-[var(--color-accent-primary)] flex items-center">
                        <Box size={10} className="mr-1" /> Attached
                      </span>
                    )}
                  </div>
                </div>
              </td>
              <td>
                <span className={styles.statusBadge}>Ready</span>
              </td>
              <td>{(asset.size / 1024 / 1024).toFixed(2)} MB</td>
              <td>
                <span className="font-mono text-[var(--color-text-tertiary)]">
                  v{asset.currentVersion}
                </span>
              </td>
              <td>{format(new Date(asset.updatedAt), "MMM d, yyyy")}</td>
              <td className="text-right">
                <button className={styles.actionBtn}>
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
