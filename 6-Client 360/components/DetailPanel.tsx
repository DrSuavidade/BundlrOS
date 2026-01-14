import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  ArrowUpRight,
  Search,
  List,
  Briefcase,
  Mail,
  Sparkles,
  CheckCircle,
  FileText,
  Activity,
  Layers,
} from "lucide-react";
import styles from "./Dashboard.module.css";
import { Badge } from "@bundlros/ui";

interface PanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: "contracts" | "activity";
  data: any[];
}

export const DetailPanel: React.FC<PanelProps> = ({
  isOpen,
  onClose,
  title,
  type,
  data,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [filteredData, setFilteredData] = useState(data);

  // Reset filter when panel opens/type changes
  useEffect(() => {
    setActiveFilter("all");
    setSearchTerm("");
  }, [type, isOpen]);

  useEffect(() => {
    if (data) {
      setFilteredData(
        data.filter((item: any) => {
          // 1. Text Search Filter
          const matchesSearch =
            !searchTerm ||
            (() => {
              const searchLower = searchTerm.toLowerCase();
              if (type === "contracts") {
                return (
                  item.title.toLowerCase().includes(searchLower) ||
                  item.status.toLowerCase().includes(searchLower)
                );
              } else {
                return (
                  item.title.toLowerCase().includes(searchLower) ||
                  item.notes.toLowerCase().includes(searchLower)
                );
              }
            })();

          // 2. Button Category Filter
          const matchesFilter =
            activeFilter === "all" ||
            (() => {
              if (type === "contracts") {
                if (activeFilter === "active") return item.status === "active";
                if (activeFilter === "draft") return item.status === "draft"; // Assuming 'draft' status exists
                if (activeFilter === "expired") return item.status !== "active"; // Simplified
                return true;
              } else {
                // Activity
                if (activeFilter === "email") return item.type === "email";
                if (activeFilter === "meeting") return item.type === "meeting";
                if (activeFilter === "system") return item.type === "system";
                return true;
              }
            })();

          return matchesSearch && matchesFilter;
        })
      );
    }
  }, [data, searchTerm, activeFilter, type]);

  // Define filters based on type
  const filters =
    type === "contracts"
      ? [
          { id: "all", label: "All", icon: List },
          { id: "active", label: "Active", icon: CheckCircle },
          { id: "draft", label: "Drafts", icon: FileText },
          { id: "expired", label: "Past", icon: Layers },
        ]
      : [
          { id: "all", label: "All", icon: Activity },
          { id: "email", label: "Emails", icon: Mail },
          { id: "meeting", label: "Meetings", icon: Briefcase },
          { id: "system", label: "System", icon: Sparkles },
        ];

  return createPortal(
    <>
      <div
        className={styles.panelOverlay}
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(2px)",
          zIndex: 40,
          transition: "opacity 0.3s",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
      />
      <div className={`${styles.panelContainer} ${isOpen ? styles.open : ""}`}>
        {/* Header */}
        <div className={styles.panelHeader}>
          <div>
            <div className="flex gap-1.5 mb-1 items-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-tertiary)] bg-[var(--color-bg-subtle)] px-1.5 py-0.5 rounded">
                {type === "contracts" ? "Contracts" : "Activity Log"}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)] font-mono border border-[var(--color-border-subtle)]">
                {filteredData.length}
              </span>
            </div>
            <h1 className={styles.panelTitle}>{title}</h1>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className={styles.panelContent}>
          {/* 4-Button Filter Grid */}
          <div className={styles.actionGrid}>
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`${styles.actionButton} ${
                  activeFilter === f.id ? styles.active : ""
                }`}
              >
                <f.icon size={16} />
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative mb-4">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
            />
            <input
              type="text"
              placeholder="Filter list..."
              className="w-full pl-9 pr-4 py-2 bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] rounded-lg text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)] placeholder-[var(--color-text-tertiary)] transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {filteredData.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyState__icon}>
                <Search size={24} />
              </div>
              <p className={styles.emptyState__title}>No results found</p>
              <p className={styles.emptyState__description}>
                Try adjusting your filter
              </p>
            </div>
          )}

          <div className="space-y-4">
            {filteredData.map((item: any, idx: number) => (
              <div key={item.id || idx} className={styles.listItem}>
                {type === "contracts" ? (
                  <>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                        {item.title}
                      </h3>
                      <Badge
                        variant={
                          item.status === "active" ? "success" : "warning"
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="text-xs text-[var(--color-text-secondary)]">
                        Expires: {item.endDate}
                      </div>
                      <div className="text-sm font-bold font-mono text-[var(--color-text-primary)]">
                        {item.value}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-1.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor:
                              item.type === "meeting"
                                ? "rgb(168, 85, 247)"
                                : item.type === "email"
                                ? "rgb(249, 115, 22)"
                                : "rgb(59, 130, 246)",
                          }}
                        />
                        <span className="text-[10px] font-mono text-[var(--color-text-tertiary)]">
                          {item.displayTimestamp}
                        </span>
                      </div>
                      <div className="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider bg-[var(--color-bg-app)] border border-[var(--color-border-subtle)] text-[var(--color-text-tertiary)]">
                        {item.type}
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[var(--color-text-secondary)] line-clamp-3 leading-relaxed border-l-2 border-[var(--color-border-subtle)] pl-2 ml-1">
                      {item.notes}
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};
