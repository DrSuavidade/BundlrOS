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
  User,
  CreditCard,
  Wrench,
  Phone,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";
import styles from "./Dashboard.module.css";
import { Badge, useLanguage } from "@bundlros/ui";
import { ContactsApi } from "../../lib/supabase/api";

interface PanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: "contracts" | "activity" | "contacts";
  data: any[];
  clientId?: string;
  onRefresh?: () => Promise<void> | void;
}

export const DetailPanel: React.FC<PanelProps> = ({
  isOpen,
  onClose,
  title,
  type,
  data,
  clientId,
  onRefresh,
}) => {
  const { t } = useLanguage();
  // State for Contact Management
  const [viewMode, setViewMode] = useState<"list" | "add" | "edit">("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [filteredData, setFilteredData] = useState(data);

  // Reset state when panel opens/type changes
  useEffect(() => {
    setActiveFilter("all");
    setSearchTerm("");
    setViewMode("list");
    setSelectedId(null);
    setDeleteModalOpen(false);
    setFormData({ name: "", role: "", email: "", phone: "" });
  }, [type, isOpen]);

  // Handle Edit Click
  const handleEditClick = () => {
    if (!selectedId) return;
    const contact = data.find((c) => c.id === selectedId);
    if (contact) {
      setFormData({
        name: contact.name,
        role: contact.role || "",
        email: contact.email || "",
        phone: contact.phone || "",
      });
      setViewMode("edit");
    }
  };

  // Handle Delete Click
  const handleDeleteClick = () => {
    if (!selectedId) return;
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedId) return;
    try {
      await ContactsApi.delete(selectedId);
      if (onRefresh) await onRefresh();
      setDeleteModalOpen(false);
      setSelectedId(null);
    } catch (err) {
      console.error("Failed to delete contact", err);
    }
  };

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
              } else if (type === "contacts") {
                return (
                  item.name.toLowerCase().includes(searchLower) ||
                  item.role.toLowerCase().includes(searchLower)
                );
              } else {
                return (
                  item.title.toLowerCase().includes(searchLower) ||
                  item.notes.toLowerCase().includes(searchLower)
                );
              }
            })();

          // 2. Button Category Filter (Only for Contracts/Activity now)
          const matchesFilter =
            activeFilter === "all" ||
            (() => {
              if (type === "contracts") {
                if (activeFilter === "active") return item.status === "active";
                if (activeFilter === "draft") return item.status === "draft";
                if (activeFilter === "expired") return item.status !== "active";
                return true;
              } else if (type === "contacts") {
                // Contacts now use View All/Add/Edit/Delete actions instead of filters
                // But if we wanted to keep filters inside "View All", we'd need a sub-filter UI.
                // For now, "all" is the default and only filter state for the list view.
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
        }),
      );
    }
  }, [data, searchTerm, activeFilter, type]);

  // Define actions/filters
  let actions: any[] = [];

  if (type === "contacts") {
    actions = [
      {
        id: "view_all",
        label: t("clients.detailPanel.actions.viewAll"),
        icon: List,
        active: viewMode === "list",
        onClick: () => setViewMode("list"),
      },
      {
        id: "add_new",
        label: t("clients.detailPanel.actions.addNew"),
        icon: Plus,
        active: viewMode === "add",
        onClick: () => {
          setFormData({ name: "", role: "", email: "", phone: "" });
          setViewMode("add");
        },
      },
      {
        id: "edit",
        label: t("clients.detailPanel.actions.edit"),
        icon: Pencil,
        disabled: !selectedId || viewMode !== "list",
        active: viewMode === "edit",
        onClick: handleEditClick,
      },
      {
        id: "delete",
        label: t("clients.detailPanel.actions.delete"),
        icon: Trash2,
        disabled: !selectedId || viewMode !== "list",
        active: false,
        onClick: handleDeleteClick,
      },
    ];
  } else if (type === "contracts") {
    actions = [
      {
        id: "all",
        label: t("clients.detailPanel.actions.all"),
        icon: List,
        active: activeFilter === "all",
        onClick: () => setActiveFilter("all"),
      },
      {
        id: "active",
        label: t("clients.detailPanel.actions.active"),
        icon: CheckCircle,
        active: activeFilter === "active",
        onClick: () => setActiveFilter("active"),
      },
      {
        id: "draft",
        label: t("clients.detailPanel.actions.drafts"),
        icon: FileText,
        active: activeFilter === "draft",
        onClick: () => setActiveFilter("draft"),
      },
      {
        id: "expired",
        label: t("clients.detailPanel.actions.past"),
        icon: Layers,
        active: activeFilter === "expired",
        onClick: () => setActiveFilter("expired"),
      },
    ];
  } else {
    actions = [
      {
        id: "all",
        label: t("clients.detailPanel.actions.all"),
        icon: Activity,
        active: activeFilter === "all",
        onClick: () => setActiveFilter("all"),
      },
      {
        id: "email",
        label: t("clients.detailPanel.actions.emails"),
        icon: Mail,
        active: activeFilter === "email",
        onClick: () => setActiveFilter("email"),
      },
      {
        id: "meeting",
        label: t("clients.detailPanel.actions.meetings"),
        icon: Briefcase,
        active: activeFilter === "meeting",
        onClick: () => setActiveFilter("meeting"),
      },
      {
        id: "system",
        label: t("clients.detailPanel.actions.system"),
        icon: Sparkles,
        active: activeFilter === "system",
        onClick: () => setActiveFilter("system"),
      },
    ];
  }

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
                {type === "contracts"
                  ? t("clients.contracts")
                  : type === "contacts"
                    ? t("clients.contacts")
                    : t("clients.detailPanel.activityLog")}
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
          {/* Action/Filter Grid */}
          <div className={styles.actionGrid}>
            {actions.map((a) => (
              <button
                key={a.id}
                onClick={a.onClick}
                disabled={a.disabled}
                className={`${styles.actionButton} ${
                  a.active ? styles.active : ""
                } ${a.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <a.icon size={16} />
                {a.label}
              </button>
            ))}
          </div>

          {/* LIST VIEW */}
          {viewMode === "list" && (
            <>
              <div className="relative mb-4">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
                />
                <input
                  type="text"
                  placeholder={t("clients.detailPanel.filterList")}
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
                  <p className={styles.emptyState__title}>
                    {t("clients.detailPanel.noResults")}
                  </p>
                  <p className={styles.emptyState__description}>
                    {t("clients.detailPanel.adjustFilter")}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {filteredData.map((item: any, idx: number) => {
                  const isSelected = selectedId === item.id;
                  return (
                    <div
                      key={item.id || idx}
                      className={`${styles.listItem} ${
                        isSelected ? styles.listItemSelected : ""
                      }`}
                      onClick={() =>
                        type === "contacts" && item.id
                          ? setSelectedId(
                              item.id === selectedId ? null : item.id,
                            )
                          : null
                      }
                    >
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
                              {t("clients.expires")}: {item.endDate}
                            </div>
                            <div className="text-sm font-bold font-mono text-[var(--color-text-primary)]">
                              {item.value}
                            </div>
                          </div>
                        </>
                      ) : type === "contacts" ? (
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                              {item.name}
                            </h3>
                            <div className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                              {item.role}
                            </div>
                          </div>
                          <div className="flex flex-col items-start gap-0.5">
                            {item.email && (
                              <div className="text-xs text-[var(--color-text-secondary)]">
                                {item.email}
                              </div>
                            )}
                            {item.phone && (
                              <div className="text-xs text-[var(--color-text-tertiary)]">
                                {item.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Activity Item */}
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
                  );
                })}
              </div>
            </>
          )}

          {/* ADD/EDIT FORM */}
          {(viewMode === "add" || viewMode === "edit") && (
            <div className="animate-fade-in">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                    {t("clients.detailPanel.form.fullName")}
                  </label>
                  <input
                    className="w-full px-3 py-2 bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] rounded-lg text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)]"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder={t("actionModals.placeholders.taskTitle")}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                    {t("clients.detailPanel.form.role")}
                  </label>
                  <input
                    className="w-full px-3 py-2 bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] rounded-lg text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)]"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    placeholder={t("actionModals.placeholders.taskTitle")}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                      {t("clients.detailPanel.form.email")}
                    </label>
                    <input
                      className="w-full px-3 py-2 bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] rounded-lg text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)]"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder={t("actionModals.placeholders.emailTo")}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                      {t("clients.detailPanel.form.phone")}
                    </label>
                    <input
                      className="w-full px-3 py-2 bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] rounded-lg text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)]"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    onClick={() => setViewMode("list")}
                    className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] rounded-lg transition-colors"
                  >
                    {t("clients.detailPanel.form.cancel")}
                  </button>
                  <button
                    onClick={async () => {
                      if (!clientId) {
                        console.error("No client ID provided");
                        return;
                      }
                      try {
                        if (viewMode === "edit" && selectedId) {
                          await ContactsApi.update(selectedId, {
                            name: formData.name,
                            role: formData.role,
                            email: formData.email,
                            phone: formData.phone,
                          } as any);
                        } else {
                          await ContactsApi.create({
                            client_id: clientId,
                            name: formData.name,
                            role: formData.role,
                            email: formData.email,
                            phone: formData.phone,
                          } as any);
                        }

                        if (onRefresh) {
                          await onRefresh();
                        }
                        setViewMode("list");
                        // Keep selection if edit, clears if add naturally as new item might not be selected
                        if (viewMode === "add") {
                          setSelectedId(null);
                        }
                      } catch (err) {
                        console.error("Failed to save contact", err);
                      }
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] rounded-lg shadow-lg shadow-indigo-500/20 transition-all"
                  >
                    {t("clients.detailPanel.form.saveContact")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {deleteModalOpen &&
        createPortal(
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              backdropFilter: "blur(4px)",
            }}
            onClick={() => setDeleteModalOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border-subtle)",
                borderRadius: "0.75rem",
                boxShadow: "0 24px 64px rgba(0, 0, 0, 0.5)",
                width: "100%",
                maxWidth: "360px",
                padding: "1.5rem",
              }}
            >
              <h3
                style={{
                  margin: "0 0 0.75rem",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                }}
              >
                {t("clients.detailPanel.form.deleteTitle")}
              </h3>
              <p
                style={{
                  margin: "0 0 1.25rem",
                  fontSize: "0.75rem",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.5,
                }}
              >
                {t("clients.detailPanel.form.deleteBody")}
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  style={{
                    padding: "0.5rem 1rem",
                    background: "transparent",
                    border: "1px solid var(--color-border-subtle)",
                    borderRadius: "0.375rem",
                    color: "var(--color-text-secondary)",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                  }}
                >
                  {t("clients.detailPanel.form.cancel")}
                </button>
                <button
                  onClick={confirmDelete}
                  style={{
                    padding: "0.5rem 1rem",
                    background: "var(--color-accent-danger, #ef4444)",
                    border: "none",
                    borderRadius: "0.375rem",
                    color: "white",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {t("clients.detailPanel.form.deleteButton")}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>,
    document.body,
  );
};
