import React, { useState } from "react";
import { Client, Integration, HealthStatus, LogEntry } from "./types";
import { IntegrationCard } from "./components/IntegrationCard";
import { IntegrationModal } from "./components/IntegrationModal";
import { Search, Plus, Settings2 } from "lucide-react";
import styles from "./App.module.css";

// MOCK DATA
const MOCK_CLIENTS: Client[] = [
  { id: "c1", name: "Acme Corp", contactEmail: "admin@acme.com" },
  { id: "c2", name: "Globex Inc", contactEmail: "it@globex.com" },
];

const INITIAL_INTEGRATIONS: Integration[] = [
  {
    id: "i1",
    clientId: "c1",
    providerId: "salesforce",
    name: "Salesforce CRM (Main)",
    status: HealthStatus.HEALTHY,
    enabled: true,
    lastSync: "2023-10-27 14:30:00",
    config: { endpointUrl: "https://acme.my.salesforce.com" },
    mappings: [{ sourceField: "user_email", destinationField: "Email" }],
    logs: [
      {
        id: "l1",
        timestamp: "2023-10-27 14:30:00",
        level: "success",
        message: "Sync completed successfully. 45 records updated.",
      },
      {
        id: "l2",
        timestamp: "2023-10-27 13:30:00",
        level: "info",
        message: "Sync started.",
      },
    ],
  },
  {
    id: "i2",
    clientId: "c1",
    providerId: "slack",
    name: "Alerts Channel",
    status: HealthStatus.FAILED,
    enabled: true,
    lastSync: "2023-10-26 09:15:00",
    config: {},
    mappings: [],
    logs: [
      {
        id: "l3",
        timestamp: "2023-10-27 14:35:00",
        level: "error",
        message: "Auth token expired or invalid_grant returned from Slack API.",
      },
      {
        id: "l4",
        timestamp: "2023-10-26 09:15:00",
        level: "success",
        message: "Message sent.",
      },
    ],
  },
  {
    id: "i3",
    clientId: "c2",
    providerId: "shopify",
    name: "Shopify Storefront",
    status: HealthStatus.DEGRADED,
    enabled: true,
    lastSync: "2023-10-27 10:00:00",
    config: { endpointUrl: "https://globex.myshopify.com" },
    mappings: [],
    logs: [
      {
        id: "l5",
        timestamp: "2023-10-27 10:00:00",
        level: "warn",
        message: "Rate limit approaching. Backing off for 5s.",
      },
    ],
  },
];

export default function App() {
  const [clients] = useState<Client[]>(MOCK_CLIENTS);
  const [integrations, setIntegrations] =
    useState<Integration[]>(INITIAL_INTEGRATIONS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIntegration, setSelectedIntegration] =
    useState<Integration | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  const handleToggle = (integration: Integration) => {
    const updated = integrations.map((i) => {
      if (i.id === integration.id) {
        const newState = !i.enabled;
        return {
          ...i,
          enabled: newState,
          status: newState ? HealthStatus.HEALTHY : HealthStatus.INACTIVE,
        };
      }
      return i;
    });
    setIntegrations(updated);
  };

  const handleTest = async (integration: Integration) => {
    setTestingId(integration.id);

    setTimeout(() => {
      const updated = integrations.map((i) => {
        if (i.id === integration.id) {
          const isSuccess = Math.random() > 0.3;
          const newStatus = isSuccess
            ? HealthStatus.HEALTHY
            : HealthStatus.FAILED;
          const newLog: LogEntry = {
            id: Date.now().toString(),
            timestamp: new Date()
              .toISOString()
              .replace("T", " ")
              .substring(0, 19),
            level: isSuccess ? "success" : "error",
            message: isSuccess
              ? "Manual connection test successful."
              : "Connection test failed: Connection refused (ECONNREFUSED).",
          };
          return { ...i, status: newStatus, logs: [...i.logs, newLog] };
        }
        return i;
      });
      setIntegrations(updated);
      setTestingId(null);
    }, 1500);
  };

  const handleSaveIntegration = (updated: Integration) => {
    setIntegrations(
      integrations.map((i) => (i.id === updated.id ? updated : i))
    );
  };

  const filteredIntegrations = integrations.filter((i) =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>
            <Settings2
              size={22}
              style={{ color: "var(--color-accent-primary)" }}
            />
            Admin Hub
          </h1>
          <p>
            Manage client connections and monitor sync status across the
            ecosystem
          </p>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.searchInput}>
            <Search />
            <input
              type="text"
              placeholder="Search integration..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className={styles.actionButton}>
            <Plus size={14} />
            New Integration
          </button>
        </div>
      </div>

      {/* Client Groups */}
      <div>
        {clients.map((client) => {
          const clientIntegrations = filteredIntegrations.filter(
            (i) => i.clientId === client.id
          );
          if (clientIntegrations.length === 0) return null;

          return (
            <section key={client.id} className={styles.clientSection}>
              <div className={styles.clientHeader}>
                <div className={styles.clientIndicator} />
                <h3 className={styles.clientName}>{client.name}</h3>
                <span className={styles.clientId}>{client.id}</span>
              </div>

              <div className={styles.integrationsGrid}>
                {clientIntegrations.map((integration) => (
                  <IntegrationCard
                    key={integration.id}
                    integration={integration}
                    onManage={() => setSelectedIntegration(integration)}
                    onToggle={handleToggle}
                    onTest={handleTest}
                    isTesting={testingId === integration.id}
                  />
                ))}

                {/* Add New Placeholder Card */}
                <button className={styles.addCard}>
                  <div className={styles.addCardIcon}>
                    <Plus size={16} />
                  </div>
                  <span className={styles.addCardText}>
                    Connect New Integration
                  </span>
                </button>
              </div>
            </section>
          );
        })}
      </div>

      {/* Modal */}
      {selectedIntegration && (
        <IntegrationModal
          isOpen={!!selectedIntegration}
          integration={selectedIntegration}
          onClose={() => setSelectedIntegration(null)}
          onSave={handleSaveIntegration}
        />
      )}
    </div>
  );
}
