import React from "react";
import { IntakeItem, Priority } from "../types";
import { Badge } from "./Badge";
import { Clock, MessageSquare, AlertCircle, User } from "lucide-react";
import { useLanguage } from "@bundlros/ui";
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
  const { t, language } = useLanguage();

  if (items.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyState__icon}>
          <MessageSquare size={36} />
        </div>
        <p className={styles.emptyState__title}>{t("inbox.list.emptyTitle")}</p>
        <p className={styles.emptyState__description}>
          {t("inbox.list.emptyDesc")}
        </p>
      </div>
    );
  }

  return (
    <div className={styles.intakeTableWrapper}>
      <table className={styles.intakeTable}>
        <colgroup>
          <col className={styles.colId} />
          <col className={styles.colStatus} />
          <col className={styles.colPriority} />
          <col className={styles.colSubject} />
          <col className={styles.colClient} />
          <col className={styles.colSla} />
          <col className={styles.colOwner} />
        </colgroup>
        <thead>
          <tr>
            <th>{t("inbox.list.id")}</th>
            <th>{t("inbox.list.status")}</th>
            <th>{t("inbox.list.priority")}</th>
            <th>{t("inbox.list.subject")}</th>
            <th>{t("inbox.list.client")}</th>
            <th>{t("inbox.list.slaDue")}</th>
            <th>{t("inbox.list.owner")}</th>
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
                  <span className={styles.rowId} title={item.id}>
                    #{item.id.slice(-6)}
                  </span>
                </td>
                <td>
                  <Badge type="status" value={item.status} />
                </td>
                <td>
                  <Badge type="priority" value={item.priority} />
                </td>
                <td>
                  <div className={styles.subjectCell}>
                    <h4 className={styles.rowTitle}>{item.title}</h4>
                    <p className={styles.rowDesc}>{item.description}</p>
                  </div>
                </td>
                <td>
                  <span className={styles.clientTag}>{item.client}</span>
                </td>
                <td>
                  <div className={styles.slaCell}>
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
                      {slaDate.toLocaleDateString(
                        language === "pt" ? "pt-PT" : "en-US",
                        {
                          month: "short",
                          day: "numeric",
                        },
                      )}{" "}
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
                  {item.assignee ? (
                    item.assigneeAvatarUrl ? (
                      <img
                        src={item.assigneeAvatarUrl}
                        alt={item.assignee}
                        title={item.assignee}
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        className={styles.assigneeAvatar}
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "1px solid var(--color-border-subtle)",
                        }}
                      />
                    ) : (
                      <div
                        className={styles.assigneeBadge}
                        title={item.assignee}
                      >
                        {item.assignee.substring(0, 2).toUpperCase()}
                      </div>
                    )
                  ) : (
                    <div className={styles.unassignedBadge}>
                      <User size={12} />
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
