import React, { useState, useMemo } from "react";
import { IntakeItem, Priority, Status, FilterState } from "./types";
import { IntakeList } from "./components/IntakeList";
import { IntakeDetailPanel } from "./components/IntakeDetailPanel";
import {
  Filter,
  Search,
  PlusCircle,
  PieChart,
  AlertTriangle,
  Zap,
  X,
  User,
  Building2,
  Tag,
  FileText,
  Clock,
} from "lucide-react";
import { AppShell, Button, useLanguage } from "@bundlros/ui";
import styles from "./components/Inbox.module.css";

// Mock Data Generator (Keep existing)
const generateMockData = (): IntakeItem[] => {
  const clients = [
    "Acme Corp",
    "Globex",
    "Soylent Corp",
    "Initech",
    "Massive Dynamic",
  ];
  const titles = [
    "Urgent: Server outage in US-East",
    "Request for new employee laptop setup",
    "Software license renewal inquiry",
    "Bug report: Login page 404",
    "Feature Request: Dark mode for dashboard",
    "VPN Access issues for remote team",
    "Database performance degradation",
    "Security alert: Suspicious login attempts",
    "Printer network configuration",
    "API Rate limit increase request",
  ];

  return Array.from({ length: 15 }).map((_, i) => {
    const priority = Object.values(Priority)[Math.floor(Math.random() * 4)];
    const status = Object.values(Status)[Math.floor(Math.random() * 6)];
    const client = clients[Math.floor(Math.random() * clients.length)];
    const now = new Date();
    // SLA between -12h (breached) and +48h
    const slaOffset = Math.random() * 60 - 12;
    const slaDueAt = new Date(
      now.getTime() + slaOffset * 60 * 60 * 1000
    ).toISOString();

    return {
      id: `INT-${1000 + i}`,
      title: titles[i % titles.length],
      description: `Detailed description for ${
        titles[i % titles.length]
      }. This issue is affecting productivity and requires attention. \n\nAdditional context: System logs show intermittent connectivity errors starting at 09:00 AM UTC.`,
      client,
      requestor: `user${i}@${client.toLowerCase().replace(" ", "")}.com`,
      priority,
      status,
      createdAt: new Date().toISOString(),
      slaDueAt,
      assignee: Math.random() > 0.6 ? "Jane Doe" : undefined,
      tags: ["IT", "Ops"],
    };
  });
};

