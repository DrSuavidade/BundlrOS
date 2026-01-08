// src/constants/presets.ts
import { BudgetSelectionState } from '../types';

type BundlePreset = {
  id: string;
  name: string;
  description?: string;
  selection: BudgetSelectionState;
};

export const BUNDLE_PRESETS: BundlePreset[] = [
  {
    id: 'arranque-rapido',
    name: 'Arranque Rápido',
    description: 'Landing + branding + 1 social channel',
    selection: {
      web: { tier: 'fast', serviceIds: ['web.landing_page'] },
      design: { tier: 'fast', serviceIds: ['design.branding'] },
      marketing: { tier: 'fast', serviceIds: ['marketing.social'] },
    },
  },
  {
    id: 'site-completo',
    name: 'Site Completo',
    description: 'Institutional site with basic SEO & analytics',
    selection: {
      web: { tier: 'standard', serviceIds: ['web.site_institutional_basic', 'web.seo_technical', 'web.analytics_basic'] },
      design: { tier: 'standard', serviceIds: ['design.uiux_web'] },
    },
  },
  {
    id: 'loja-rapida',
    name: 'Loja Rápida',
    description: 'Simple sales page with payments',
    selection: {
      web: { tier: 'standard', serviceIds: ['web.ecommerce_basic', 'web.analytics_basic'] },
      design: { tier: 'fast', serviceIds: ['design.uiux_web'] },
    },
  },
  {
    id: 'loja-pro',
    name: 'Loja Pro',
    description: 'Full store, suggestions, client area, analytics',
    selection: {
      web: { tier: 'pro', serviceIds: ['web.ecommerce_advanced', 'web.analytics_pro'] },
      marketing: { tier: 'standard', serviceIds: ['marketing.social'] },
      design: { tier: 'standard', serviceIds: ['design.uiux_web'] },
    },
  },
  {
    id: 'reservas-sem-stress',
    name: 'Reservas sem Stress',
    description: 'Booking page + reminders (optionally chatbot)',
    selection: {
      web: { tier: 'standard', serviceIds: ['web.booking_system'] },
      ia: { tier: 'fast', serviceIds: ['ia.chatbot_booking'] },
    },
  },
  {
    id: 'mvp-rapido',
    name: 'MVP Rápido',
    description: 'Prototype + basic v1',
    selection: {
      apps: { tier: 'fast', serviceIds: ['apps.mvp_prototype'] },
      web: { tier: 'fast', serviceIds: ['web.landing_page'] },
      design: { tier: 'standard', serviceIds: ['design.uiux_web'] },
    },
  },
  {
    id: 'experiencia-imersiva',
    name: 'Experiência Imersiva',
    description: 'AR/VR experience + activation + teaser',
    selection: {
      apps: { tier: 'pro', serviceIds: ['apps.ar_vr_experience'] },
      web: { tier: 'standard', serviceIds: ['web.ar_activation_page'] },
      marketing: { tier: 'standard', serviceIds: ['marketing.motion_video'] },
    },
  },
  {
    id: 'automacao-simples',
    name: 'Automação Simples',
    description: 'Auto replies + contact capture + report',
    selection: {
      ia: { tier: 'fast', serviceIds: ['ia.auto_replies_basic', 'ia.reporting'] },
    },
  },
  {
    id: 'eventos',
    name: 'Eventos',
    description: 'Event page + graphics + basic push',
    selection: {
      web: { tier: 'standard', serviceIds: ['web.event_site'] },
      design: { tier: 'standard', serviceIds: ['design.event_kit'] },
      marketing: { tier: 'fast', serviceIds: ['marketing.social'] },
    },
  },
  {
    id: 'eventos-automatizados',
    name: 'Eventos Automatizados',
    description: 'Event + AI assistant + automations',
    selection: {
      web: { tier: 'standard', serviceIds: ['web.event_site'] },
      ia: { tier: 'pro', serviceIds: ['ia.events_ai_assistant', 'ia.workflows_n8n'] },
    },
  },
  {
    id: 'destaque-google-maps',
    name: 'Destaque no Google Maps',
    description: 'Local SEO (reviews/citations) + SEO tweaks',
    selection: {
      ia: { tier: 'standard', serviceIds: ['ia.local_seo_automation'] },
      web: { tier: 'standard', serviceIds: ['web.seo_technical'] },
    },
  },
  {
    id: 'destaque-google-search',
    name: 'Destaque no Google Search',
    description: 'SEO content + traffic strategy',
    selection: {
      marketing: { tier: 'standard', serviceIds: ['marketing.seo_content'] },
      ia: { tier: 'standard', serviceIds: ['ia.local_seo_automation'] },
    },
  },
];
