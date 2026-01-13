import React, { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Category,
  Tier,
  Budget,
  BudgetSelectionState,
  SelectedService,
  AtomicService,
  TemplateBudgetOutput,
} from "./src/types";
import { ClientForm } from "./src/components/ClientForm";
import { CategoryBuilder } from "./src/components/CategoryBuilder";
import { ProposalPreview } from "./src/components/ProposalPreview";
import { JsonView } from "./src/components/JsonView";
import { TemplatePreview } from "./src/components/TemplatePreview";
import {
  Code,
  Layout,
  Settings,
  Moon,
  Sun,
  Languages,
  FileText,
  Maximize2,
  X,
} from "lucide-react";
import {
  getLocalizedData,
  UI_LABELS,
  BUNDLE_PRESETS,
} from "./src/constants/constants";
import { computeServicePricing } from "./src/utils/pricing";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const BundlrLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <img src="./src/public/favicon.ico" alt="Bundlr logo" className={className} />
);

const buildTemplateBudget = (
  budget: Budget,
  atomicServices: AtomicService[]
): TemplateBudgetOutput => {
  const serviceMap: Record<string, AtomicService> = {};
  atomicServices.forEach((s) => {
    serviceMap[s.id] = s;
  });

  const tiers: Tier[] = ["fast", "standard", "pro"];

  const planSummaries = tiers.map((tier) => {
    let totalHours = 0;
    let totalPrice = 0;

    budget.items.forEach((item) => {
      const service = serviceMap[item.serviceId];
      if (!service) return;
      const pricing = computeServicePricing(service, tier);
      if (!pricing) return;
      totalHours += pricing.hours;
      totalPrice += pricing.price;
    });

    return {
      tier,
      totalHours,
      totalPrice,
    };
  });

  return {
    id: budget.id,
    clientName: budget.clientName,
    projectName: budget.projectName,
    notes: budget.notes,
    plans: planSummaries,
  };
};

import { AppShell, Button, useLanguage } from "@bundlros/ui";
import { ClientsApi } from "@bundlros/supabase";
import styles from "./App.module.css";
import { Wallet } from "lucide-react";