const App: React.FC = () => {
  const { t } = useLanguage();
  const [items, setItems] = useState<IntakeItem[]>(generateMockData());
  const [selectedItem, setSelectedItem] = useState<IntakeItem | null>(null);
  const [isNewIntakeOpen, setIsNewIntakeOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "All",
    priority: "All",
    client: "All",
  });

  // New Intake Form State
  const [newIntake, setNewIntake] = useState({
    title: "",
    description: "",
    client: "",
    priority: Priority.MEDIUM,
    requestor: "",
  });

  const clients = [
    "Acme Corp",
    "Globex",
    "Soylent Corp",
    "Initech",
    "Massive Dynamic",
  ];

  const handleUpdateItem = (updated: IntakeItem) => {
    setItems((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
    setSelectedItem(updated);
  };

  const handleCreateIntake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIntake.title || !newIntake.client) return;

    const newItem: IntakeItem = {
      id: `INT-${1000 + items.length}`,
      title: newIntake.title,
      description: newIntake.description || "No description provided.",
      client: newIntake.client,
      requestor: newIntake.requestor || "unknown@example.com",
      priority: newIntake.priority,
      status: Status.NEW,
      createdAt: new Date().toISOString(),
      slaDueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h from now
      assignee: undefined,
      tags: [],
    };

    setItems((prev) => [newItem, ...prev]);
    setIsNewIntakeOpen(false);
    setNewIntake({
      title: "",
      description: "",
      client: "",
      priority: Priority.MEDIUM,
      requestor: "",
    });
  };

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        const matchesSearch =
          item.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          item.id.toLowerCase().includes(filters.search.toLowerCase()) ||
          item.client.toLowerCase().includes(filters.search.toLowerCase());
        const matchesStatus =
          filters.status === "All" || item.status === filters.status;
        const matchesPriority =
          filters.priority === "All" || item.priority === filters.priority;
        const matchesClient =
          filters.client === "All" || item.client === filters.client;

        return (
          matchesSearch && matchesStatus && matchesPriority && matchesClient
        );
      })
      .sort(
        (a, b) =>
          new Date(a.slaDueAt).getTime() - new Date(b.slaDueAt).getTime()
      ); // Sort by SLA urgency
  }, [items, filters]);

  // Stats
  const stats = useMemo(() => {
    const total = items.length;
    const breached = items.filter(
      (i) =>
        new Date(i.slaDueAt) < new Date() &&
        i.status !== Status.CLOSED &&
        i.status !== Status.RESOLVED
    ).length;
    const critical = items.filter(
      (i) => i.priority === Priority.CRITICAL && i.status !== Status.CLOSED
    ).length;
    const unassigned = items.filter(
      (i) => !i.assignee && i.status !== Status.CLOSED
    ).length;
    return { total, breached, critical, unassigned };
  }, [items]);

  return (
    <>
      <div className={styles.pageContainer}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h1>{t("inbox.title")}</h1>
            <p>{t("inbox.subtitle")}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.open}`}>
            <div>
              <p className={styles.statLabel}>{t("inbox.openItems")}</p>
              <p className={styles.statValue}>{stats.total}</p>
            </div>
            <div className={styles.statIconWrapper}>
              <PieChart size={20} />
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.breached}`}>
            <div>
              <p className={styles.statLabel}>{t("inbox.slaBreach")}</p>
              <p className={styles.statValue}>{stats.breached}</p>
            </div>
            <div className={styles.statIconWrapper}>
              <AlertTriangle size={20} />
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.critical}`}>
            <div>
              <p className={styles.statLabel}>{t("inbox.criticalHigh")}</p>
              <p className={styles.statValue}>{stats.critical}</p>
            </div>
            <div className={styles.statIconWrapper}>
              <Zap size={20} />
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.unassigned}`}>
            <div>
              <p className={styles.statLabel}>Unassigned</p>
              <p className={styles.statValue}>{stats.unassigned}</p>
            </div>
            <div className={styles.statIconWrapper}>
              <Filter size={20} />
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.searchContainer}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder={t("inbox.searchPlaceholder")}
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterControls}>
            <select
              className={styles.select}
              value={filters.priority}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  priority: e.target.value as Priority | "All",
                })
              }
            >
              <option value="All">{t("inbox.allPriorities")}</option>
              {Object.values(Priority).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            <select
              className={styles.select}
              value={filters.status}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  status: e.target.value as Status | "All",
                })
              }
            >
              <option value="All">{t("inbox.allStatuses")}</option>
              {Object.values(Status).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <Button
              variant="primary"
              size="sm"
              leftIcon={<PlusCircle size={14} />}
              onClick={() => setIsNewIntakeOpen(true)}
            >
              {t("inbox.newIntake")}
            </Button>
          </div>
        </div>

        {/* Inbox List Container */}
        <div className={styles.listContainer}>
          <IntakeList
            items={filteredItems}
            onSelect={setSelectedItem}
            selectedId={selectedItem?.id || null}
          />
        </div>
      </div>

      {/* Slide Over Panel Overlay */}
      {selectedItem && (
        <div
          className={styles.panelOverlay}
          onClick={() => setSelectedItem(null)}
        />
      )}

      {/* Detail Panel */}
      <IntakeDetailPanel
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onUpdate={handleUpdateItem}
      />

      {/* New Intake Modal */}
      {isNewIntakeOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsNewIntakeOpen(false)}
        >
          <div
            className="modal w-full max-w-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with gradient accent */}
            <div className="modal__header">
              <h2 className="modal__title">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-primary)] flex items-center justify-center">
                  <PlusCircle size={18} className="text-white" />
                </div>
                {t("inbox.newIntake")}
              </h2>
              <button
                onClick={() => setIsNewIntakeOpen(false)}
                className="modal__close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateIntake} className="modal__body">
              {/* Title */}
              <div className="form-group">
                <label className="form-label">
                  <FileText size={14} />
                  {t("inbox.form.title")}
                </label>
                <input
                  type="text"
                  required
                  value={newIntake.title}
                  onChange={(e) =>
                    setNewIntake({ ...newIntake, title: e.target.value })
                  }
                  className="form-input"
                  placeholder={t("inbox.form.titlePlaceholder")}
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">
                  <FileText size={14} />
                  {t("inbox.form.description")}
                </label>
                <textarea
                  value={newIntake.description}
                  onChange={(e) =>
                    setNewIntake({ ...newIntake, description: e.target.value })
                  }
                  className="form-input"
                  style={{ minHeight: "100px", resize: "vertical" }}
                  placeholder={t("inbox.form.descriptionPlaceholder")}
                  rows={4}
                />
              </div>

              {/* Client & Priority Row */}
              <div className="grid grid-cols-2 gap-4 form-group">
                <div>
                  <label className="form-label">
                    <Building2 size={14} />
                    {t("inbox.form.client")}
                  </label>
                  <select
                    required
                    value={newIntake.client}
                    onChange={(e) =>
                      setNewIntake({ ...newIntake, client: e.target.value })
                    }
                    className="form-select"
                  >
                    <option value="">{t("inbox.form.selectClient")}</option>
                    {clients.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">
                    <Zap size={14} />
                    {t("inbox.form.priority")}
                  </label>
                  <select
                    value={newIntake.priority}
                    onChange={(e) =>
                      setNewIntake({
                        ...newIntake,
                        priority: e.target.value as Priority,
                      })
                    }
                    className="form-select"
                  >
                    {Object.values(Priority).map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Requestor */}
              <div className="form-group">
                <label className="form-label">
                  <User size={14} />
                  {t("inbox.form.requestor")}
                </label>
                <input
                  type="email"
                  value={newIntake.requestor}
                  onChange={(e) =>
                    setNewIntake({ ...newIntake, requestor: e.target.value })
                  }
                  className="form-input"
                  placeholder={t("inbox.form.requestorPlaceholder")}
                />
              </div>

              {/* Info Box */}
              <div className="info-box">
                <Clock size={18} className="info-box__icon" />
                <div className="info-box__content">
                  <p className="info-box__title">
                    SLA will be automatically calculated
                  </p>
                  <p className="info-box__description">
                    Based on the client contract terms and selected priority
                    level. Critical items have a 4-hour SLA, while Low priority
                    items have 72 hours.
                  </p>
                </div>
              </div>
            </form>

            <div className="modal__footer">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsNewIntakeOpen(false)}
              >
                {t("inbox.form.cancel")}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreateIntake}
                leftIcon={<PlusCircle size={14} />}
              >
                {t("inbox.form.create")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default App;
