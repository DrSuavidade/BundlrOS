import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MockService } from "../services/mockData";
import { SystemEvent, Status } from "../types";
import { Search, Filter, RefreshCw, ChevronRight, Zap } from "lucide-react";
import { useLanguage } from "@bundlros/ui";
import styles from "../App.module.css";

const getStatusClass = (status: Status) => {
  switch (status) {
    case Status.SUCCESS:
      return styles.success;
    case Status.FAILED:
      return styles.failed;
    case Status.WAITING:
      return styles.waiting;
    case Status.RUNNING:
      return styles.running;
    default:
      return "";
  }
};

export const EventsPage: React.FC = () => {
  const { t } = useLanguage();
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");

  const getStatusLabel = (status: Status) => {
    switch (status) {
      case Status.SUCCESS:
        return t("events.status.success");
      case Status.FAILED:
        return t("events.status.failed");
      case Status.WAITING:
        return t("events.status.waiting");
      case Status.RUNNING:
        return t("events.status.running");
      default:
        return status;
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    const data = await MockService.getEvents();
    setEvents(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.clientId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>
            <Zap size={22} style={{ color: "var(--color-accent-primary)" }} />
            {t("events.eventsPage.title")}
          </h1>
          <p>{t("events.eventsPage.subtitle")}</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.refreshButton} onClick={fetchEvents}>
            <RefreshCw size={12} />
            {t("common.refresh")}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filterBar}>
        <div className={styles.searchInput}>
          <Search size={14} />
          <input
            type="text"
            placeholder={t("events.eventsPage.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.filterSelect}>
          <Filter size={14} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Status | "all")}
          >
            <option value="all">{t("events.eventsPage.allStatuses")}</option>
            <option value={Status.SUCCESS}>{t("events.status.success")}</option>
            <option value={Status.FAILED}>{t("events.status.failed")}</option>
            <option value={Status.WAITING}>{t("events.status.waiting")}</option>
            <option value={Status.RUNNING}>{t("events.status.running")}</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className={styles.sectionCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t("events.eventsPage.event")} ID</th>
              <th>{t("events.eventsPage.type")}</th>
              <th>Client</th>
              <th>{t("events.eventsPage.timestamp")}</th>
              <th>{t("events.eventsPage.status")}</th>
              <th style={{ width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {loading && events.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.emptyState}>
                  {t("common.loading")}
                </td>
              </tr>
            ) : filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.emptyState}>
                  {t("events.noEvents")}
                </td>
              </tr>
            ) : (
              filteredEvents.map((event) => (
                <tr key={event.id}>
                  <td className={styles.mono}>{event.id}</td>
                  <td>
                    <span className={styles.typeBadge}>{event.type}</span>
                  </td>
                  <td>{event.clientId}</td>
                  <td>
                    {new Date(event.createdAt).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${getStatusClass(
                        event.status
                      )}`}
                    >
                      {getStatusLabel(event.status)}
                    </span>
                  </td>
                  <td>
                    <Link
                      to={`/events/${event.id}`}
                      className={styles.rowAction}
                    >
                      <ChevronRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className={styles.tableFooter}>
          <span>
            Showing {filteredEvents.length} {t("events.events")}
          </span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button disabled style={{ opacity: 0.5 }}>
              {t("common.back")}
            </button>
            <button disabled style={{ opacity: 0.5 }}>
              {t("common.next")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
