import React from "react";
import { IntakeItem, Priority } from "../types";
import { Badge } from "./Badge";
import { Clock, MessageSquare, AlertCircle } from "lucide-react";

interface IntakeListProps {
  items: IntakeItem[];
  onSelect: (item: IntakeItem) => void;
  selectedId: string | null;
}

import styles from "./Inbox.module.css";
// ... existing imports ...

export const IntakeList: React.FC<IntakeListProps> = ({
  items,
  onSelect,
  selectedId,
}) => {
  if (items.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className="w-16 h-16 rounded-full bg-[var(--color-bg-subtle)] flex items-center justify-center mb-4">
          <MessageSquare
            size={32}
            className="text-[var(--color-text-tertiary)] opacity-50"
          />
        </div>
        <p>No intake items found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header Row */}
      <div className={styles.tableHeader}>
        <div className="col-span-1">ID</div>
        <div className="col-span-1">Status</div>
        <div className="col-span-1">Priority</div>
        <div className="col-span-4">Subject</div>
        <div className="col-span-2">Client</div>
        <div className="col-span-2">SLA Due</div>
        <div className="col-span-1 text-right">Owner</div>
      </div>

      {/* Rows */}
      <div className={styles.tableBody}>
        {items.map((item) => {
          const slaDate = new Date(item.slaDueAt);
          const now = new Date();
          const isBreached = now > slaDate;

          return (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              className={`${styles.tableRow} ${
                selectedId === item.id ? styles.selected : ""
              }`}
            >
              <div className={`${styles.rowId} col-span-1`}>#{item.id}</div>
              <div className="col-span-1">
                <Badge type="status" value={item.status} />
              </div>
              <div className="col-span-1">
                <Badge type="priority" value={item.priority} />
              </div>
              <div className="col-span-4 pr-4">
                <h4 className={styles.rowTitle}>{item.title}</h4>
                <p className={styles.rowDesc}>{item.description}</p>
              </div>
              <div className="col-span-2">
                <span className={styles.clientTag}>{item.client}</span>
              </div>
              <div className="col-span-2 flex items-center">
                <Clock
                  size={12}
                  className={`mr-1.5 ${
                    isBreached
                      ? "text-[var(--color-status-danger)]"
                      : "text-[var(--color-text-tertiary)]"
                  }`}
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
                    className="ml-2 text-[var(--color-status-danger)] animate-pulse"
                  />
                )}
              </div>
              <div className="col-span-1 flex justify-end">
                {item.assignee ? (
                  <div className={styles.assigneeBadge} title={item.assignee}>
                    {item.assignee.substring(0, 2).toUpperCase()}
                  </div>
                ) : (
                  <span className="text-[10px] text-[var(--color-text-tertiary)] italic">
                    --
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
