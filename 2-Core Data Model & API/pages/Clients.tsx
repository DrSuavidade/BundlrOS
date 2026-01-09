import React, { useEffect, useState } from "react";
import { Client } from "../types";
import { MockAPI } from "../services/mockBackend";
import { StatusPill } from "../components/ui/StatusPill";
import {
  Building2,
  Plus,
  MoreHorizontal,
  Users,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "@bundlros/ui";

export const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    MockAPI.getClients().then(setClients);
  }, []);

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-container">
      {/* Header */}
      <header className="page-header">
        <div className="page-header__content">
          <h1 className="page-header__title flex items-center gap-3">
            <Users className="text-[var(--color-accent-primary)]" size={24} />
            Client Directory
          </h1>
          <p className="page-header__subtitle">
            Directory of all registered client organizations
          </p>
        </div>
        <div className="page-header__actions">
          <div className="search-input">
            <Search className="search-input__icon w-4 h-4" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input form-input--sm pl-9 w-64"
            />
          </div>
          <Button variant="primary" size="sm" leftIcon={<Plus size={16} />}>
            Add Client
          </Button>
        </div>
      </header>

      {/* Client Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <div
            key={client.id}
            className="group relative bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl p-6 transition-all duration-300 hover:border-[var(--color-border-default)] hover:shadow-lg cursor-pointer overflow-hidden"
          >
            {/* Accent glow on hover */}
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-[var(--color-accent-primary)] blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500" />

            <div className="relative">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] rounded-xl flex items-center justify-center text-[var(--color-text-tertiary)] group-hover:bg-[var(--color-accent-subtle)] group-hover:text-[var(--color-accent-primary)] group-hover:border-[var(--color-accent-primary)]/20 transition-all duration-300">
                  <Building2 size={22} />
                </div>
                <button className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] p-1.5 rounded-lg hover:bg-[var(--color-bg-elevated)] transition-colors">
                  <MoreHorizontal size={18} />
                </button>
              </div>

              {/* Client Info */}
              <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2 group-hover:text-[var(--color-accent-primary)] transition-colors">
                {client.name}
              </h3>

              <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] mb-4">
                <span className="font-mono text-[10px] bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] px-2 py-0.5 rounded-md text-[var(--color-text-tertiary)]">
                  {client.code}
                </span>
                <span className="text-[var(--color-text-tertiary)]">•</span>
                <span className="text-[var(--color-text-tertiary)]">
                  {client.industry}
                </span>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border-subtle)]">
                <span className="text-[10px] text-[var(--color-text-tertiary)] font-medium">
                  Added {new Date(client.created_at).toLocaleDateString()}
                </span>
                <StatusPill status={client.status} />
              </div>
            </div>
          </div>
        ))}

        {/* Empty State / Add Placeholder */}
        <button className="border-2 border-dashed border-[var(--color-border-subtle)] rounded-xl p-6 flex flex-col items-center justify-center text-[var(--color-text-tertiary)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)] hover:bg-[var(--color-bg-subtle)] transition-all h-full min-h-[220px] group">
          <div className="w-14 h-14 rounded-full bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)] flex items-center justify-center mb-4 group-hover:bg-[var(--color-accent-subtle)] group-hover:border-[var(--color-accent-primary)]/20 transition-colors">
            <Plus size={24} />
          </div>
          <span className="font-semibold text-sm">Register New Client</span>
          <span className="text-xs mt-1 text-[var(--color-text-tertiary)]">
            Add a new organization
          </span>
        </button>
      </div>

      {/* Empty State when no clients */}
      {clients.length === 0 && (
        <div className="empty-state mt-12">
          <div className="empty-state__icon">
            <Users size={32} />
          </div>
          <p className="empty-state__title">No Clients Yet</p>
          <p className="empty-state__description">
            Register your first client to get started with the system
          </p>
        </div>
      )}
    </div>
  );
};
