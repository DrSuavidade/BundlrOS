// src/components/TemplatePreview.tsx
import React from "react";
import {
  Budget,
  Tier,
  AtomicService,
  TemplateBudgetOutput,
  BudgetSelectionState,
} from "../types";
import { getLocalizedData } from "../constants/constants";
import { computeServicePricing } from "../utils/pricing";

interface TemplatePreviewProps {
  budget: Budget;
  exportRef?: React.Ref<HTMLDivElement>;
  mode?: "normal" | "fullscreen";
  templateOverride?: TemplateBudgetOutput;
}

const formatCurrency = (value: number) => `${value.toFixed(2)} €`;

const tierTitles: Record<Tier, string> = {
  fast: "Bundlr Fast",
  standard: "Bundlr Standard",
  pro: "Bundlr Pro",
};

const tierColors: Record<Tier, { bg: string; text: string; border: string }> = {
  fast: {
    bg: "rgba(236, 72, 153, 0.1)",
    text: "rgb(236, 72, 153)",
    border: "rgba(236, 72, 153, 0.2)",
  },
  standard: {
    bg: "rgba(14, 165, 233, 0.1)",
    text: "rgb(14, 165, 233)",
    border: "rgba(14, 165, 233, 0.2)",
  },
  pro: {
    bg: "rgba(99, 102, 241, 0.1)",
    text: "rgb(99, 102, 241)",
    border: "rgba(99, 102, 241, 0.2)",
  },
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

  // Collect all selected service IDs
  const selectedServiceIds = new Set<string>();

  if (budget._meta) {
    const meta = budget._meta as BudgetSelectionState;
    Object.values(meta).forEach((entry) => {
      entry.serviceIds.forEach((id) => selectedServiceIds.add(id));
    });
  } else {
    budget.items.forEach((item) => selectedServiceIds.add(item.serviceId));
  }

  // Build tier → list of copy strings
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
    templateBudget = templateOverride;
  } else {
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

      return { tier, totalHours, totalPrice };
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
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        ...(isFullscreen && { height: "100%", alignItems: "center" }),
      }}
    >
      <div
        ref={exportRef}
        style={{
          background: "var(--color-bg-card)",
          borderRadius: "0.75rem",
          border: "1px solid var(--color-border-subtle)",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          ...(isFullscreen
            ? { height: "100%", width: "auto", maxHeight: "100%" }
            : { width: "100%" }),
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "1.25rem",
            paddingBottom: "1rem",
            borderBottom: "1px solid var(--color-border-subtle)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                background: "var(--color-accent-primary)",
                borderRadius: "0.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 700,
                fontSize: "0.875rem",
              }}
            >
              B
            </div>
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--color-text-primary)",
              }}
            >
              Bundlr
            </span>
          </div>
          <div
            style={{
              textAlign: "right",
              fontSize: "0.625rem",
              color: "var(--color-text-tertiary)",
            }}
          >
            <div>Viseu</div>
            <div>Grupo de Design e Soluções Informáticas</div>
          </div>
        </div>

        {/* Client Info */}
        {(budget.projectName || budget.clientName) && (
          <div style={{ marginBottom: "1rem" }}>
            <div
              style={{
                fontSize: "0.625rem",
                color: "var(--color-text-tertiary)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "0.25rem",
              }}
            >
              Proposta para
            </div>
            <div
              style={{
                fontSize: "1rem",
                fontWeight: 600,
                color: "var(--color-text-primary)",
              }}
            >
              {budget.projectName || budget.clientName || "Cliente"}
            </div>
          </div>
        )}

        {/* 3 Plans Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "0.75rem",
            flex: 1,
          }}
        >
          {tiers.map((tier) => {
            const plan = getPlan(tier);
            const colors = tierColors[tier];
            const monthlyPrice = getMonthlyMaintenance(plan.totalPrice);
            const anualPrice = getAnualMaintenance(plan.totalPrice);
            const installment = plan.totalPrice / 2;
            const includeTitle =
              tier === "fast" ? "Inclui" : "Extras deste plano";

            return (
              <div
                key={tier}
                style={{
                  background: "var(--color-bg-subtle)",
                  borderRadius: "0.625rem",
                  border: "1px solid var(--color-border-subtle)",
                  padding: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  textAlign: "center",
                }}
              >
                {/* Plan title */}
                <div
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: colors.text,
                    marginBottom: "0.75rem",
                  }}
                >
                  {tierTitles[tier]}
                </div>

                {/* Price */}
                <div style={{ marginBottom: "0.875rem" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "center",
                      gap: "0.25rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {formatCurrency(monthlyPrice)}
                    </span>
                    <span
                      style={{
                        fontSize: "0.6875rem",
                        color: "var(--color-text-tertiary)",
                      }}
                    >
                      /mês
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "0.5625rem",
                      color: "var(--color-text-tertiary)",
                      margin: "0.25rem 0",
                    }}
                  >
                    ou
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "center",
                      gap: "0.25rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "1rem",
                        fontWeight: 600,
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {formatCurrency(anualPrice)}
                    </span>
                    <span
                      style={{
                        fontSize: "0.625rem",
                        color: "var(--color-text-tertiary)",
                      }}
                    >
                      /ano
                    </span>
                  </div>
                </div>

                {/* Payment split */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto 1fr",
                    gap: "0.5rem",
                    alignItems: "center",
                    paddingBottom: "0.75rem",
                    borderBottom: "1px solid var(--color-border-subtle)",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "0.5rem",
                        color: "var(--color-text-tertiary)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: "0.125rem",
                      }}
                    >
                      Entrada
                    </div>
                    <div
                      style={{
                        fontSize: "0.6875rem",
                        fontWeight: 600,
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {formatCurrency(installment)}
                    </div>
                  </div>
                  <span
                    style={{
                      color: "var(--color-text-tertiary)",
                      fontSize: "0.875rem",
                    }}
                  >
                    +
                  </span>
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "0.5rem",
                        color: "var(--color-text-tertiary)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: "0.125rem",
                      }}
                    >
                      Conclusão
                    </div>
                    <div
                      style={{
                        fontSize: "0.6875rem",
                        fontWeight: 600,
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {formatCurrency(installment)}
                    </div>
                  </div>
                </div>

                {/* Includes */}
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div
                    style={{
                      fontSize: "0.5625rem",
                      fontWeight: 600,
                      color: "var(--color-text-secondary)",
                      marginBottom: "0.375rem",
                    }}
                  >
                    {includeTitle}
                  </div>
                  {servicesByTier[tier].length > 0 && (
                    <ul
                      style={{
                        listStyle: "disc",
                        paddingLeft: "1rem",
                        margin: 0,
                        fontSize: "0.5625rem",
                        color: "var(--color-text-tertiary)",
                        lineHeight: 1.6,
                      }}
                    >
                      {servicesByTier[tier].map((name) => (
                        <li key={name}>{name}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Footer */}
                <div
                  style={{
                    marginTop: "auto",
                    paddingTop: "0.75rem",
                    borderTop: "1px solid var(--color-border-subtle)",
                    fontSize: "0.5rem",
                    color: "var(--color-text-tertiary)",
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      color: "var(--color-text-secondary)",
                      marginBottom: "0.125rem",
                    }}
                  >
                    Prazo
                  </div>
                  <div>
                    Conclusão em cerca de {Math.round(plan.totalHours / 3)} dias
                    úteis
                  </div>
                  <div>Horas estimadas: {plan.totalHours.toFixed(1)}h</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: "1rem",
            paddingTop: "0.75rem",
            borderTop: "1px solid var(--color-border-subtle)",
            fontSize: "0.5625rem",
            color: "var(--color-text-tertiary)",
            textAlign: "center",
          }}
        >
          Gerado por Bundlr • {today}
        </div>
      </div>
    </div>
  );
};
