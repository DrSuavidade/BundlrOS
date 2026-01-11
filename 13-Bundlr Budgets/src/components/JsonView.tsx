import React from "react";
import { Budget, Tier, AtomicService, TemplateBudgetOutput } from "../types";
import { getLocalizedData } from "../constants/constants";
import { computeServicePricing } from "../utils/pricing";
import { Copy } from "lucide-react";

interface JsonViewProps {
  budget: Budget;
}

export const JsonView: React.FC<JsonViewProps> = ({ budget }) => {
  const { ATOMIC_SERVICES } = getLocalizedData("en");

  const serviceMap: Record<string, AtomicService> = {};
  ATOMIC_SERVICES.forEach((s) => {
    serviceMap[s.id] = s;
  });

  const tiers: Tier[] = ["fast", "standard", "pro"];

  const budgetSpec = {
    id: budget.id,
    clientName: budget.clientName,
    projectName: budget.projectName,
    notes: budget.notes,
    items: budget.items,
  };

  const tierBudgets: Record<Tier, Budget> = tiers.reduce((acc, tier) => {
    acc[tier] = {
      id: `${budget.id}-${tier}`,
      clientName: budget.clientName,
      projectName: budget.projectName,
      notes: budget.notes,
      items: budget.items.map((item) => ({
        serviceId: item.serviceId,
        tier,
      })),
    };
    return acc;
  }, {} as Record<Tier, Budget>);

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

  const output = {
    budget_spec: budgetSpec,
    tier_budgets: tierBudgets,
    template_budget: templateBudget,
  };

  return (
    <div
      style={{
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border-subtle)",
        borderRadius: "0.75rem",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "0.75rem 1rem",
          borderBottom: "1px solid var(--color-border-subtle)",
          background: "var(--color-bg-subtle)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "0.6875rem",
            fontFamily: "monospace",
            color: "var(--color-text-secondary)",
          }}
        >
          budget_output.json
        </span>
        <button
          onClick={() =>
            navigator.clipboard.writeText(JSON.stringify(output, null, 2))
          }
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.375rem",
            padding: "0.375rem 0.625rem",
            background: "var(--color-bg-card)",
            border: "1px solid var(--color-border-subtle)",
            borderRadius: "0.375rem",
            color: "var(--color-accent-primary)",
            fontSize: "0.5625rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          <Copy size={10} />
          Copy JSON
        </button>
      </div>

      {/* Code Content */}
      <pre
        style={{
          padding: "1rem",
          margin: 0,
          fontSize: "0.6875rem",
          fontFamily: "monospace",
          color: "rgb(52, 211, 153)",
          background: "var(--color-bg-elevated)",
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {JSON.stringify(output, null, 2)}
      </pre>
    </div>
  );
};
