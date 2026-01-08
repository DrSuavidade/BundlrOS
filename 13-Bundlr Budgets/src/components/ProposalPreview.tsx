import React from "react";
import {
  Budget,
  Category,
  Tier,
  AtomicService,
  TierDefinition,
} from "../types";
import { FileText, CheckCircle2, Layers } from "lucide-react";
import { computeServicePricing } from "../utils/pricing";

interface ProposalPreviewProps {
  budget: Budget;
  data: {
    CATEGORIES: { id: Category; label: string; color: string }[];
    TIERS: { id: Tier; label: string }[];
    TIER_DEFINITIONS: TierDefinition[];
    ATOMIC_SERVICES: AtomicService[];
  };
  labels: any;
}

const formatCurrency = (value: number) => `€ ${value.toFixed(2)}`;
const formatHours = (value: number) => `${value.toFixed(1)}h`;

export const ProposalPreview: React.FC<ProposalPreviewProps> = ({
  budget,
  data,
  labels,
}) => {
  const { CATEGORIES, TIERS, TIER_DEFINITIONS, ATOMIC_SERVICES } = data;

  const groupedItems = budget.items.reduce((acc, item) => {
    const service = ATOMIC_SERVICES.find((s) => s.id === item.serviceId);
    if (!service) return acc;
    if (!acc[service.category]) {
      acc[service.category] = { tier: item.tier, services: [] };
    }
    acc[service.category].services.push(service);
    return acc;
  }, {} as Record<Category, { tier: Tier; services: typeof ATOMIC_SERVICES }>);

  const isEmpty = budget.items.length === 0;

  return (
    <div className="bg-white dark:bg-slate-800 shadow-xl rounded-xl overflow-hidden min-h-[600px] border border-slate-200 dark:border-slate-700 flex flex-col transition-colors">
      {/* Header */}
      <div className="bg-slate-800 dark:bg-slate-900 text-white p-8">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs font-mono opacity-50 mb-2">
              {labels.proposalId}: {budget.id.slice(0, 8).toUpperCase()}
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {budget.projectName || "Untitled Project"}
            </h1>
            <p className="text-lg opacity-80">
              {labels.preparedFor}: {budget.clientName || "Valued Client"}
            </p>
          </div>
          <FileText className="w-10 h-10 opacity-20" />
        </div>
        {budget.notes && (
          <div className="mt-6 pt-6 border-t border-slate-700 text-sm opacity-70 italic">
            "{budget.notes}"
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-8 flex-1">
        {isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
            <Layers className="w-16 h-16 mb-4 opacity-20" />
            <p>{labels.selectServices}</p>
          </div>
        ) : (
          <div className="space-y-10">
            {(() => {
              let grandTotalHours = 0;
              let grandTotalPrice = 0;
              let firstPayment = 0;
              let firstMonth = 0;

              const blocks = CATEGORIES.map((cat) => {
                const group = groupedItems[cat.id];
                if (!group) return null;

                const tierDef = TIER_DEFINITIONS.find(
                  (t) => t.category === cat.id && t.tier === group.tier
                );
                const tierLabel = TIERS.find((t) => t.id === group.tier)?.label;

                let categoryHoursTotal = 0;
                let categoryPriceTotal = 0;

                return (
                  <div
                    key={cat.id}
                    className="border-b border-slate-100 dark:border-slate-700 pb-8 last:border-0 last:pb-0"
                  >
                    <div className="flex items-baseline gap-3 mb-4">
                      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                        {cat.label}
                      </h2>
                      <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {tierLabel} Tier
                      </span>
                    </div>

                    {/* Tier Scope Box */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-5 mb-6 border border-slate-100 dark:border-slate-700">
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase text-xs tracking-wider">
                        {labels.scopeDefinition}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed">
                        {tierDef?.description}
                      </p>
                    </div>

                    {/* Service List */}
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase text-xs tracking-wider">
                        {labels.includedServices}
                      </h4>
                      <ul className="grid grid-cols-1 gap-3">
                        {group.services.map((s) => {
                          const pricing = computeServicePricing(s, group.tier);
                          if (pricing) {
                            categoryHoursTotal += pricing.hours;
                            categoryPriceTotal += pricing.price;
                          }

                          return (
                            <li key={s.id} className="flex gap-3">
                              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                              <div>
                                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                                  {s.label}
                                </span>
                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                  {s.description}
                                </span>
                                {pricing && (
                                  <div className="mt-1 flex gap-2">
                                    <span className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 px-1.5 rounded">
                                      {labels.effortLabel}:{" "}
                                      {formatHours(pricing.hours)}
                                    </span>
                                    <span className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 px-1.5 rounded">
                                      {labels.priceLabel}:{" "}
                                      {formatCurrency(pricing.price)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>

                      {(categoryHoursTotal > 0 || categoryPriceTotal > 0) && (
                        <div className="mt-4 flex justify-end text-sm text-slate-600 dark:text-slate-300">
                          <div className="inline-flex flex-col items-end">
                            <span>
                              {labels.categoryEffortTotal}:{" "}
                              {formatHours(categoryHoursTotal)}
                            </span>
                            <span>
                              {labels.categoryPriceTotal}:{" "}
                              {formatCurrency(categoryPriceTotal)}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* accumulate grand totals */}
                      {(() => {
                        grandTotalHours += categoryHoursTotal;
                        grandTotalPrice += categoryPriceTotal;
                        firstPayment += categoryPriceTotal * 0.5;
                        firstMonth += categoryPriceTotal / 36;
                        return null;
                      })()}
                    </div>
                  </div>
                );
              });

              return (
                <>
                  {blocks}

                  {/* IBAN line between category subtotal and totals */}
                  <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                    IBAN: PT50003502100002261490090  •  NIF: 231798423 
                  </div>

                  {grandTotalPrice > 0 && (
                    <div className="mt-4 pt-6 border-t border-slate-200 dark:border-slate-700 text-right text-sm text-slate-700 dark:text-slate-200">
                      <div className="font-semibold">
                        {labels.totalEffort}: {formatHours(grandTotalHours)}
                      </div>
                      <div className="font-semibold">
                        {labels.totalPrice}: {formatCurrency(firstPayment)}
                      </div>
                      <div className="font-semibold">
                        {labels.totalMonth}: {formatCurrency(firstMonth)}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-slate-50 dark:bg-slate-900/30 p-8 text-center text-xs text-slate-400 border-t dark:border-t-slate-700">
        {labels.generatedBy}
      </div>
    </div>
  );
};
