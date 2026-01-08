// src/constants/pricing.ts
import { Category, Tier } from '../types';

// --- Pricing model ----------------------------------------------------

export const TIER_MULTIPLIERS: Record<Category, Record<Tier, number>> = {
  marketing: { fast: 0.7, standard: 1, pro: 1.8 },
  design: { fast: 0.7, standard: 1, pro: 1.9 },
  web: { fast: 0.7, standard: 1, pro: 1.9 },
  ia: { fast: 0.7, standard: 1, pro: 2.0 },
  apps: { fast: 0.7, standard: 1, pro: 2.0 },
};

export const SERVICE_PRICING: Record<
  string,
  { baseHours: number; basePrice: number } // baseline = Standard tier
> = {
  // --- Marketing ---
  'marketing.strategy_basic': { baseHours: 4, basePrice: 250 },
  'marketing.social': { baseHours: 10, basePrice: 500 },
  'marketing.paid_ads_basic': { baseHours: 5, basePrice: 250 },
  'marketing.email_basic': { baseHours: 4, basePrice: 180 },
  'marketing.email_automations': { baseHours: 8, basePrice: 400 },
  'marketing.seo_content': { baseHours: 3, basePrice: 120 },
  'marketing.motion_video': { baseHours: 3, basePrice: 120 },
  'marketing.photo_shoot': { baseHours: 6, basePrice: 300 },
  'marketing.analytics_reporting': { baseHours: 3, basePrice: 120 },

  // --- Design ---
  'design.branding': { baseHours: 18, basePrice: 800 },
  'design.rebrand_light': { baseHours: 16, basePrice: 650 },
  'design.uiux_web': { baseHours: 18, basePrice: 400 },
  'design.templates_social': { baseHours: 6, basePrice: 220 },
  'design.design_system': { baseHours: 24, basePrice: 900 },
  'design.print_stationery': { baseHours: 6, basePrice: 250 },
  'design.event_kit': { baseHours: 8, basePrice: 350 },

  // --- Web ---
  'web.landing_page': { baseHours: 16, basePrice: 600 },
  'web.site_institutional': { baseHours: 45, basePrice: 800 },
  'web.catalog': { baseHours: 40, basePrice: 1400 },
  'web.ecommerce': { baseHours: 50, basePrice: 1900 },
  'web.booking_system': { baseHours: 40, basePrice: 1300 },
  'web.event_site': { baseHours: 24, basePrice: 900 },
  'web.ar_activation_page': { baseHours: 22, basePrice: 800 },
  'web.seo_technical': { baseHours: 12, basePrice: 300 },
  'web.integrations': { baseHours: 10, basePrice: 400 },
  'web.analytics': { baseHours: 7, basePrice: 320 },

  // --- IA / Automations ---
  'ia.chatbot_support': { baseHours: 14, basePrice: 550 },
  'ia.chatbot_booking': { baseHours: 20, basePrice: 800 },
  'ia.chatbot_billing': { baseHours: 20, basePrice: 800 },
  'ia.assistant_internal': { baseHours: 40, basePrice: 1600 },
  'ia.workflows_n8n': { baseHours: 18, basePrice: 700 },
  'ia.rag_content': { baseHours: 28, basePrice: 1100 },
  'ia.auto_replies_basic': { baseHours: 8, basePrice: 350 },
  'ia.events_ai_assistant': { baseHours: 26, basePrice: 1000 },
  'ia.local_seo_automation': { baseHours: 18, basePrice: 700 },
  'ia.reporting': { baseHours: 8, basePrice: 350 },

  // --- Apps ---
  'apps.mvp_prototype': { baseHours: 30, basePrice: 1100 },
  'apps.react_native_app': { baseHours: 100, basePrice: 3800 },
  'apps.pwa': { baseHours: 72, basePrice: 2600 },
  'apps.booking_app': { baseHours: 72, basePrice: 2600 },
  'apps.ar_vr_experience': { baseHours: 120, basePrice: 4500 },
  'apps.publication_analytics': { baseHours: 10, basePrice: 450 },
  'apps.cicd_performance': { baseHours: 14, basePrice: 650 },
};
