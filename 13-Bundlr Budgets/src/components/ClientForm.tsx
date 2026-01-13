import React from "react";
import styles from "../../App.module.css";

interface ClientFormProps {
  clientName: string;
  projectName: string;
  notes: string;
  onChange: (field: string, value: string) => void;
  labels: any;
  clients: string[];
}

export const ClientForm: React.FC<ClientFormProps> = ({
  clientName,
  projectName,
  notes,
  onChange,
  labels,
  clients,
}) => {
  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>{labels.projectDetails}</span>
      </div>
      <div className={styles.sectionBody}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{labels.clientName}</label>
            <select
              className={styles.formInput}
              value={clientName}
              onChange={(e) => onChange("clientName", e.target.value)}
              style={{ paddingRight: "2rem" }} // Add padding for arrow
            >
              <option value="">
                {labels.selectClient || "Select Client..."}
              </option>
              {clients.map((client) => (
                <option key={client} value={client}>
                  {client}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{labels.projectName}</label>
            <input
              type="text"
              className={styles.formInput}
              placeholder="e.g. Q3 Rebranding"
              value={projectName}
              onChange={(e) => onChange("projectName", e.target.value)}
            />
          </div>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>{labels.notes}</label>
          <textarea
            className={styles.formTextarea}
            rows={3}
            placeholder="..."
            value={notes}
            onChange={(e) => onChange("notes", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
