// src/utils/pricing.ts
import { AtomicService, Category, Tier } from '../types';
import { TIER_MULTIPLIERS, SERVICE_PRICING } from '../constants/constants';

/**
 * Given a service and a tier, compute effort (hours) and price.
 * This is shared between the proposal view and JSON output.
 */
export const computeServicePricing = (service: AtomicService, tier: Tier) => {
  const pricing = SERVICE_PRICING[service.id];
  if (!pricing) return null;

  const multipliersForCategory = TIER_MULTIPLIERS[service.category as Category];
  const multiplier = multipliersForCategory ? multipliersForCategory[tier] ?? 1 : 1;

  return {
    hours: pricing.baseHours * multiplier,
    price: pricing.basePrice * multiplier,
  };
};
