import React, { useState, useEffect } from "react";
import { Client, Integration, HealthStatus, LogEntry } from "./types";
import { IntegrationCard } from "./components/IntegrationCard";
import { IntegrationModal } from "./components/IntegrationModal";
import {
  LayoutGrid,
  Search,
  Plus,
  Filter,
  Database,
  Shield,
} from "lucide-react";

// MOCK DATA GENERATION
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

import { AppShell, Button } from "@bundlros/ui";

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

    // Simulate API call latency
    setTimeout(() => {
      const updated = integrations.map((i) => {
        if (i.id === integration.id) {
          // Random success/fail for demo purposes
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
    <div className="flex flex-col h-full bg-[var(--color-bg-app)] text-[var(--color-text-primary)]">
      {/* Module Sub-Header */}
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
            Integration Health
          </h1>
          <p className="text-xs text-[var(--color-text-tertiary)] font-medium">
            Manage client connections and monitor sync status across the
            ecosystem.
          </p>
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
            <input
              type="text"
              placeholder="Search integration..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] rounded-lg text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)] w-full sm:w-64"
            />
          </div>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Integration
          </Button>
        </div>
      </header>

      {/* Client Groups */}
      <div className="space-y-10">
        {clients.map((client) => {
          const clientIntegrations = filteredIntegrations.filter(
            (i) => i.clientId === client.id
          );
          if (clientIntegrations.length === 0) return null;

          return (
            <section
              key={client.id}
              className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <div className="flex items-center gap-3 mb-6 px-1">
                <div className="w-1.5 h-6 bg-[var(--color-accent-primary)] rounded-full"></div>
                <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
                  {client.name}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--color-bg-subtle)] text-[var(--color-text-tertiary)] border border-[var(--color-border-subtle)] font-mono">
                  {client.id}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <button className="border-2 border-dashed border-[var(--color-border-subtle)] rounded-xl p-6 flex flex-col items-center justify-center text-[var(--color-text-tertiary)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)] hover:bg-[var(--color-bg-subtle)] transition-all group h-64 min-h-[200px]">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-bg-subtle)] flex items-center justify-center mb-3 group-hover:bg-[var(--color-accent-subtle)] transition-colors">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold">
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
