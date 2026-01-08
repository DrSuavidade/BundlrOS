// src/components/TemplatePreview.tsx
import React from "react";
import { Budget, Tier, AtomicService, TemplateBudgetOutput, BudgetSelectionState } from "../types";
import { getLocalizedData } from "../constants/constants";
import { computeServicePricing } from "../utils/pricing";

interface TemplatePreviewProps {
  budget: Budget;
  exportRef?: React.Ref<HTMLDivElement>;
  mode?: "normal" | "fullscreen";
  templateOverride?: TemplateBudgetOutput;
}

const BundlrLogo = ({ className = "w-80 h-8" }: { className?: string }) => (
  <img src="./src/public/favicon-black.ico" alt="Bundlr logo" className={className} />
);

const formatCurrency = (value: number) => `${value.toFixed(2)} €`;

const tierTitles: Record<Tier, string> = {
  fast: "Bundlr Fast",
  standard: "Bundlr Standard",
  pro: "Bundlr Pro",
};

const tierAccentClasses: Record<Tier, string> = {
  fast: "border-pink-100 text-pink-600",
  standard: "border-sky-100 text-sky-600",
  pro: "border-indigo-100 text-indigo-600",
};

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  budget,
  exportRef,
  mode = "normal",
  templateOverride,
}) => {
  const { ATOMIC_SERVICES } = getLocalizedData("pt");
  const isFullscreen = mode === "fullscreen";

  const serviceMap: Record<string, AtomicService> = {};
  ATOMIC_SERVICES.forEach((s) => {
    serviceMap[s.id] = s;
  });

  // 1) Collect all selected service IDs (ignore which tier they were picked in)
  const selectedServiceIds = new Set<string>();

  if (budget._meta) {
    const meta = budget._meta as BudgetSelectionState;
    Object.values(meta).forEach((entry) => {
      entry.serviceIds.forEach((id) => selectedServiceIds.add(id));
    });
  } else {
    budget.items.forEach((item) => selectedServiceIds.add(item.serviceId));
  }

  // 2) Build tier → list of copy strings
  const servicesByTier: Record<Tier, string[]> = {
    fast: [],
    standard: [],
    pro: [],
  };

  const tiers: Tier[] = ["fast", "standard", "pro"];

  selectedServiceIds.forEach((serviceId) => {
    const svc = serviceMap[serviceId];
    if (!svc) return;

    tiers.forEach((tier) => {
      const text = svc.tierDescriptions?.[tier] ?? svc.label;
      if (!servicesByTier[tier].includes(text)) {
        servicesByTier[tier].push(text);
      }
    });
  });

  let templateBudget: TemplateBudgetOutput;

  if (templateOverride) {
    // Use the JSON coming from the side panel
    templateBudget = templateOverride;
  } else {
    // Fallback: compute from budget (existing behaviour)
    const plans = tiers.map((tier) => {
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

    templateBudget = {
      id: budget.id,
      clientName: budget.clientName,
      projectName: budget.projectName,
      notes: budget.notes,
      plans,
    };
  }

  const MAINTENANCE_MONTHS = 36;
  const MAINTENANCE_YEAR = 11;

  const getMonthlyMaintenance = (totalPrice: number) =>
    totalPrice / MAINTENANCE_MONTHS;

  const getAnualMaintenance = (totalPrice: number) =>
    (totalPrice / MAINTENANCE_MONTHS) * MAINTENANCE_YEAR;

  const getPlan = (tier: Tier) =>
    templateBudget.plans.find((p) => p.tier === tier)!;

  const today = new Date().toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className={`w-full flex justify-center ${
        isFullscreen ? "h-full items-center" : ""
      }`}
    >
      <div
        ref={exportRef}
        className={`
        bg-slate-50 dark:bg-slate-900
        rounded-2xl shadow-xl
        border border-slate-200 dark:border-slate-700
        p-8 flex flex-col
        aspect-[3508/2480]   /* A4 landscape ratio */
        ${
          isFullscreen ? " h-full w-auto max-h-full" : " w-full max-w-[1200px]"
        }`}
      >
        {/* Header (logo + company info) */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-3">
            <BundlrLogo className="w-40 h-8" />
          </div>
          <div className="text-right text-xs text-slate-500">
            <div>Viseu</div>
            <div>Grupo de Design e Soluções Informáticas</div>
          </div>
        </div>

        {/* 3 Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
          {tiers.map((tier) => {
            const plan = getPlan(tier);

            // Example: you can change these formulas later.
            const monthlyPrice = getMonthlyMaintenance(plan.totalPrice);
            const anualPrice = getAnualMaintenance(plan.totalPrice);
            const installment = plan.totalPrice / 2;

            const includeTitle =
              tier === "fast" ? "Inclui" : "Extras deste plano";

            return (
              <div
                key={tier}
                className="plan-card bg-white dark:bg-slate-950 rounded-2xl shadow-md border border-slate-100 dark:border-slate-800 px-6 py-8 flex flex-col items-center text-center"
              >
                {/* Plan title */}
                <div
                  className={`text-lg md:text-3xl font-semibold mb-2 ${tierAccentClasses[tier]}`}
                >
                  {tierTitles[tier]}
                </div>

                {/* Price (monthly + ou + anual) */}
                <div className="mt-4 mb-6">
                  <div className="flex flex-col items-center gap-1">
                    {/* monthly */}
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                        {formatCurrency(monthlyPrice)}
                      </span>
                      <span className="text-base text-slate-500">/mês</span>
                    </div>

                    {/* almost glued to prices */}
                    <span className="text-[10px] font-semibold text-slate-400 leading-none my-[2px]">
                      ou
                    </span>

                    {/* anual */}
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                        {formatCurrency(anualPrice)}
                      </span>
                      <span className="text-base text-slate-500">/ano</span>
                    </div>
                  </div>
                </div>


                {/* Setup / total using JSON fields */}
                <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 w-full">
                  {/* Pagamento Inicial + Conclusão side by side */}
                  <div className="grid grid-cols-3 w-full">
                    <div className="text-center">
                      <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                        Entrada
                      </div>
                      <div className="font-medium">
                        {formatCurrency(installment)}
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center pb-1">
                      <span className="text-slate-300 text-lg font-semibold leading-none">
                        +
                      </span>
                    </div>
                    <div className="text-center">
                      <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                        Conclusão
                      </div>
                      <div className="font-medium">
                        {formatCurrency(installment)}
                      </div>
                    </div>
                  </div>

                  {/* Inclui / Extras deste plano */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs w-full">
                    <div className="font-semibold mb-1">{includeTitle}</div>
                    {servicesByTier[tier].length > 0 && (
                      <ul className="list-disc list-inside pl-4  space-y-1 text-slate-500 dark:text-slate-400">
                        {servicesByTier[tier].map((name) => (
                          <li key={name}>{name}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>


                {/* Footer (Prazo / extra info) */}
                <div className="mt-auto pt-6 text-xs text-slate-500 dark:text-slate-400">
                  <div className="font-semibold mb-1">Prazo</div>
                  <div>
                    Conclusão em cerca de {Math.round(plan.totalHours / 3)} dias
                    úteis
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 mb-6">
                    Horas estimadas: {plan.totalHours.toFixed(1)}h
                  </div>
                  <div className="font-semibold mb-1">Clique para Prosseguir</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Date */}
        <div className="mt-8 text-xs text-slate-500">{today}</div>
      </div>
    </div>
  );
};
