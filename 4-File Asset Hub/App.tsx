import React, { useState, useEffect } from "react";
import {
  LayoutGrid,
  List,
  Search,
  Upload,
  Filter,
  Film,
  Image as ImageIcon,
} from "lucide-react";

import { Asset, Client, Deliverable } from "./types";
import { backend } from "./services/mockBackend";
import { AssetCard } from "./components/AssetCard";
import { AssetList } from "./components/AssetList";
import { AssetDetailModal } from "./components/AssetDetailModal";
import { UploadOverlay } from "./components/UploadOverlay";
import { AppShell, Button } from "@bundlros/ui";

// Mock simple debounce for search
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

import styles from "./components/Assets.module.css";

// ... existing imports ...

const App: React.FC = () => {
  // ... existing state ...
  // State
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedDeliverable, setSelectedDeliverable] = useState<string>("");

  // Modals
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Initial Load
  useEffect(() => {
    const init = async () => {
      const [c, d, a] = await Promise.all([
        backend.getClients(),
        backend.getDeliverables(),
        backend.getAssets(),
      ]);
      setClients(c);
      setDeliverables(d);
      setAssets(a);
    };
    init();
  }, []);

  // Filter Logic
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.filename.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      asset.tags.some((t) =>
        t.toLowerCase().includes(debouncedSearch.toLowerCase())
      );

    const matchesClient = selectedClient
      ? asset.clientId === selectedClient
      : true;
    const matchesDeliverable = selectedDeliverable
      ? asset.deliverableId === selectedDeliverable
      : true;

    return matchesSearch && matchesClient && matchesDeliverable;
  });

  // Derived deliverables based on selected client
  const filteredDeliverables = selectedClient
    ? deliverables.filter((d) => d.clientId === selectedClient)
    : deliverables;

  const handleAssetUpdate = (updated: Asset) => {
    setAssets((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    setSelectedAsset(updated);
  };

  const refreshAssets = async () => {
    const a = await backend.getAssets();
    setAssets(a);
  };

  // Calculate simple stats
  const totalSize = (
    assets.reduce((acc, curr) => acc + curr.size, 0) /
    (1024 * 1024)
  ).toFixed(1);
  const totalAssets = assets.length;
  const recentUploads = assets.filter((a) => {
    const date = new Date(a.uploadedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }).length;

  return (
    <div className={styles.pageContainer}>
      {/* Module Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>File Asset Hub</h1>
          <p>Centralized digital asset management and storage</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div>
            <p className={styles.statLabel}>Total Assets</p>
            <p className={styles.statValue}>{totalAssets}</p>
          </div>
          <div className={styles.statIconWrapper}>
            <ImageIcon size={20} />
          </div>
        </div>
        <div className={styles.statCard}>
          <div>
            <p className={styles.statLabel}>Storage Used</p>
            <p className={styles.statValue}>{totalSize} MB</p>
          </div>
          <div className={styles.statIconWrapper}>
            <LayoutGrid size={20} />
          </div>
        </div>
        <div className={styles.statCard}>
          <div>
            <p className={styles.statLabel}>New (7d)</p>
            <p className={styles.statValue}>{recentUploads}</p>
          </div>
          <div className={styles.statIconWrapper}>
            <Upload size={20} />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search assets (name, tags)..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.filterControls}>
          {/* Client Filter */}
          <select
            className={styles.select}
            value={selectedClient}
            onChange={(e) => {
              setSelectedClient(e.target.value);
              setSelectedDeliverable("");
            }}
          >
            <option value="">All Clients</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Deliverable Filter (Conditional) */}
          {selectedClient && (
            <select
              className={styles.select}
              value={selectedDeliverable}
              onChange={(e) => setSelectedDeliverable(e.target.value)}
            >
              <option value="">All Deliverables</option>
              {filteredDeliverables.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          )}

          {/* View Toggle */}
          <div className={styles.viewToggle}>
            <button
              onClick={() => setViewMode("grid")}
              className={`${styles.viewButton} ${
                viewMode === "grid" ? styles.viewButtonActive : ""
              }`}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`${styles.viewButton} ${
                viewMode === "list" ? styles.viewButtonActive : ""
              }`}
            >
              <List size={14} />
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Upload size={14} />}
            onClick={() => setIsUploadOpen(true)}
          >
            Upload
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className={styles.contentArea}>
        {filteredAssets.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>
              <Search size={24} />
            </div>
            <h3>No assets found</h3>
            <p>
              Try adjusting your filters or upload new assets to get started.
            </p>
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <div className={styles.gridContainer}>
                {filteredAssets.map((asset) => (
                  <AssetCard
                    key={asset.id}
                    asset={asset}
                    onClick={setSelectedAsset}
                  />
                ))}
              </div>
            ) : (
              <div className={styles.listContainer}>
                <AssetList
                  assets={filteredAssets}
                  onAssetClick={setSelectedAsset}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {selectedAsset && (
        <AssetDetailModal
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          onUpdate={handleAssetUpdate}
          deliverables={deliverables}
        />
      )}

      <UploadOverlay
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadComplete={refreshAssets}
      />
    </div>
  );
};

export default App;
