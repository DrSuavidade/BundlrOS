import React, { useEffect, useState } from "react";
import { Deliverable, DeliverableStatus, Project } from "../types";
import { MockAPI } from "../services/mockBackend";
import {
  Plus,
  Filter,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  XCircle,
  FileText,
  Archive,
  Package,
  X,
} from "lucide-react";
import { Button } from "@bundlros/ui";
import { Link } from "react-router-dom";
import styles from "./Deliverables.module.css";

const ALLOWED_TRANSITIONS: Record<string, DeliverableStatus[]> = {
  [DeliverableStatus.DRAFT]: [DeliverableStatus.AWAITING_APPROVAL],
  [DeliverableStatus.AWAITING_APPROVAL]: [
    DeliverableStatus.APPROVED,
    DeliverableStatus.DRAFT,
  ],
  [DeliverableStatus.APPROVED]: [DeliverableStatus.IN_QA],
  [DeliverableStatus.IN_QA]: [
    DeliverableStatus.READY,
    DeliverableStatus.QA_FAILED,
  ],
  [DeliverableStatus.QA_FAILED]: [DeliverableStatus.IN_QA],
  [DeliverableStatus.READY]: [DeliverableStatus.PUBLISHED],
  [DeliverableStatus.PUBLISHED]: [DeliverableStatus.ARCHIVED],
  [DeliverableStatus.ARCHIVED]: [],
};

// Status Pill Component
const StatusPill: React.FC<{ status: string }> = ({ status }) => {
  const getVariant = () => {
    switch (status) {
      case "draft":
        return styles.draft;
      case "awaiting_approval":
        return styles.awaiting;
      case "approved":
        return styles.approved;
      case "in_qa":
        return styles.inQa;
      case "ready":
        return styles.ready;
      case "published":
        return styles.published;
      case "archived":
        return styles.archived;
      case "qa_failed":
        return styles.failed;
      default:
        return "";
    }
  };

  const formatLabel = (s: string) => {
    return s.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <span className={`${styles.statusPill} ${getVariant()}`}>
      <span className={styles.statusPill__dot} />
      {formatLabel(status)}
    </span>
  );
};

export const Deliverables: React.FC = () => {
  const [items, setItems] = useState<Deliverable[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Item State
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemProject, setNewItemProject] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [d, p] = await Promise.all([
      MockAPI.getDeliverables(),
      MockAPI.getProjects(),
    ]);
    setItems(d);
    setProjects(p);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle || !newItemProject) return;

    await MockAPI.createDeliverable({
      project_id: newItemProject,
      title: newItemTitle,
      type: "document",
      status: DeliverableStatus.DRAFT,
      version: "v0.1",
      due_date: new Date().toISOString().split("T")[0],
    });

    setIsCreateModalOpen(false);
    setNewItemTitle("");
    setNewItemProject("");
    fetchData();
  };

  const handleTransition = async (id: string, newStatus: DeliverableStatus) => {
    await MockAPI.transitionDeliverable(id, newStatus);
    fetchData();
  };

  const filteredItems =
    filterStatus === "all"
      ? items
      : items.filter((i) => i.status === filterStatus);

  const getTransitionActions = (item: Deliverable) => {
    const targets = ALLOWED_TRANSITIONS[item.status] || [];

    return targets.map((target) => {
      let label = "Advance";
      let Icon = ArrowRight;
      let variant = styles.default;

      if (target === DeliverableStatus.APPROVED) {
        label = "Approve";
        Icon = CheckCircle;
        variant = styles.approve;
      } else if (
        target === DeliverableStatus.QA_FAILED ||
        (item.status === "awaiting_approval" && target === "draft")
      ) {
        label = "Reject";
        Icon = XCircle;
        variant = styles.reject;
      } else if (target === DeliverableStatus.PUBLISHED) {
        label = "Publish";
        Icon = CheckCircle;
        variant = styles.publish;
      } else if (target === DeliverableStatus.ARCHIVED) {
        label = "Archive";
        Icon = Archive;
        variant = styles.archive;
      }

      return (
        <button
          key={target}
          onClick={() => handleTransition(item.id, target)}
          className={`${styles.actionButton} ${variant}`}
          title={`Move to ${target}`}
        >
          <Icon size={10} />
          {label}
        </button>
      );
    });
  };

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "draft", label: "Draft" },
    { value: "awaiting_approval", label: "Awaiting" },
    { value: "in_qa", label: "In QA" },
    { value: "published", label: "Published" },
  ];

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <Link to="/core" className={styles.backButton} title="Back to Core">
            <ArrowLeft size={16} />
          </Link>
          <h1>
            <Package size={22} className="text-[var(--color-accent-primary)]" />
            Deliverables
          </h1>
          <p>Manage project outputs and workflow state transitions</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus size={14} />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          New Deliverable
        </Button>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.filterLabel}>
          <Filter size={12} />
          Status:
        </div>
        <div className={styles.filterButtons}>
          {filterOptions.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilterStatus(value)}
              className={`${styles.filterButton} ${
                filterStatus === value ? styles.active : ""
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableContainer}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "30%" }}>Title / ID</th>
                <th>Project</th>
                <th>Status</th>
                <th>Version</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const project = projects.find((p) => p.id === item.project_id);
                return (
                  <tr key={item.id}>
                    <td>
                      <div className={styles.titleCell}>
                        <span className={styles.titleCell__name}>
                          {item.title}
                        </span>
                        <span className={styles.titleCell__id}>#{item.id}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.projectCell}>
                        <span className={styles.projectCell__dot} />
                        {project?.name || "Unknown Project"}
                      </div>
                    </td>
                    <td>
                      <StatusPill status={item.status} />
                    </td>
                    <td>
                      <span className={styles.versionBadge}>
                        {item.version}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionsCell}>
                        {getTransitionActions(item)}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className={styles.emptyState}>
                      <div className={styles.emptyState__icon}>
                        <FileText size={24} />
                      </div>
                      <p className={styles.emptyState__title}>
                        No Deliverables Found
                      </p>
                      <p className={styles.emptyState__description}>
                        No items match the current filter. Try adjusting the
                        filter or create a new deliverable.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal w-full max-w-md">
            <div className="modal__header">
              <h2 className="modal__title flex items-center gap-2">
                <Plus size={16} />
                Create Deliverable
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="modal__close"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="modal__body space-y-6">
              <div>
                <label className="form-label">Title</label>
                <input
                  type="text"
                  required
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  className="form-input"
                  placeholder="e.g., Q3 Financial Report"
                />
              </div>
              <br></br>
              <div>
                <label className="form-label">Project</label>
                <select
                  required
                  value={newItemProject}
                  onChange={(e) => setNewItemProject(e.target.value)}
                  className="form-select w-full"
                >
                  <option value="">Select Project...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </form>
            <div className="modal__footer">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleCreate}>
                Create Draft
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