const App: React.FC = () => {
  // Config State - use global language
  const { language: lang } = useLanguage();
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark for BundlrOS
  const [showOptions, setShowOptions] = useState(false);

  // ... (rest of the state remains same)
  // App State
  const [clientName, setClientName] = useState("");
  const [clients, setClients] = useState<string[]>([]);
  const [projectName, setProjectName] = useState("");
  const [notes, setNotes] = useState("");
  const [activeTab, setActiveTab] = useState<"proposal" | "json" | "template">(
    "proposal"
  );

  const [isTemplateFullscreen, setIsTemplateFullscreen] = useState(false);
  const [showTemplateJsonEditor, setShowTemplateJsonEditor] = useState(false);
  const [templateJsonText, setTemplateJsonText] = useState<string | null>(null);
  const [templateBudgetOverride, setTemplateBudgetOverride] =
    useState<TemplateBudgetOutput | null>(null);
  const [templateJsonError, setTemplateJsonError] = useState<string | null>(
    null
  );

  const [selections, setSelections] = useState<BudgetSelectionState>({});

  const [selectedPresetId, setSelectedPresetId] = useState<string>("");
  const [budgetId] = useState(() => `b-${Date.now().toString(36)}`);
  const templatePdfRef = useRef<HTMLDivElement | null>(null);

  const proposalRefs = useRef<Record<Tier, HTMLDivElement | null>>({
    fast: null,
    standard: null,
    pro: null,
  });

  // Effects
  useEffect(() => {
    // Standardize to dark mode as per BundlrOS spec
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    async function fetchClients() {
      try {
        const data = await ClientsApi.getAll();
        setClients(data.map((c) => c.name));
      } catch (error) {
        console.error("Failed to fetch clients", error);
      }
    }
    fetchClients();
  }, []);

  // Derived Data
  const localizedData = useMemo(() => getLocalizedData(lang), [lang]);
  const labels = UI_LABELS[lang];

  // Handlers (remain unchanged)
  const handleClientUpdate = (field: string, value: string) => {
    if (field === "clientName") setClientName(value);
    if (field === "projectName") setProjectName(value);
    if (field === "notes") setNotes(value);
  };

  const handleSelectionUpdate = (
    catId: Category,
    newTier: Tier | undefined,
    serviceId: string | undefined
  ) => {
    setSelections((prev) => {
      const catState = prev[catId] || { tier: "standard", serviceIds: [] };

      // Update Tier
      if (newTier) {
        return {
          ...prev,
          [catId]: { ...catState, tier: newTier },
        };
      }

      // Toggle Service
      if (serviceId) {
        const currentIds = catState.serviceIds;
        const newIds = currentIds.includes(serviceId)
          ? currentIds.filter((id) => id !== serviceId)
          : [...currentIds, serviceId];

        return {
          ...prev,
          [catId]: { ...catState, serviceIds: newIds },
        };
      }

      return prev;
    });
  };

  const handlePresetSelect = (presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = BUNDLE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setSelections(preset.selection);
    if (!projectName) setProjectName(preset.name);
  };

  const handleTemplateJsonChange = (value: string) => {
    setTemplateJsonText(value);
    try {
      const parsed = JSON.parse(value);

      if (parsed && typeof parsed === "object" && Array.isArray(parsed.plans)) {
        setTemplateBudgetOverride(parsed as TemplateBudgetOutput);
        setTemplateJsonError(null);
      } else {
        setTemplateJsonError("JSON precisa de um campo 'plans' with an array.");
      }
    } catch (e: any) {
      setTemplateJsonError(e?.message ?? "JSON inválido");
    }
  };

  const buildTierBudget = (budget: Budget, tier: Tier): Budget => ({
    id: `${budget.id}-${tier}`,
    clientName: budget.clientName,
    projectName: budget.projectName,
    notes: budget.notes,
    clientId: "",
    contractId: "",
    items: budget.items.map((item) => ({
      serviceId: item.serviceId,
      tier, // force this tier on all services
    })),
  });

  const handleDownloadTemplatePdf = async () => {
    if (!templatePdfRef.current) return;

    const tiers: Tier[] = ["fast", "standard", "pro"];

    // 1) Capture template (page 1 – landscape)
    const templateCanvas = await html2canvas(templatePdfRef.current, {
      scale: 2,
    });
    const templateImg = templateCanvas.toDataURL("image/png");

    // First page: A4 LANDSCAPE
    const pdf = new jsPDF("landscape", "pt", "a4");
    const padding = 15;

    const placeImageOnPage = (
      imgWidth: number,
      imgHeight: number,
      imgData: string
    ) => {
      // Always use CURRENT page size (landscape vs portrait)
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const maxWidth = pageWidth - padding * 2;
      const maxHeight = pageHeight - padding * 2;

      const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
      const printWidth = imgWidth * ratio;
      const printHeight = imgHeight * ratio;

      const x = (pageWidth - printWidth) / 2;
      const y = (pageHeight - printHeight) / 2;

      pdf.addImage(imgData, "PNG", x, y, printWidth, printHeight);

      return { x, y, printWidth, printHeight };
    };

    // --- PAGE 1 (landscape template) ---
    const { x, y, printWidth, printHeight } = placeImageOnPage(
      templateCanvas.width,
      templateCanvas.height,
      templateImg
    );

    // 2) Pages 2–4: ProposalPreview for each tier in PORTRAIT
    for (let i = 0; i < tiers.length; i++) {
      const tier = tiers[i];
      const el = proposalRefs.current[tier];
      if (!el) continue;

      // New page in PORTRAIT
      pdf.addPage("a4", "portrait");

      const canvas = await html2canvas(el, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      placeImageOnPage(canvas.width, canvas.height, imgData);
    }

    // 3) Back to page 1 (landscape) and add links over the 3 cards
    pdf.setPage(1);

    const columnWidth = printWidth / tiers.length;
    const linkHeight = printHeight * 0.7;
    const linkTop = y + printHeight * 0.16; // same estimate as before

    tiers.forEach((tier, idx) => {
      const linkX = x + columnWidth * idx;
      const targetPage = 2 + idx; // fast → 2, standard → 3, pro → 4

      pdf.link(linkX, linkTop, columnWidth, linkHeight, {
        pageNumber: targetPage,
      });
    });

    const baseName =
      (budget.clientName && budget.clientName.trim()) ||
      (budget.projectName && budget.projectName.trim()) ||
      "template";

    pdf.save(`${baseName}.pdf`);
  };

  const budget: Budget = useMemo(() => {
    const items: SelectedService[] = [];
    Object.keys(selections).forEach((key) => {
      const data = selections[key];
      data.serviceIds.forEach((sId) => {
        items.push({
          serviceId: sId,
          tier: data.tier,
        });
      });
    });

    return {
      id: budgetId,
      clientId: "",
      contractId: "",
      clientName,
      projectName,
      notes,
      items,
      _meta: selections,
    };
  }, [clientName, projectName, notes, selections, budgetId]);

  const templateBase: TemplateBudgetOutput = useMemo(
    () => buildTemplateBudget(budget, localizedData.ATOMIC_SERVICES),
    [budget, localizedData.ATOMIC_SERVICES]
  );

  useEffect(() => {
    if (isTemplateFullscreen && templateJsonText === null) {
      setTemplateJsonText(JSON.stringify(templateBase, null, 2));
    }
  }, [isTemplateFullscreen, templateBase, templateJsonText]);

  const selectedCount = itemsCount(selections);

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>
            <Wallet size={22} className="text-[var(--color-accent-primary)]" />
            Proposal Builder
          </h1>
          <p>
            {selectedCount} {labels.servicesSelected}
          </p>
        </div>

        {/* Language is now controlled from the global navbar */}
      </div>

      {/* Main Content */}
      <div className={styles.mainGrid}>
        {/* Left Column: Builder */}
        <div className={styles.leftColumn}>
          <ClientForm
            clientName={clientName}
            projectName={projectName}
            notes={notes}
            onChange={handleClientUpdate}
            labels={labels}
            clients={clients}
          />

          <div className={styles.builderHeader}>
            <span className={styles.builderTitle}>{labels.serviceBuilder}</span>
            <div className={styles.presetRow}>
              <span className={styles.presetLabel}>{labels.presetLabel}</span>
              <select
                className={styles.presetSelect}
                value={selectedPresetId}
                onChange={(e) => handlePresetSelect(e.target.value)}
              >
                <option value="">{labels.noPreset}</option>
                {BUNDLE_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <CategoryBuilder
            selections={selections}
            onUpdate={handleSelectionUpdate}
            data={localizedData}
            labels={labels}
          />
        </div>

        {/* Right Column: Preview */}
        <div className={styles.rightColumn}>
          {/* Tab Navigation with Fullscreen Button */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "0.875rem",
            }}
          >
            <div className={styles.tabNav}>
              <button
                onClick={() => setActiveTab("proposal")}
                className={`${styles.tabButton} ${
                  activeTab === "proposal" ? styles.active : ""
                }`}
              >
                <Layout size={14} />
                {labels.proposalView}
              </button>
              <button
                onClick={() => setActiveTab("json")}
                className={`${styles.tabButton} ${
                  activeTab === "json" ? styles.active : ""
                }`}
              >
                <Code size={14} />
                {labels.jsonSpec}
              </button>
              <button
                onClick={() => setActiveTab("template")}
                className={`${styles.tabButton} ${
                  activeTab === "template" ? styles.active : ""
                }`}
              >
                <FileText size={14} />
                {labels.templateView ?? "Template"}
              </button>
            </div>

            {activeTab === "template" && (
              <button
                type="button"
                onClick={() => setIsTemplateFullscreen(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  padding: "0.375rem 0.625rem",
                  background: "var(--color-bg-subtle)",
                  border: "1px solid var(--color-border-subtle)",
                  borderRadius: "0.375rem",
                  fontSize: "0.625rem",
                  fontWeight: 600,
                  color: "var(--color-text-secondary)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <Maximize2 size={12} />
                Fullscreen
              </button>
            )}
          </div>

          <div className={styles.previewContainer}>
            {activeTab === "proposal" && (
              <ProposalPreview
                budget={budget}
                data={localizedData}
                labels={labels}
              />
            )}

            {activeTab === "json" && <JsonView budget={budget} />}

            {activeTab === "template" && <TemplatePreview budget={budget} />}
          </div>
        </div>
      </div>
      {isTemplateFullscreen &&
        createPortal(
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 99999,
              background: "rgba(0, 0, 0, 0.95)",
              backdropFilter: "blur(8px)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Top bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.75rem 1.25rem",
                background: "var(--color-bg-card)",
                borderBottom: "1px solid var(--color-border-subtle)",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <FileText
                  size={16}
                  style={{ color: "var(--color-accent-primary)" }}
                />
                <span
                  style={{
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                  }}
                >
                  {labels.templateView ?? "Template de Preço"}
                </span>
              </div>

              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <button
                  type="button"
                  onClick={() => setShowTemplateJsonEditor((prev) => !prev)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    padding: "0.375rem 0.75rem",
                    background: "var(--color-bg-subtle)",
                    border: "1px solid var(--color-border-subtle)",
                    borderRadius: "0.375rem",
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    color: "var(--color-text-secondary)",
                    cursor: "pointer",
                  }}
                >
                  <Code size={12} />
                  {showTemplateJsonEditor ? "Fechar JSON" : "Ver JSON"}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadTemplatePdf}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    padding: "0.375rem 0.75rem",
                    background: "var(--color-accent-primary)",
                    border: "none",
                    borderRadius: "0.375rem",
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  Download PDF
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsTemplateFullscreen(false);
                    setShowTemplateJsonEditor(false);
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    padding: "0.375rem 0.75rem",
                    background: "var(--color-bg-subtle)",
                    border: "1px solid var(--color-border-subtle)",
                    borderRadius: "0.375rem",
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    color: "var(--color-text-secondary)",
                    cursor: "pointer",
                  }}
                >
                  <X size={12} />
                  Fechar
                </button>
              </div>
            </div>

            {/* Content: template + optional side JSON editor */}
            <div
              style={{
                flex: 1,
                padding: "1.5rem",
                display: "flex",
                gap: "1rem",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  overflow: "auto",
                }}
              >
                <TemplatePreview
                  budget={budget}
                  exportRef={templatePdfRef}
                  mode="fullscreen"
                  templateOverride={templateBudgetOverride ?? templateBase}
                />
              </div>

              {showTemplateJsonEditor && (
                <div
                  style={{
                    width: "380px",
                    background: "var(--color-bg-card)",
                    border: "1px solid var(--color-border-subtle)",
                    borderRadius: "0.625rem",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "0.625rem 0.875rem",
                      borderBottom: "1px solid var(--color-border-subtle)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "var(--color-bg-subtle)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.625rem",
                        fontFamily: "monospace",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      template_budget.json
                    </span>
                    {templateJsonError && (
                      <span
                        style={{
                          fontSize: "0.5625rem",
                          color: "rgb(239, 68, 68)",
                        }}
                      >
                        {templateJsonError}
                      </span>
                    )}
                  </div>
                  <textarea
                    style={{
                      flex: 1,
                      width: "100%",
                      background: "var(--color-bg-elevated)",
                      fontSize: "0.625rem",
                      fontFamily: "monospace",
                      color: "rgb(52, 211, 153)",
                      padding: "0.875rem",
                      border: "none",
                      outline: "none",
                      resize: "none",
                      lineHeight: 1.6,
                    }}
                    value={
                      templateJsonText ?? JSON.stringify(templateBase, null, 2)
                    }
                    onChange={(e) => handleTemplateJsonChange(e.target.value)}
                    spellCheck={false}
                  />
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
      {/* Offscreen proposal previews for PDF export */}
      <div
        style={{
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
          visibility: "hidden",
          width: "1024px",
        }}
        aria-hidden="true"
      >
        {(["fast", "standard", "pro"] as Tier[]).map((tier) => (
          <div
            key={tier}
            ref={(el) => {
              proposalRefs.current[tier] = el;
            }}
            className="mb-8"
          >
            <ProposalPreview
              budget={buildTierBudget(budget, tier)}
              data={localizedData}
              labels={labels}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const itemsCount = (selections: BudgetSelectionState) => {
  return Object.keys(selections).reduce(
    (acc, key) => acc + selections[key].serviceIds.length,
    0
  );
};

export default App;
