import React from "react";
import {
  Category,
  Tier,
  BudgetSelectionState,
  AtomicService,
  TierDefinition,
} from "../types";
import { Check, Info } from "lucide-react";
import styles from "../../App.module.css";

interface CategoryBuilderProps {
  selections: BudgetSelectionState;
  onUpdate: (
    category: Category,
    tier: Tier | undefined,
    serviceId: string | undefined
  ) => void;
  data: {
    CATEGORIES: { id: Category; label: string; color: string }[];
    TIERS: { id: Tier; label: string }[];
    TIER_DEFINITIONS: TierDefinition[];
    ATOMIC_SERVICES: AtomicService[];
  };
  labels: any;
}

export const CategoryBuilder: React.FC<CategoryBuilderProps> = ({
  selections,
  onUpdate,
  data,
  labels,
}) => {
  const { CATEGORIES, TIERS, TIER_DEFINITIONS, ATOMIC_SERVICES } = data;

  const getTierDescription = (cat: Category, tier: Tier) => {
    return (
      TIER_DEFINITIONS.find((td) => td.category === cat && td.tier === tier)
        ?.description || ""
    );
  };

  return (
    <div>
      {CATEGORIES.map((category) => {
        const categoryServices = ATOMIC_SERVICES.filter(
          (s) => s.category === category.id
        );
        const currentSelection = selections[category.id];
        const isActive =
          currentSelection && currentSelection.serviceIds.length > 0;
        const currentTier = currentSelection?.tier || "standard";

        return (
          <div
            key={category.id}
            className={`${styles.categoryCard} ${
              isActive ? styles.active : ""
            }`}
          >
            {/* Header */}
            <div className={styles.categoryHeader}>
              <span className={styles.categoryTitle}>
                {category.label}
                {isActive && (
                  <span className={styles.categoryCount}>
                    {currentSelection.serviceIds.length}
                  </span>
                )}
              </span>
            </div>

            <div className={styles.categoryBody}>
              {/* Tier Selection */}
              <div className={styles.tierSelector}>
                <span className={styles.tierLabel}>
                  {labels.selectTierScope}
                </span>
                <div className={styles.tierButtons}>
                  {TIERS.map((tier) => (
                    <button
                      key={tier.id}
                      onClick={() => onUpdate(category.id, tier.id, undefined)}
                      className={`${styles.tierButton} ${
                        currentTier === tier.id ? styles.active : ""
                      }`}
                    >
                      {tier.label}
                    </button>
                  ))}
                </div>

                {/* Tier Description */}
                <div className={styles.tierDescription}>
                  <Info
                    size={12}
                    className="flex-shrink-0 mt-0.5 text-[var(--color-text-tertiary)]"
                  />
                  <span>{getTierDescription(category.id, currentTier)}</span>
                </div>
              </div>

              {/* Service Selection */}
              <div>
                <span className={styles.tierLabel}>
                  {labels.selectServices}
                </span>
                <div className={styles.serviceList}>
                  {categoryServices.map((service) => {
                    const isSelected = currentSelection?.serviceIds.includes(
                      service.id
                    );
                    return (
                      <div
                        key={service.id}
                        onClick={() =>
                          onUpdate(category.id, undefined, service.id)
                        }
                        className={`${styles.serviceItem} ${
                          isSelected ? styles.selected : ""
                        }`}
                      >
                        <div className={styles.serviceCheckbox}>
                          {isSelected && (
                            <Check size={12} className="text-white" />
                          )}
                        </div>
                        <div className={styles.serviceInfo}>
                          <div className={styles.serviceName}>
                            {service.label}
                          </div>
                          <div className={styles.serviceDescription}>
                            {service.description}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
