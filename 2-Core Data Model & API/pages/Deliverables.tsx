import React, { useEffect, useState } from "react";
import { Deliverable, DeliverableStatus, Project, Client } from "../types";
import { MockAPI } from "../services/mockBackend";
import { StatusPill } from "../components/ui/StatusPill";
import {
  Plus,
  Filter,
  ArrowRight,
  CheckCircle,
  XCircle,
  FileText,
  ChevronRight,
  Calendar,
  Archive,
  Package,
  X,
} from "lucide-react";
import { Button } from "@bundlros/ui";

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
  [DeliverableStatus.ARCHIVED]: [], // Terminal state
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
      let btnClass =
        "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)]";

      if (target === DeliverableStatus.APPROVED) {
        label = "Approve";
        Icon = CheckCircle;
        btnClass =
          "text-emerald-400 hover:bg-emerald-500/10 border-emerald-500/20";
      } else if (
        target === DeliverableStatus.QA_FAILED ||
        (item.status === "awaiting_approval" && target === "draft")
      ) {
        label = "Reject";
        Icon = XCircle;
        btnClass = "text-red-400 hover:bg-red-500/10 border-red-500/20";
      } else if (target === DeliverableStatus.PUBLISHED) {
        label = "Publish";
        Icon = CheckCircle;
        btnClass =
          "text-[var(--color-accent-primary)] hover:bg-[var(--color-accent-subtle)] border-[var(--color-accent-primary)]/20";
      } else if (target === DeliverableStatus.ARCHIVED) {
        label = "Archive";
        Icon = Archive;
        btnClass =
          "text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)]";
      }

      return (
        <button
          key={target}
          onClick={() => handleTransition(item.id, target)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-semibold transition-all border ${btnClass}`}
          title={`Move to ${target}`}
        >
          <Icon size={12} />
          {label}
        </button>
      );
    });
  };

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "draft", label: "Draft" },
    { value: "awaiting_approval", label: "Awaiting Approval" },
    { value: "in_qa", label: "In QA" },
    { value: "published", label: "Published" },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <header className="page-header">
        <div className="page-header__content">
          <h1 className="page-header__title flex items-center gap-3">
            <Package className="text-[var(--color-accent-primary)]" size={24} />
            Deliverables
          </h1>
          <p className="page-header__subtitle">
            Manage project outputs and workflow state transitions
          </p>
        </div>
        <div className="page-header__actions">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={16} />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            New Deliverable
          </Button>
        </div>
      </header>

      {/* Filters */}
      <div className="card mb-6">
        <div className="card__body py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[var(--color-text-tertiary)] text-sm">
              <Filter size={14} />
              <span className="font-medium text-xs uppercase tracking-wider">
                Status:
              </span>
            </div>
            <div className="flex gap-2">
              {filterOptions.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setFilterStatus(value)}
                  className={`
                    px-3 py-1.5 rounded-md text-[10px] font-semibold transition-all border uppercase tracking-wide
                    ${
                      filterStatus === value
                        ? "bg-[var(--color-accent-subtle)] border-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)]"
                        : "bg-[var(--color-bg-subtle)] border-[var(--color-border-subtle)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-default)]"
                    }
                  `}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card card--elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
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
                  <tr key={item.id} className="group">
                    <td>
                      <div className="flex flex-col">
                        <span className="font-medium text-[var(--color-text-primary)]">
                          {item.title}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--color-text-tertiary)] mt-0.5">
                          #{item.id}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[var(--color-accent-primary)]"></div>
                        <span>{project?.name || "Unknown Project"}</span>
                      </div>
                    </td>
                    <td>
                      <StatusPill status={item.status} />
                    </td>
                    <td>
                      <span className="font-mono text-xs">{item.version}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        {getTransitionActions(item)}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="!py-12">
                    <div className="empty-state">
                      <div className="empty-state__icon">
                        <FileText size={28} />
                      </div>
                      <p className="empty-state__title">
                        No Deliverables Found
                      </p>
                      <p className="empty-state__description">
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
            <form onSubmit={handleCreate} className="modal__body space-y-4">
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
