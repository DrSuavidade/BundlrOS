import { PipelineTemplate, DeliverableType } from './types';

export const DELIVERABLES_LIBRARY: Record<string, { id: string; name: string; type: DeliverableType }> = {
  // Discovery & Strategy
  D_BRIEF: { id: "D_BRIEF", name: "Client Brief Form", type: DeliverableType.DOCUMENT },
  D_KPI: { id: "D_KPI", name: "KPIs + Success Metrics", type: DeliverableType.DOCUMENT },
  D_PERSONAS: { id: "D_PERSONAS", name: "Audience Personas", type: DeliverableType.DOCUMENT },
  D_POSITIONING: { id: "D_POSITIONING", name: "Brand Positioning + Messaging", type: DeliverableType.DOCUMENT },
  D_OFFER: { id: "D_OFFER", name: "Offer + Funnel Outline", type: DeliverableType.DOCUMENT },
  D_SOC_AUDIT: { id: "D_SOC_AUDIT", name: "Social Audit + Recommendations", type: DeliverableType.DOCUMENT },

  // Brand & Assets
  A_BRANDKIT: { id: "A_BRANDKIT", name: "Brand Kit (fonts/colors/voice)", type: DeliverableType.ASSET },
  A_TEMPLATES: { id: "A_TEMPLATES", name: "Design Templates (posts/stories)", type: DeliverableType.ASSET },
  A_BROLL: { id: "A_BROLL", name: "B-roll / Asset Library", type: DeliverableType.ASSET },
  A_COPYBANK: { id: "A_COPYBANK", name: "Copy Bank (hooks/CTAs)", type: DeliverableType.DOCUMENT },

  // Content & Social Ops
  D_CONTENT_PILLARS: { id: "D_CONTENT_PILLARS", name: "Content Pillars", type: DeliverableType.DOCUMENT },
  D_CALENDAR: { id: "D_CALENDAR", name: "Content Calendar", type: DeliverableType.DOCUMENT },
  A_POSTS_BATCH: { id: "A_POSTS_BATCH", name: "Batch of Posts (graphics/captions)", type: DeliverableType.ASSET },
  A_REELS_BATCH: { id: "A_REELS_BATCH", name: "Batch of Short Videos/Reels", type: DeliverableType.ASSET },
  D_HASHTAGS: { id: "D_HASHTAGS", name: "Hashtag/Keyword Set", type: DeliverableType.DOCUMENT },
  D_SCHEDULING: { id: "D_SCHEDULING", name: "Scheduling Setup + Queue", type: DeliverableType.DOCUMENT },
  D_COMMUNITY_GUIDE: { id: "D_COMMUNITY_GUIDE", name: "Community Management Guidelines", type: DeliverableType.DOCUMENT },
  D_REPORT: { id: "D_REPORT", name: "Performance Report", type: DeliverableType.DOCUMENT },

  // Ads / Campaign
  D_CAMPAIGN_PLAN: { id: "D_CAMPAIGN_PLAN", name: "Campaign Plan", type: DeliverableType.DOCUMENT },
  A_AD_CREATIVES: { id: "A_AD_CREATIVES", name: "Ad Creatives (static/video)", type: DeliverableType.ASSET },
  D_AD_COPY: { id: "D_AD_COPY", name: "Ad Copy Variations", type: DeliverableType.DOCUMENT },
  D_TRACKING: { id: "D_TRACKING", name: "Tracking Setup (pixels/UTMs/events)", type: DeliverableType.DOCUMENT },
  D_LANDING: { id: "D_LANDING", name: "Landing Page Draft/Build", type: DeliverableType.ASSET },

  // AI & Automation
  D_USECASES: { id: "D_USECASES", name: "AI Use Cases + Prioritization", type: DeliverableType.DOCUMENT },
  D_DATA_MAP: { id: "D_DATA_MAP", name: "Data Map + Integrations Plan", type: DeliverableType.DOCUMENT },
  A_AUTOMATION: { id: "A_AUTOMATION", name: "Automation Workflow (Zap/Make/n8n)", type: DeliverableType.ASSET },
  D_AI_PROMPTS: { id: "D_AI_PROMPTS", name: "Prompt Pack / Agent Instructions", type: DeliverableType.DOCUMENT },
  A_CHATBOT: { id: "A_CHATBOT", name: "Chatbot / Assistant Config", type: DeliverableType.ASSET },
  D_TESTS: { id: "D_TESTS", name: "Test Plan + Results", type: DeliverableType.DOCUMENT },
  D_SOP: { id: "D_SOP", name: "SOP + Handover Docs", type: DeliverableType.DOCUMENT },
  D_TRAINING: { id: "D_TRAINING", name: "Client Training Session Notes", type: DeliverableType.DOCUMENT },

  // Website
  D_SITEMAP: { id: "D_SITEMAP", name: "Sitemap + IA", type: DeliverableType.DOCUMENT },
  D_WIREFRAMES: { id: "D_WIREFRAMES", name: "Wireframes", type: DeliverableType.ASSET },
  A_DESIGN: { id: "A_DESIGN", name: "UI Design / Mockups", type: DeliverableType.ASSET },
  A_WEB_BUILD: { id: "A_WEB_BUILD", name: "Website Build", type: DeliverableType.ASSET },
  D_SEO: { id: "D_SEO", name: "SEO Foundations (meta/schema)", type: DeliverableType.DOCUMENT },
  D_ANALYTICS: { id: "D_ANALYTICS", name: "Analytics Setup (GA/GTM)", type: DeliverableType.DOCUMENT },
  D_QA: { id: "D_QA", name: "QA Checklist + Fixes", type: DeliverableType.DOCUMENT },
  D_LAUNCH: { id: "D_LAUNCH", name: "Launch Checklist + Go-live", type: DeliverableType.DOCUMENT },
  D_MAINT: { id: "D_MAINT", name: "Maintenance Plan", type: DeliverableType.DOCUMENT }
};

