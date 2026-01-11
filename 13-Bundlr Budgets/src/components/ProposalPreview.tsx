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
    <div
      style={{
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border-subtle)",
        borderRadius: "0.75rem",
        overflow: "hidden",
        minHeight: "500px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          background:
            "linear-gradient(135deg, var(--color-bg-elevated) 0%, var(--color-bg-subtle) 100%)",
          padding: "1.5rem",
          borderBottom: "1px solid var(--color-border-subtle)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "0.625rem",
                fontFamily: "monospace",
                color: "var(--color-text-tertiary)",
                marginBottom: "0.375rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {labels.proposalId}: {budget.id.slice(0, 8).toUpperCase()}
            </div>
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                marginBottom: "0.375rem",
                letterSpacing: "-0.02em",
              }}
            >
              {budget.projectName || "Untitled Project"}
            </h1>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--color-text-secondary)",
              }}
            >
              {labels.preparedFor}: {budget.clientName || "Valued Client"}
            </p>
          </div>
          <FileText
            size={28}
            style={{ color: "var(--color-accent-primary)", opacity: 0.3 }}
          />
        </div>
        {budget.notes && (
          <div
            style={{
              marginTop: "1rem",
              paddingTop: "1rem",
              borderTop: "1px solid var(--color-border-subtle)",
              fontSize: "0.8125rem",
              color: "var(--color-text-tertiary)",
              fontStyle: "italic",
            }}
          >
            "{budget.notes}"
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "1.5rem", flex: 1 }}>
        {isEmpty ? (
          <div
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-text-tertiary)",
            }}
          >
            <Layers
              size={48}
              style={{ marginBottom: "0.75rem", opacity: 0.3 }}
            />
            <p style={{ fontSize: "0.8125rem" }}>{labels.selectServices}</p>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
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
                    style={{
                      paddingBottom: "1.25rem",
                      borderBottom: "1px solid var(--color-border-subtle)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.625rem",
                        marginBottom: "0.75rem",
                      }}
                    >
                      <h2
                        style={{
                          fontSize: "0.9375rem",
                          fontWeight: 600,
                          color: "var(--color-text-primary)",
                        }}
                      >
                        {cat.label}
                      </h2>
                      <span
                        style={{
                          padding: "0.125rem 0.5rem",
                          borderRadius: "0.25rem",
                          fontSize: "0.5625rem",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          background: "rgba(99, 102, 241, 0.1)",
                          color: "var(--color-accent-primary)",
                        }}
                      >
                        {tierLabel} Tier
                      </span>
                    </div>

                    {/* Tier Scope Box */}
                    <div
                      style={{
                        background: "var(--color-bg-subtle)",
                        borderRadius: "0.5rem",
                        padding: "0.875rem",
                        marginBottom: "0.875rem",
                        border: "1px solid var(--color-border-subtle)",
                      }}
                    >
                      <h4
                        style={{
                          fontSize: "0.5625rem",
                          fontWeight: 600,
                          color: "var(--color-text-tertiary)",
                          marginBottom: "0.375rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {labels.scopeDefinition}
                      </h4>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--color-text-secondary)",
                          lineHeight: 1.5,
                          whiteSpace: "pre-line",
                        }}
                      >
                        {tierDef?.description}
                      </p>
                    </div>

                    {/* Service List */}
                    <div>
                      <h4
                        style={{
                          fontSize: "0.5625rem",
                          fontWeight: 600,
                          color: "var(--color-text-tertiary)",
                          marginBottom: "0.5rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {labels.includedServices}
                      </h4>
                      <ul
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.5rem",
                        }}
                      >
                        {group.services.map((s) => {
                          const pricing = computeServicePricing(s, group.tier);
                          if (pricing) {
                            categoryHoursTotal += pricing.hours;
                            categoryPriceTotal += pricing.price;
                          }

                          return (
                            <li
                              key={s.id}
                              style={{
                                display: "flex",
                                gap: "0.5rem",
                                listStyle: "none",
                              }}
                            >
                              <CheckCircle2
                                size={16}
                                style={{
                                  color: "rgb(16, 185, 129)",
                                  flexShrink: 0,
                                  marginTop: "0.125rem",
                                }}
                              />
                              <div>
                                <span
                                  style={{
                                    fontWeight: 600,
                                    color: "var(--color-text-primary)",
                                    fontSize: "0.8125rem",
                                    display: "block",
                                  }}
                                >
                                  {s.label}
                                </span>
                                <span
                                  style={{
                                    fontSize: "0.6875rem",
                                    color: "var(--color-text-tertiary)",
                                  }}
                                >
                                  {s.description}
                                </span>
                                {pricing && (
                                  <div
                                    style={{
                                      marginTop: "0.25rem",
                                      display: "flex",
                                      gap: "0.375rem",
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontSize: "0.5625rem",
                                        background: "var(--color-bg-subtle)",
                                        color: "var(--color-text-tertiary)",
                                        padding: "0.125rem 0.375rem",
                                        borderRadius: "0.25rem",
                                      }}
                                    >
                                      {labels.effortLabel}:{" "}
                                      {formatHours(pricing.hours)}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: "0.5625rem",
                                        background: "var(--color-bg-subtle)",
                                        color: "var(--color-text-tertiary)",
                                        padding: "0.125rem 0.375rem",
                                        borderRadius: "0.25rem",
                                      }}
                                    >
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
                        <div
                          style={{
                            marginTop: "0.75rem",
                            textAlign: "right",
                            fontSize: "0.75rem",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          <div>
                            {labels.categoryEffortTotal}:{" "}
                            {formatHours(categoryHoursTotal)}
                          </div>
                          <div>
                            {labels.categoryPriceTotal}:{" "}
                            {formatCurrency(categoryPriceTotal)}
                          </div>
                        </div>
                      )}

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

                  <div
                    style={{
                      textAlign: "center",
                      fontSize: "0.625rem",
                      color: "var(--color-text-tertiary)",
                      fontFamily: "monospace",
                    }}
                  >
                    IBAN: PT50003502100002261490090 • NIF: 231798423
                  </div>

                  {grandTotalPrice > 0 && (
                    <div
                      style={{
                        paddingTop: "1rem",
                        borderTop: "1px solid var(--color-border-subtle)",
                        textAlign: "right",
                        fontSize: "0.8125rem",
                        color: "var(--color-text-primary)",
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>
                        {labels.totalEffort}: {formatHours(grandTotalHours)}
                      </div>
                      <div style={{ fontWeight: 600 }}>
                        {labels.totalPrice}: {formatCurrency(firstPayment)}
                      </div>
                      <div style={{ fontWeight: 600 }}>
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
      <div
        style={{
          background: "var(--color-bg-subtle)",
          padding: "1rem",
          textAlign: "center",
          fontSize: "0.625rem",
          color: "var(--color-text-tertiary)",
          borderTop: "1px solid var(--color-border-subtle)",
        }}
      >
        {labels.generatedBy}
      </div>
    </div>
  );
};
