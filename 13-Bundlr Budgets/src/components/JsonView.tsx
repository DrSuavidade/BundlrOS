import React from 'react';
import { Budget, Tier, AtomicService, TemplateBudgetOutput } from '../types';
import { getLocalizedData } from '../constants/constants';
import { computeServicePricing } from '../utils/pricing';

interface JsonViewProps {
  budget: Budget;
}

export const JsonView: React.FC<JsonViewProps> = ({ budget }) => {
  // We only need category + service id here, so language doesn't really matter.
  const { ATOMIC_SERVICES } = getLocalizedData('en');

  const serviceMap: Record<string, AtomicService> = {};
  ATOMIC_SERVICES.forEach((s) => {
    serviceMap[s.id] = s;
  });

  const tiers: Tier[] = ['fast', 'standard', 'pro'];

  // 1) Main budget_spec (what you already had, minus _meta)
  const budgetSpec = {
    id: budget.id,
    clientName: budget.clientName,
    projectName: budget.projectName,
    notes: budget.notes,
    items: budget.items,
  };

  // 2) Three concrete budgets: one for each tier
  const tierBudgets: Record<Tier, Budget> = tiers.reduce((acc, tier) => {
    acc[tier] = {
      id: `${budget.id}-${tier}`,
      clientName: budget.clientName,
      projectName: budget.projectName,
      notes: budget.notes,
      // same services, but explicitly priced as this tier
      items: budget.items.map((item) => ({
        serviceId: item.serviceId,
        tier,
      })),
    };
    return acc;
  }, {} as Record<Tier, Budget>);

  // 3) Template budget summary for the three bundles (Fast / Standard / Pro)
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

  const templateBudget: TemplateBudgetOutput = {
    id: budget.id,
    clientName: budget.clientName,
    projectName: budget.projectName,
    notes: budget.notes,
    plans: planSummaries,
  };

  // Final output object: old spec + new multi-bundle data
  const output = {
    budget_spec: budgetSpec,
    tier_budgets: tierBudgets,
    template_budget: templateBudget,
  };

  return (
    <div className="bg-slate-900 rounded-xl shadow-xl overflow-hidden flex flex-col h-[600px] border border-slate-700">
      <div className="bg-black/30 p-4 border-b border-white/10 flex justify-between items-center">
        <span className="text-slate-400 font-mono text-xs">budget_output.json</span>
        <button
          onClick={() => navigator.clipboard.writeText(JSON.stringify(output, null, 2))}
          className="text-xs text-blue-400 hover:text-blue-300"
        >
          Copy JSON
        </button>
      </div>
      <pre className="p-6 text-xs md:text-sm font-mono text-green-400 overflow-auto flex-1">
        {JSON.stringify(output, null, 2)}
      </pre>
    </div>
  );
};