export const PIPELINE_TEMPLATES: PipelineTemplate[] = [
  // 1) Social Media Retainer (Monthly Ops)
  {
    id: "TPL_SOCIAL_RETAINER",
    name: "Social Media Management (Retainer)",
    category: "Marketing",
    iconName: "Share2",
    stages: [
      { id: "S1_ONBOARD", name: "Onboarding", order: 0, requiredDeliverables: ["D_BRIEF", "A_BRANDKIT", "D_KPI", "D_SOC_AUDIT"] },
      { id: "S2_STRATEGY", name: "Monthly Strategy", order: 1, requiredDeliverables: ["D_CONTENT_PILLARS", "D_CALENDAR", "D_HASHTAGS"] },
      { id: "S3_PRODUCTION", name: "Content Production", order: 2, requiredDeliverables: ["A_POSTS_BATCH", "A_REELS_BATCH", "A_TEMPLATES", "A_COPYBANK"] },
      { id: "S4_SCHEDULE_COMMUNITY", name: "Scheduling + Community", order: 3, requiredDeliverables: ["D_SCHEDULING", "D_COMMUNITY_GUIDE"] },
      { id: "S5_REPORTING", name: "Reporting + Optimization", order: 4, requiredDeliverables: ["D_REPORT"] }
    ]
  },

  // 2) Content Sprint (2–4 weeks)
  {
    id: "TPL_CONTENT_SPRINT",
    name: "Content Sprint (Batch Creation)",
    category: "Content",
    iconName: "FastForward",
    stages: [
      { id: "S1_SCOPE", name: "Scope + Pillars", order: 0, requiredDeliverables: ["D_BRIEF", "D_CONTENT_PILLARS", "A_BRANDKIT"] },
      { id: "S2_PLANNING", name: "Topics + Calendar", order: 1, requiredDeliverables: ["D_CALENDAR", "A_COPYBANK"] },
      { id: "S3_BATCH", name: "Batch Production", order: 2, requiredDeliverables: ["A_POSTS_BATCH", "A_REELS_BATCH"] },
      { id: "S4_HANDOFF", name: "Handoff + Scheduling", order: 3, requiredDeliverables: ["D_SCHEDULING", "D_SOP"] }
    ]
  },

  // 3) Launch Campaign (Organic + Paid)
  {
    id: "TPL_LAUNCH_CAMPAIGN",
    name: "Launch Campaign (Organic + Paid)",
    category: "Marketing",
    iconName: "Rocket",
    stages: [
      { id: "S1_DISCOVERY", name: "Discovery + Offer", order: 0, requiredDeliverables: ["D_BRIEF", "D_OFFER", "D_KPI"] },
      { id: "S2_CAMPAIGN", name: "Campaign Plan", order: 1, requiredDeliverables: ["D_CAMPAIGN_PLAN", "D_TRACKING"] },
      { id: "S3_ASSETS", name: "Creative Production", order: 2, requiredDeliverables: ["A_AD_CREATIVES", "D_AD_COPY", "A_POSTS_BATCH"] },
      { id: "S4_LANDING", name: "Landing + QA", order: 3, requiredDeliverables: ["D_LANDING", "D_QA"] },
      { id: "S5_LAUNCH", name: "Launch + Optimize", order: 4, requiredDeliverables: ["D_REPORT"] }
    ]
  },

  // 4) AI Integration (Use-case → Build → Deploy)
  {
    id: "TPL_AI_INTEGRATION",
    name: "AI Integration (Use-cases to Deployment)",
    category: "Technology",
    iconName: "Cpu",
    stages: [
      { id: "S1_AI_DISCOVERY", name: "AI Discovery", order: 0, requiredDeliverables: ["D_BRIEF", "D_USECASES", "D_KPI"] },
      { id: "S2_DESIGN", name: "Solution Design", order: 1, requiredDeliverables: ["D_DATA_MAP", "D_AI_PROMPTS"] },
      { id: "S3_BUILD", name: "Build + Integrations", order: 2, requiredDeliverables: ["A_AUTOMATION", "A_CHATBOT"] },
      { id: "S4_TEST", name: "Testing + Guardrails", order: 3, requiredDeliverables: ["D_TESTS"] },
      { id: "S5_DEPLOY", name: "Deploy + Handover", order: 4, requiredDeliverables: ["D_SOP", "D_TRAINING"] }
    ]
  },

  // 5) Automation Build (CRM/Lead routing/ops)
  {
    id: "TPL_AUTOMATION_BUILD",
    name: "Automation Build (Ops + CRM)",
    category: "Operations",
    iconName: "Settings",
    stages: [
      { id: "S1_PROCESS_MAP", name: "Process Mapping", order: 0, requiredDeliverables: ["D_BRIEF", "D_DATA_MAP"] },
      { id: "S2_WORKFLOW_DESIGN", name: "Workflow Design", order: 1, requiredDeliverables: ["D_USECASES"] },
      { id: "S3_IMPLEMENT", name: "Implementation", order: 2, requiredDeliverables: ["A_AUTOMATION"] },
      { id: "S4_QA", name: "QA + Monitoring", order: 3, requiredDeliverables: ["D_TESTS", "D_QA"] },
      { id: "S5_HANDOVER", name: "Handover", order: 4, requiredDeliverables: ["D_SOP", "D_TRAINING"] }
    ]
  },

  // 6) Chatbot / Assistant Deployment
  {
    id: "TPL_CHATBOT_DEPLOY",
    name: "Chatbot / AI Assistant Deployment",
    category: "Technology",
    iconName: "MessageSquare",
    stages: [
      { id: "S1_ONBOARD", name: "Onboarding + Goals", order: 0, requiredDeliverables: ["D_BRIEF", "D_KPI", "D_USECASES"] },
      { id: "S2_KNOWLEDGE", name: "Knowledge + Tone", order: 1, requiredDeliverables: ["A_BRANDKIT", "D_AI_PROMPTS"] },
      { id: "S3_BUILD", name: "Build + Channels", order: 2, requiredDeliverables: ["A_CHATBOT", "D_DATA_MAP"] },
      { id: "S4_TEST", name: "Test + Fail-safes", order: 3, requiredDeliverables: ["D_TESTS"] },
      { id: "S5_GO_LIVE", name: "Go-live + Training", order: 4, requiredDeliverables: ["D_SOP", "D_TRAINING"] }
    ]
  },

  // 7) Website Build (Brochure / Service Site)
  {
    id: "TPL_WEBSITE_BROCHURE",
    name: "Website Build (Brochure / Service Site)",
    category: "Development",
    iconName: "Layout",
    stages: [
      { id: "S1_DISCOVERY", name: "Discovery", order: 0, requiredDeliverables: ["D_BRIEF", "A_BRANDKIT", "D_KPI"] },
      { id: "S2_STRUCTURE", name: "Sitemap + Wireframes", order: 1, requiredDeliverables: ["D_SITEMAP", "D_WIREFRAMES"] },
      { id: "S3_DESIGN", name: "Design", order: 2, requiredDeliverables: ["A_DESIGN"] },
      { id: "S4_BUILD", name: "Build", order: 3, requiredDeliverables: ["A_WEB_BUILD"] },
      { id: "S5_FOUNDATIONS", name: "SEO + Analytics", order: 4, requiredDeliverables: ["D_SEO", "D_ANALYTICS"] },
      { id: "S6_QA", name: "QA", order: 5, requiredDeliverables: ["D_QA"] },
      { id: "S7_LAUNCH", name: "Launch + Handover", order: 6, requiredDeliverables: ["D_LAUNCH", "D_SOP"] }
    ]
  },

  // 8) Website + Social Starter Bundle
  {
    id: "TPL_WEB_SOCIAL_STARTER",
    name: "Website + Social Starter Bundle",
    category: "Bundle",
    iconName: "Layers",
    stages: [
      { id: "S1_ONBOARD", name: "Onboarding", order: 0, requiredDeliverables: ["D_BRIEF", "D_KPI"] },
      { id: "S2_BRAND", name: "Brand + Messaging", order: 1, requiredDeliverables: ["A_BRANDKIT", "D_POSITIONING"] },
      { id: "S3_WEB", name: "Website Delivery", order: 2, requiredDeliverables: ["D_SITEMAP", "A_DESIGN", "A_WEB_BUILD", "D_LAUNCH"] },
      { id: "S4_SOCIAL_SYSTEM", name: "Social System Setup", order: 3, requiredDeliverables: ["D_CONTENT_PILLARS", "A_TEMPLATES", "D_SCHEDULING"] },
      { id: "S5_INITIAL_CONTENT", name: "Initial Content Pack", order: 4, requiredDeliverables: ["A_POSTS_BATCH", "A_REELS_BATCH"] }
    ]
  },

  // 9) E-commerce Website Build (if you do it)
  {
    id: "TPL_WEB_ECOM",
    name: "Website Build (E-commerce)",
    category: "Development",
    iconName: "ShoppingBag",
    stages: [
      { id: "S1_DISCOVERY", name: "Discovery + Requirements", order: 0, requiredDeliverables: ["D_BRIEF", "D_KPI"] },
      { id: "S2_IA", name: "Structure + Wireframes", order: 1, requiredDeliverables: ["D_SITEMAP", "D_WIREFRAMES"] },
      { id: "S3_DESIGN", name: "Design", order: 2, requiredDeliverables: ["A_DESIGN"] },
      { id: "S4_BUILD", name: "Build + Integrations", order: 3, requiredDeliverables: ["A_WEB_BUILD", "D_ANALYTICS", "D_TRACKING"] },
      { id: "S5_SEO_QA", name: "SEO + QA", order: 4, requiredDeliverables: ["D_SEO", "D_QA"] },
      { id: "S6_LAUNCH", name: "Launch + Handover", order: 5, requiredDeliverables: ["D_LAUNCH", "D_SOP", "D_TRAINING"] }
    ]
  },

  // 10) Ongoing Website Maintenance + Optimization
  {
    id: "TPL_WEB_MAINTENANCE",
    name: "Website Maintenance + Optimization (Retainer)",
    category: "Operations",
    iconName: "Wrench",
    stages: [
      { id: "S1_BASELINE", name: "Baseline + Access", order: 0, requiredDeliverables: ["D_BRIEF", "D_ANALYTICS", "D_MAINT"] },
      { id: "S2_MAINT", name: "Maintenance Cycle", order: 1, requiredDeliverables: ["D_QA"] },
      { id: "S3_OPTIMIZE", name: "Optimization + Reporting", order: 2, requiredDeliverables: ["D_REPORT"] }
    ]
  },

  // 11) SaaS MVP Build
  {
    id: "TPL_SAAS_MVP",
    name: "SaaS MVP Build",
    category: "Development",
    iconName: "Cpu",
    stages: [
      { id: "S1_DISCOVERY", name: "Discovery + Specs", order: 0, requiredDeliverables: ["D_BRIEF", "D_KPI", "D_USECASES"] },
      { id: "S2_DESIGN", name: "UI/UX Design", order: 1, requiredDeliverables: ["D_WIREFRAMES", "A_DESIGN"] },
      { id: "S3_DEV", name: "Development Sprint", order: 2, requiredDeliverables: ["A_WEB_BUILD", "D_DATA_MAP"] },
      { id: "S4_QA", name: "QA + Testing", order: 3, requiredDeliverables: ["D_TESTS", "D_QA"] },
      { id: "S5_DEPLOY", name: "Deployment", order: 4, requiredDeliverables: ["D_LAUNCH", "D_SOP"] }
    ]
  },

  // 12) Brand Identity Overhaul
  {
    id: "TPL_BRAND_IDENTITY",
    name: "Brand Identity Overhaul",
    category: "Design",
    iconName: "Layout",
    stages: [
      { id: "S1_DISCOVERY", name: "Brand Discovery", order: 0, requiredDeliverables: ["D_BRIEF", "D_PERSONAS", "D_POSITIONING"] },
      { id: "S2_CONCEPT", name: "Visual Concepts", order: 1, requiredDeliverables: ["A_DESIGN"] },
      { id: "S3_REFINEMENT", name: "Refinement", order: 2, requiredDeliverables: ["A_BRANDKIT"] },
      { id: "S4_GUIDELINES", name: "Brand Guidelines", order: 3, requiredDeliverables: ["D_SOP"] },
      { id: "S5_ASSETS", name: "Asset Handoff", order: 4, requiredDeliverables: ["A_TEMPLATES", "A_BROLL"] }
    ]
  }
];
