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
} from "lucide-react";
import { AppShell, Button } from "@bundlros/ui";
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
  const [items, setItems] = useState<IntakeItem[]>(generateMockData());
  const [selectedItem, setSelectedItem] = useState<IntakeItem | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "All",
    priority: "All",
    client: "All",
  });

  const handleUpdateItem = (updated: IntakeItem) => {
    setItems((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
    setSelectedItem(updated);
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
            <h1>Unified Inbox</h1>
            <p>Centralized operations triage and intake management</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.open}`}>
            <div>
              <p className={styles.statLabel}>Open Items</p>
              <p className={styles.statValue}>{stats.total}</p>
            </div>
            <div className={styles.statIconWrapper}>
              <PieChart size={20} />
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.breached}`}>
            <div>
              <p className={styles.statLabel}>SLA Breached</p>
              <p className={styles.statValue}>{stats.breached}</p>
            </div>
            <div className={styles.statIconWrapper}>
              <AlertTriangle size={20} />
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.critical}`}>
            <div>
              <p className={styles.statLabel}>Critical Priority</p>
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
              placeholder="Search intake items (ID, Title, Client)..."
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
              <option value="All">Priority: All</option>
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
              <option value="All">Status: All</option>
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
            >
              New Intake
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

      {/* Slide Over Panel */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          selectedItem ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSelectedItem(null)}
      ></div>
      <div
        className={`transform transition-transform duration-300 z-50 fixed inset-y-0 right-0 ${
          selectedItem ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {selectedItem && (
          <IntakeDetailPanel
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onUpdate={handleUpdateItem}
          />
        )}
      </div>
    </>
  );
};

export default App;
