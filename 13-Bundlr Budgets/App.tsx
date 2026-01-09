import React, { useState, useMemo, useEffect, useRef } from "react";
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

import { AppShell, Button } from "@bundlros/ui";

const App: React.FC = () => {
  // Config State
  const [lang, setLang] = useState<"en" | "pt">("pt");
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark for BundlrOS
  const [showOptions, setShowOptions] = useState(false);

  // ... (rest of the state remains same)
  // App State
  const [clientName, setClientName] = useState("");
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
    <div className="h-full flex flex-col">
      {/* Module Sub-Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
            Proposal Builder
          </h1>
          <p className="text-xs text-[var(--color-text-tertiary)] font-medium">
            {selectedCount} {labels.servicesSelected}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLang(lang === "en" ? "pt" : "en")}
          >
            <Languages size={14} className="mr-2" />
            {lang.toUpperCase()}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowOptions(!showOptions)}
          >
            <Settings size={14} />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Builder */}
        <div className="lg:col-span-5 space-y-6 overflow-y-auto h-full pb-20">
          <ClientForm
            clientName={clientName}
            projectName={projectName}
            notes={notes}
            onChange={handleClientUpdate}
            labels={labels}
          />

          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
              {labels.serviceBuilder}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--color-text-tertiary)]">
                {labels.presetLabel}
              </span>
              <select
                className="form-select text-xs"
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
        <div className="lg:col-span-7 flex flex-col sticky top-24 h-[calc(100vh-8rem)]">
          {/* Preview Toggle */}
          <div className="flex gap-2 mb-4 bg-[var(--color-bg-subtle)] p-1 rounded-lg self-start border border-[var(--color-border-subtle)]">
            <button
              onClick={() => setActiveTab("proposal")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "proposal"
                  ? "bg-[var(--color-bg-elevated)] text-[var(--color-accent-primary)] shadow-sm"
                  : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <Layout size={16} />
              {labels.proposalView}
            </button>
            <button
              onClick={() => setActiveTab("json")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "json"
                  ? "bg-[var(--color-bg-elevated)] text-[var(--color-accent-primary)] shadow-sm"
                  : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <Code size={16} />
              {labels.jsonSpec}
            </button>
            <button
              onClick={() => setActiveTab("template")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "template"
                  ? "bg-[var(--color-bg-elevated)] text-[var(--color-accent-primary)] shadow-sm"
                  : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <FileText size={16} />
              {labels.templateView ?? "Template"}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 pb-10">
            {activeTab === "proposal" && (
              <ProposalPreview
                budget={budget}
                data={localizedData}
                labels={labels}
              />
            )}

            {activeTab === "json" && <JsonView budget={budget} />}

            {activeTab === "template" && (
              <div className="relative h-full">
                <button
                  type="button"
                  onClick={() => setIsTemplateFullscreen(true)}
                  className="absolute right-4 top-2 z-10 inline-flex items-center gap-1 rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] px-2 py-1 text-xs font-medium text-[var(--color-text-secondary)] shadow-sm hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)] transition-all"
                >
                  <Maximize2 size={14} />
                  <span className="hidden sm:inline">Maximizar</span>
                </button>

                <TemplatePreview budget={budget} />
              </div>
            )}
          </div>
        </div>
      </main>
      {isTemplateFullscreen && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex flex-col">
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3 text-[var(--color-text-primary)] border-b border-[var(--color-border-subtle)]">
            <div className="flex items-center gap-2">
              <FileText size={18} />
              <span className="text-sm font-medium">
                {labels.templateView ?? "Template de Preço"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowTemplateJsonEditor((prev) => !prev)}
                className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border-subtle)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--color-bg-elevated)] transition-all"
              >
                <Code size={14} />
                <span>
                  {showTemplateJsonEditor ? "Fechar JSON" : "Ver JSON"}
                </span>
              </button>

              <button
                type="button"
                onClick={handleDownloadTemplatePdf}
                className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border-subtle)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--color-bg-elevated)] transition-all"
              >
                <span>Download PDF</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsTemplateFullscreen(false);
                  setShowTemplateJsonEditor(false);
                }}
                className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border-subtle)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--color-bg-elevated)] transition-all"
              >
                <X size={14} />
                <span>Voltar</span>
              </button>
            </div>
          </div>

          {/* Content: template + optional side JSON editor */}
          <div className="flex-1 p-4 flex gap-4 overflow-hidden">
            <div className="flex-1 flex justify-center items-center overflow-hidden">
              <TemplatePreview
                budget={budget}
                exportRef={templatePdfRef}
                mode="fullscreen"
                templateOverride={templateBudgetOverride ?? templateBase}
              />
            </div>

            {showTemplateJsonEditor && (
              <div className="w-[420px] bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl flex flex-col overflow-hidden">
                <div className="px-3 py-2 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
                  <span className="text-xs font-mono text-[var(--color-text-secondary)]">
                    template_budget.json
                  </span>
                  {templateJsonError && (
                    <span className="text-[10px] text-[var(--color-status-danger)]">
                      {templateJsonError}
                    </span>
                  )}
                </div>
                <textarea
                  className="flex-1 w-full bg-transparent text-[11px] font-mono text-[var(--color-text-primary)] p-3 outline-none resize-none"
                  value={
                    templateJsonText ?? JSON.stringify(templateBase, null, 2)
                  }
                  onChange={(e) => handleTemplateJsonChange(e.target.value)}
                  spellCheck={false}
                />
              </div>
            )}
          </div>
        </div>
      )}
      {/* Offscreen proposal previews for PDF export */}
      <div className="fixed -left-[2000px] top-0 w-[1024px] pointer-events-none select-none">
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
