import React, { useState, useEffect } from "react";
import { Client, Integration, HealthStatus, LogEntry } from "./types";
import { IntegrationCard } from "./components/IntegrationCard";
import { IntegrationModal } from "./components/IntegrationModal";
import { Search, Plus, Settings2 } from "lucide-react";
import { useLanguage } from "@bundlros/ui";
import styles from "./App.module.css";
import { AdminService } from "./services";

export default function App() {
  const { t } = useLanguage();
  const [clients, setClients] = useState<Client[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIntegration, setSelectedIntegration] =
    useState<Integration | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load data from service
  useEffect(() => {
    const loadData = async () => {
      try {
        const clientsData = await AdminService.getClients();
        setClients(clientsData);

        const integrationsData = await AdminService.getIntegrations();
        setIntegrations(integrationsData);
      } catch (error) {
        console.error("[Admin] Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleToggle = async (integration: Integration) => {
    const updated = await AdminService.toggleIntegration(integration.id);
    if (updated) {
      setIntegrations((prev) =>
        prev.map((i) => (i.id === updated.id ? updated : i))
      );
    }
  };

  const handleTest = async (integration: Integration) => {
    setTestingId(integration.id);

    const updated = await AdminService.testIntegration(integration.id);
    if (updated) {
      setIntegrations((prev) =>
        prev.map((i) => (i.id === updated.id ? updated : i))
      );
    }
    setTestingId(null);
  };

  const handleSaveIntegration = async (updated: Integration) => {
    const result = await AdminService.updateIntegration(updated.id, updated);
    if (result) {
      setIntegrations((prev) =>
        prev.map((i) => (i.id === result.id ? result : i))
      );
    }
  };

  const filteredIntegrations = integrations.filter((i) =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "200px",
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              border: "2px solid var(--color-accent-primary)",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
        </div>
      </div>
    );
  }

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
            {t("admin.title")}
          </h1>
          <p>{t("admin.subtitle")}</p>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.searchInput}>
            <Search />
            <input
              type="text"
              placeholder={t("admin.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className={styles.actionButton}>
            <Plus size={14} />
            {t("admin.newIntegration")}
          </button>
        </div>
      </div>

      {/* Client Groups */}
      <div>
        {clients.map((client) => {
          const clientIntegrations = filteredIntegrations.filter(
            (i) => i.clientId === client.id
          );
          // if (clientIntegrations.length === 0) return null;

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
                    t={t}
                  />
                ))}

                {/* Add New Placeholder Card */}
                <button className={styles.addCard}>
                  <div className={styles.addCardIcon}>
                    <Plus size={16} />
                  </div>
                  <span className={styles.addCardText}>
                    {t("admin.newIntegration")}
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
          t={t}
        />
      )}
    </div>
  );
}
