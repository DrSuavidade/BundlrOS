import React from "react";
import { IntakeItem, Priority } from "../types";
import { Badge } from "./Badge";
import { Clock, MessageSquare, AlertCircle, User } from "lucide-react";
import styles from "./Inbox.module.css";

interface IntakeListProps {
  items: IntakeItem[];
  onSelect: (item: IntakeItem) => void;
  selectedId: string | null;
}

export const IntakeList: React.FC<IntakeListProps> = ({
  items,
  onSelect,
  selectedId,
}) => {
  if (items.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className="w-16 h-16 rounded-full bg-[var(--color-bg-subtle)] flex items-center justify-center mb-4 border border-[var(--color-border-subtle)]">
          <MessageSquare
            size={32}
            className="text-[var(--color-text-tertiary)] opacity-50"
          />
        </div>
        <p className="text-sm font-medium text-[var(--color-text-secondary)]">
          No intake items found
        </p>
        <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
          Try adjusting your filters
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Table */}
      <table className={styles.intakeTable}>
        <thead>
          <tr>
            <th style={{ width: "80px" }}>ID</th>
            <th style={{ width: "100px" }}>Status</th>
            <th style={{ width: "80px" }}>Priority</th>
            <th>Subject</th>
            <th style={{ width: "120px" }}>Client</th>
            <th style={{ width: "130px" }}>SLA Due</th>
            <th style={{ width: "70px", textAlign: "center" }}>Owner</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const slaDate = new Date(item.slaDueAt);
            const now = new Date();
            const isBreached = now > slaDate;

            return (
              <tr
                key={item.id}
                onClick={() => onSelect(item)}
                className={selectedId === item.id ? styles.selectedRow : ""}
              >
                <td>
                  <span className={styles.rowId}>#{item.id}</span>
                </td>
                <td>
                  <Badge type="status" value={item.status} />
                </td>
                <td>
                  <Badge type="priority" value={item.priority} />
                </td>
                <td>
                  <div className="min-w-0">
                    <h4 className={styles.rowTitle}>{item.title}</h4>
                    <p className={styles.rowDesc}>{item.description}</p>
                  </div>
                </td>
                <td>
                  <span className={styles.clientTag}>{item.client}</span>
                </td>
                <td>
                  <div className="flex items-center gap-1.5">
                    <Clock
                      size={12}
                      className={
                        isBreached
                          ? "text-[var(--color-status-danger)]"
                          : "text-[var(--color-text-tertiary)]"
                      }
                    />
                    <span
                      className={`${styles.slaText} ${
                        isBreached ? styles.slaBreached : ""
                      }`}
                    >
                      {slaDate.toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      {slaDate.getHours()}:
                      {slaDate.getMinutes().toString().padStart(2, "0")}
                    </span>
                    {isBreached && (
                      <AlertCircle
                        size={12}
                        className="text-[var(--color-status-danger)] animate-pulse"
                      />
                    )}
                  </div>
                </td>
                <td>
                  <div className="flex justify-center">
                    {item.assignee ? (
                      <div
                        className={styles.assigneeBadge}
                        title={item.assignee}
                      >
                        {item.assignee.substring(0, 2).toUpperCase()}
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-[var(--color-bg-subtle)] border border-dashed border-[var(--color-border-subtle)] flex items-center justify-center">
                        <User
                          size={12}
                          className="text-[var(--color-text-tertiary)]"
                        />
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
