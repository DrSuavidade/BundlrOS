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

const App: React.FC = () => {
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

  return (
    <div className="page-container">
      {/* Module Sub-Header / Toolbar */}
      <header className="page-header">
        <div className="page-header__actions flex-1">
          <div className="search-input w-80">
            <Search className="search-input__icon h-4 w-4" />
            <input
              type="text"
              placeholder="Search assets..."
              className="form-input pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <Filter className="text-[var(--color-text-tertiary)] h-3 w-3" />
            <select
              className="form-select text-[10px]"
              value={selectedClient}
              onChange={(e) => {
                setSelectedClient(e.target.value);
                setSelectedDeliverable(""); // Reset deliverable when client changes
              }}
            >
              <option value="">All Clients</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {selectedClient && (
            <div className="flex items-center gap-2 animate-fade-in">
              <span className="text-[var(--color-text-tertiary)]">/</span>
              <select
                className="form-select text-[10px] max-w-[200px]"
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
            </div>
          )}
        </div>

        <div className="page-header__actions">
          <div className="flex bg-[var(--color-bg-subtle)] p-1 rounded-lg border border-[var(--color-border-subtle)]">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded transition-all ${
                viewMode === "grid"
                  ? "bg-[var(--color-bg-elevated)] text-[var(--color-accent-primary)] shadow-sm"
                  : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded transition-all ${
                viewMode === "list"
                  ? "bg-[var(--color-bg-elevated)] text-[var(--color-accent-primary)] shadow-sm"
                  : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
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
      </header>

      {/* Content Area */}
      <div className="flex-1">
        {filteredAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-[var(--color-text-tertiary)]">
            <div className="w-12 h-12 bg-[var(--color-bg-subtle)] rounded-full flex items-center justify-center mb-4 border border-[var(--color-border-subtle)]">
              <Search size={20} className="opacity-50" />
            </div>
            <p className="text-sm font-semibold">No assets found</p>
            <p className="text-[10px]">
              Try adjusting your filters or upload new assets.
            </p>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredAssets.map((asset) => (
                  <AssetCard
                    key={asset.id}
                    asset={asset}
                    onClick={setSelectedAsset}
                  />
                ))}
              </div>
            ) : (
              <AssetList
                assets={filteredAssets}
                onAssetClick={setSelectedAsset}
              />
            )}
          </div>
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
