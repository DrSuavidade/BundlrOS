// src/constants/data.ts
import { AtomicService, Category, Tier, TierDefinition } from '../types'; 

type MultiLangString = { en: string; pt: string };

interface RawAtomicService extends Omit<AtomicService, 'label' | 'description' | 'tierDescriptions'> {
  label: MultiLangString;
  description: MultiLangString;
  tierDescriptions?: Record<Tier, MultiLangString>;
}

interface RawTierDefinition extends Omit<TierDefinition, 'label' | 'description'> {
  label: MultiLangString;
  description: MultiLangString;
}

const RAW_CATEGORIES: { id: Category; label: MultiLangString; color: string }[] = [
  { id: 'marketing', label: { en: 'Marketing', pt: 'Marketing' }, color: 'blue' },
  { id: 'design', label: { en: 'Design', pt: 'Design' }, color: 'pink' },
  { id: 'web', label: { en: 'Web', pt: 'Web' }, color: 'indigo' },
  { id: 'ia', label: { en: 'IA & Automation', pt: 'IA & Automação' }, color: 'purple' },
  { id: 'apps', label: { en: 'Apps', pt: 'Apps' }, color: 'emerald' },
];

const RAW_TIERS: { id: Tier; label: MultiLangString }[] = [
  { id: 'fast', label: { en: 'Fast', pt: 'Fast' } },
  { id: 'standard', label: { en: 'Standard', pt: 'Standard' } },
  { id: 'pro', label: { en: 'Pro', pt: 'Pro' } },
];

const RAW_TIER_DEFINITIONS: RawTierDefinition[] = [
  {
    category: 'marketing',
    tier: 'fast',
    label: { en: 'Fast Marketing', pt: 'Marketing Rápido' },
    description: {
      en: '1 main platform (usually Instagram).\n3–4 posts/week, little or no ads.\nNo complex email flows (only basic campaigns).\nReporting: quick monthly summary or just analytics access.',
      pt: '1 plataforma principal (geralmente Instagram).\n3–4 posts/semana, poucos ou nenhuns anúncios.\nSem fluxos de email complexos (apenas campanhas básicas).\nRelatórios: resumo mensal rápido ou apenas acesso a analítica.'
    }
  },
  {
    category: 'marketing',
    tier: 'standard',
    label: { en: 'Standard Marketing', pt: 'Marketing Padrão' },
    description: {
      en: '1–2 platforms (IG + FB, or IG + TikTok).\n20–30 posts/month (almost daily).\nAds campaigns with clear objective & basic optimization.\nEmail: simple monthly campaigns (no big automations).\nReporting: structured monthly report with insights.',
      pt: '1–2 plataformas (IG + FB, ou IG + TikTok).\n20–30 posts/mês (quase diário).\nCampanhas de anúncios com objetivo claro e otimização básica.\nEmail: campanhas mensais simples (sem grandes automações).\nRelatórios: relatório mensal estruturado com insights.'
    }
  },
  {
    category: 'marketing',
    tier: 'pro',
    label: { en: 'Pro Marketing', pt: 'Marketing Pro' },
    description: {
      en: '2–3+ platforms (IG, FB, TikTok/LinkedIn).\n30–40 posts/month including reels, carousels, stories.\nFully managed paid traffic strategy (multiple campaigns, A/B tests).\nEmail automations (welcome, nurturing, recovery, etc.).\nReporting: detailed dashboards + strategic review call.',
      pt: '2–3+ plataformas (IG, FB, TikTok/LinkedIn).\n30–40 posts/mês incluindo reels, carrosséis, stories.\nEstratégia de tráfego pago totalmente gerida (múltiplas campanhas, testes A/B).\nAutomações de email (boas-vindas, nurturing, recuperação, etc.).\nRelatórios: dashboards detalhados + chamada de revisão estratégica.'
    }
  },
  // Design
  {
    category: 'design',
    tier: 'fast',
    label: { en: 'Fast Design', pt: 'Design Rápido' },
    description: {
      en: 'Basic logo or light refresh.\nVery small set of assets (e.g., business card + social avatar).\nSimple one-page style guide.',
      pt: 'Logótipo básico ou atualização leve.\nConjunto muito pequeno de ativos (ex: cartão de visita + avatar social).\nGuia de estilo simples de uma página.'
    }
  },
  {
    category: 'design',
    tier: 'standard',
    label: { en: 'Standard Design', pt: 'Design Padrão' },
    description: {
      en: 'Solid identity (logo, color, typography, key uses).\nSeveral templates (social, docs, basic stationery).\nBrand guide with clear rules & examples.',
      pt: 'Identidade sólida (logótipo, cor, tipografia, usos principais).\nVários templates (social, docs, estacionário básico).\nGuia da marca com regras claras e exemplos.'
    }
  },
  {
    category: 'design',
    tier: 'pro',
    label: { en: 'Pro Design', pt: 'Design Pro' },
    description: {
      en: 'Full brand system (primary/secondary logos, iconography, patterns).\nExtended templates (social packs, presentations, print, events).\nFull design system (tokens, components).\nLarge, detailed brand book.',
      pt: 'Sistema de marca completo (logótipos primários/secundários, iconografia, padrões).\nTemplates estendidos (packs sociais, apresentações, impressão, eventos).\nSistema de design completo (tokens, componentes).\nBrand book grande e detalhado.'
    }
  },
  // Web
  {
    category: 'web',
    tier: 'fast',
    label: { en: 'Fast Web', pt: 'Web Rápida' },
    description: {
      en: 'Landing page or small site (up to 3–4 sections/pages).\nSimple forms, no login or shop.\nBase SEO (titles, meta, basic structure).\nBasic analytics only.',
      pt: 'Landing page ou site pequeno (até 3–4 secções/páginas).\nFormulários simples, sem login ou loja.\nSEO base (títulos, meta, estrutura básica).\nApenas analítica básica.'
    }
  },
  {
    category: 'web',
    tier: 'standard',
    label: { en: 'Standard Web', pt: 'Web Padrão' },
    description: {
      en: 'Institutional site (6–7 pages) or landing + extra sections.\nAdmin area for content (events, blog, etc.).\nPossible simple login or members area.\nStronger on-page SEO for all pages.\nGA4 with key events; simple dashboards.',
      pt: 'Site institucional (6–7 páginas) ou landing + secções extra.\nÁrea de administração para conteúdo (eventos, blog, etc.).\nPossível login simples ou área de membros.\nSEO on-page mais forte para todas as páginas.\nGA4 com eventos chave; dashboards simples.'
    }
  },
  {
    category: 'web',
    tier: 'pro',
    label: { en: 'Pro Web', pt: 'Web Pro' },
    description: {
      en: 'Larger site (8–12+ pages) or complex flows (catalog, e-commerce, booking).\nLogin, client area, advanced admin.\nShop/payments, smart suggestions, integrations (CRM, email, etc.).\nAdvanced SEO (technical + content, local, Maps, citations).\nPro analytics dashboard & tracking (funnels, cohorts).',
      pt: 'Site maior (8–12+ páginas) ou fluxos complexos (catálogo, e-commerce, reservas).\nLogin, área de cliente, administração avançada.\nLoja/pagamentos, sugestões inteligentes, integrações (CRM, email, etc.).\nSEO avançado (técnico + conteúdo, local, Maps, citações).\nDashboard de analítica Pro & tracking (funis, coortes).'
    }
  },
  // IA
  {
    category: 'ia',
    tier: 'fast',
    label: { en: 'Fast IA', pt: 'IA Rápida' },
    description: {
      en: 'Single-channel chatbot or simple auto-replies (WhatsApp/email or website).\nLimited flows (FAQ, contact capture).\nManual export to Sheets or email.\nNo integration with payments or CRM.',
      pt: 'Chatbot de canal único ou respostas automáticas simples (WhatsApp/email ou site).\nFluxos limitados (FAQ, captura de contacto).\nExportação manual para Sheets ou email.\nSem integração com pagamentos ou CRM.'
    }
  },
  {
    category: 'ia',
    tier: 'standard',
    label: { en: 'Standard IA', pt: 'IA Padrão' },
    description: {
      en: '1–2 channels (e.g., Web + WhatsApp).\nSmarter flows (qualification, suggestion of products/services).\nStructured data into Sheets/CRM, optional small automations.\nMonthly report of leads & basic performance.',
      pt: '1–2 canais (ex: Web + WhatsApp).\nFluxos mais inteligentes (qualificação, sugestão de produtos/serviços).\nDados estruturados para Sheets/CRM, pequenas automações opcionais.\nRelatório mensal de leads e performance básica.'
    }
  },
  {
    category: 'ia',
    tier: 'pro',
    label: { en: 'Pro IA', pt: 'IA Pro' },
    description: {
      en: 'Multi-channel assistant (Web + WhatsApp + IG, etc.).\nAdvanced flows (closing deals, bookings, billing, RAG over documents).\nDeep integration with CRM, invoicing, email, etc.\nAutomated reports, dashboards, and possibly internal copilot.',
      pt: 'Assistente multicanal (Web + WhatsApp + IG, etc.).\nFluxos avançados (fecho de negócios, reservas, faturação, RAG sobre documentos).\nIntegração profunda com CRM, faturação, email, etc.\nRelatórios automatizados, dashboards e possivelmente copilot interno.'
    }
  },
  // Apps
  {
    category: 'apps',
    tier: 'fast',
    label: { en: 'Fast Apps', pt: 'Apps Rápidas' },
    description: {
      en: 'MVP prototype (limited screens, click-through prototype, maybe simple v1).\nSingle platform (web or mobile) with core features only.\nMinimal analytics.',
      pt: 'Protótipo MVP (ecrãs limitados, protótipo navegável, talvez v1 simples).\nPlataforma única (web ou mobile) apenas com funcionalidades principais.\nAnalítica mínima.'
    }
  },
  {
    category: 'apps',
    tier: 'standard',
    label: { en: 'Standard Apps', pt: 'Apps Padrão' },
    description: {
      en: 'Real React Native app or PWA with the main feature set.\n1–2 platforms (iOS + Android, or web + mobile).\nProper analytics, crash logging.\nSimple CI/CD.',
      pt: 'App React Native real ou PWA com conjunto principal de funcionalidades.\n1–2 plataformas (iOS + Android, ou web + mobile).\nAnalítica adequada, registo de crashes.\nCI/CD simples.'
    }
  },
  {
    category: 'apps',
    tier: 'pro',
    label: { en: 'Pro Apps', pt: 'Apps Pro' },
    description: {
      en: 'Full product with more modules (e-commerce, bookings, AR/VR, etc.).\nMulti-platform (iOS, Android, web).\nAdvanced performance optimization & CI/CD.\nIntegrations with APIs, payments, analytics, AI assistants.',
      pt: 'Produto completo com mais módulos (e-commerce, reservas, AR/VR, etc.).\nMulti-plataforma (iOS, Android, web).\nOtimização de performance avançada & CI/CD.\nIntegrações com APIs, pagamentos, analítica, assistentes de IA.'
    }
  }
];

const RAW_ATOMIC_SERVICES: RawAtomicService[] = [
  // Marketing
  {
    id: 'marketing.strategy_basic',
    category: 'marketing',
    label: { en: 'Strategy & Planning', pt: 'Estratégia e Planeamento' },
    description: {
      en: 'Strategy & planning for 1–2 main channels, quarterly.',
      pt: 'Estratégia e planeamento para 1–2 canais principais, trimestral.',
    },
    tierDescriptions: {
      fast: {
        en: 'Light strategy for 1 main channel, quarterly check-in',
        pt: 'Estratégia leve para 1 canal principal, revisão trimestral',
      },
      standard: {
        en: 'Full strategy for 1–2 channels with quarterly planning sessions',
        pt: 'Estratégia completa para 1–2 canais com sessões de planeamento trimestrais',
      },
      pro: {
        en: 'Deep strategy for 3+ channels with monthly reviews and optimization',
        pt: 'Estratégia profunda para 3+ canais com revisões mensais e otimização',
      },
    },
  },
  {
    id: 'marketing.social',
    category: 'marketing',
    label: { en: 'Social Media', pt: 'Redes Sociais' },
    description: {
      en: 'Ongoing social media management (posts, scheduling, basic reporting).',
      pt: 'Gestão contínua de redes sociais (posts, agendamento, reporting básico).',
    },
    tierDescriptions: {
      fast: {
        en: '1 platform, 3–4 posts per week',
        pt: '1 Plataforma, 3/4 posts por semana',
      },
      standard: {
        en: '2 platforms, 5–6 posts per week',
        pt: '2 Plataformas, 5/6 posts por semana',
      },
      pro: {
        en: '3–4 platforms, 7 posts per week',
        pt: '3/4 Plataformas, 7 posts por semana',
      },
    },
  },
  {
    id: 'marketing.paid_ads_basic',
    category: 'marketing',
    label: { en: 'Paid Ads Setup', pt: 'Configuração de Anúncios' },
    description: {
      en: 'Simple campaign setup + creatives + monthly analysis.',
      pt: 'Configuração simples de campanha + criativos + análise mensal.',
    },
    tierDescriptions: {
      fast: {
        en: 'Single simple campaign with basic targeting and creatives',
        pt: '1 campanha simples com segmentação básica e criativos',
      },
      standard: {
        en: '2–3 campaigns with clear objectives and monthly optimization',
        pt: '2–3 campanhas com objetivos claros e otimização mensal',
      },
      pro: {
        en: 'Always-on ads system with multiple campaigns, A/B tests and scaling',
        pt: 'Sistema de anúncios always-on com múltiplas campanhas, testes A/B e escala',
      },
    },
  },
  {
    id: 'marketing.email_basic',
    category: 'marketing',
    label: { en: 'Email Basic', pt: 'Email Básico' },
    description: {
      en: 'Email marketing setup + 1–2 campaigns / month.',
      pt: 'Configuração de email marketing + 1–2 campanhas / mês.',
    },
    tierDescriptions: {
      fast: {
        en: 'Email tool setup plus 1 simple campaign per month',
        pt: 'Configuração da ferramenta de email + 1 campanha simples por mês',
      },
      standard: {
        en: 'Newsletter plus 2–3 campaigns per month with basic segmentation',
        pt: 'Newsletter + 2–3 campanhas por mês com segmentação básica',
      },
      pro: {
        en: 'Ongoing calendar with 4+ campaigns per month and advanced segmentation',
        pt: 'Calendário contínuo com 4+ campanhas por mês e segmentação avançada',
      },
    },
  },
  {
    id: 'marketing.email_automations',
    category: 'marketing',
    label: { en: 'Email Automations', pt: 'Automações de Email' },
    description: {
      en: 'Email flows (welcome series, cart recovery, lead nurturing).',
      pt: 'Fluxos de email (boas-vindas, recuperação de carrinho, nurturing).',
    },
    tierDescriptions: {
      fast: {
        en: '1–2 simple flows (welcome or basic follow-up)',
        pt: '1–2 fluxos simples (boas-vindas ou follow-up básico)',
      },
      standard: {
        en: '3–4 flows (welcome, nurturing, recovery, reactivation)',
        pt: '3–4 fluxos (boas-vindas, nurturing, recuperação, reativação)',
      },
      pro: {
        en: 'Full automation map with multiple flows and A/B tests',
        pt: 'Mapa completo de automações com múltiplos fluxos e testes A/B',
      },
    },
  },
  {
    id: 'marketing.seo_content',
    category: 'marketing',
    label: { en: 'SEO Content', pt: 'Conteúdo SEO' },
    description: {
      en: 'Content + SEO copy for site/blog, keywords & structure.',
      pt: 'Conteúdo + copy SEO para site/blog, palavras-chave e estrutura.',
    },
    tierDescriptions: {
      fast: {
        en: '1–2 SEO articles or page copies per month',
        pt: '1–2 artigos ou textos de página SEO por mês',
      },
      standard: {
        en: '3–4 SEO articles/pages per month plus keyword plan',
        pt: '3–4 artigos/páginas SEO por mês + plano de palavras-chave',
      },
      pro: {
        en: 'Content calendar with 5+ SEO pieces per month and page optimizations',
        pt: 'Calendário de conteúdo com 5+ peças SEO por mês + otimização de páginas existentes',
      },
    },
  },
  {
    id: 'marketing.motion_video',
    category: 'marketing',
    label: { en: 'Motion & Video', pt: 'Motion e Vídeo' },
    description: {
      en: 'Motion design, social videos, reels editing, teasers.',
      pt: 'Motion design, vídeos sociais, edição de reels, teasers.',
    },
    tierDescriptions: {
      fast: {
        en: '1 short motion/video asset per month (reel/teaser)',
        pt: '1 asset curto de motion/vídeo por mês (reel/teaser)',
      },
      standard: {
        en: '2–3 edited videos per month (reels, ads, teasers)',
        pt: '2–3 vídeos editados por mês (reels, anúncios, teasers)',
      },
      pro: {
        en: 'Ongoing pack with 4+ videos per month and advanced motion graphics',
        pt: 'Pack contínuo com 4+ vídeos por mês e motion graphics avançado',
      },
    },
  },
  {
    id: 'marketing.photo_shoot',
    category: 'marketing',
    label: { en: 'Photo Shoot', pt: 'Sessão Fotográfica' },
    description: {
      en: 'Professional photo session for content/campaigns.',
      pt: 'Sessão fotográfica profissional para conteúdo/campanhas.',
    },
    tierDescriptions: {
      fast: {
        en: 'Half-day shoot, basic selection and light correction',
        pt: 'Meio dia de sessão, seleção básica e correção ligeira',
      },
      standard: {
        en: 'Full-day shoot plus curated selection and basic editing',
        pt: 'Dia inteiro de sessão + seleção curada e edição básica',
      },
      pro: {
        en: 'Full-day shoot with advanced retouching and multiple usage formats',
        pt: 'Dia inteiro de sessão + retoque avançado e múltiplos formatos de uso',
      },
    },
  },
  {
    id: 'marketing.analytics_reporting',
    category: 'marketing',
    label: { en: 'Analytics & Reporting', pt: 'Analítica e Relatórios' },
    description: {
      en: 'Monthly performance report (social, ads, email).',
      pt: 'Relatório mensal de performance (social, anúncios, email).',
    },
    tierDescriptions: {
      fast: {
        en: 'Simple monthly summary of key metrics',
        pt: 'Resumo mensal simples das métricas principais',
      },
      standard: {
        en: 'Structured monthly report with insights and next steps',
        pt: 'Relatório mensal estruturado com insights e próximos passos',
      },
      pro: {
        en: 'Advanced dashboard plus monthly call and deep strategic analysis',
        pt: 'Dashboard avançado + call mensal e análise estratégica profunda',
      },
    },
  },

  // Design
  {
    id: 'design.branding',
    category: 'design',
    label: { en: 'Branding', pt: 'Branding' },
    description: {
      en: 'Brand identity (logo, colors, basic assets).',
      pt: 'Identidade de marca (logo, cores, materiais básicos).',
    },
    tierDescriptions: {
      fast: {
        en: 'Logo + basic color palette + 1–2 font suggestions',
        pt: 'Logo + paleta de cores básica + 1–2 sugestões de fonte',
      },
      standard: {
        en: 'Logo system + colors + typography + simple brand guide',
        pt: 'Sistema de logo + cores + tipografia + brand guide simples',
      },
      pro: {
        en: 'Full brand system + guidelines + key templates',
        pt: 'Sistema de marca completo + guidelines + templates chave',
      },
    },
  },
  {
    id: 'design.rebrand_light',
    category: 'design',
    label: { en: 'Rebrand Light', pt: 'Rebrand Leve' },
    description: {
      en: 'New logo + updated visual identity + key pages updated.',
      pt: 'Novo logótipo + identidade visual atualizada + páginas chave atualizadas.',
    },
    tierDescriptions: {
      fast: {
        en: 'Light refresh to logo and colors',
        pt: 'Atualização leve de logo e cores',
      },
      standard: {
        en: 'New logo plus updated identity on key touchpoints',
        pt: 'Novo logo + identidade atualizada em pontos de contacto chave',
      },
      pro: {
        en: 'Broader rebrand with new positioning, visuals and launch assets',
        pt: 'Rebrand mais alargado com novo posicionamento, visuais e materiais de lançamento',
      },
    },
  },
  {
    id: 'design.uiux_web',
    category: 'design',
    label: { en: 'UI/UX Web', pt: 'UI/UX Web' },
    description: {
      en: 'UI/UX design for web (site/app screens).',
      pt: 'Design UI/UX para web (ecrãs de site/app).',
    },
    tierDescriptions: {
      fast: {
        en: 'Wireframes plus basic UI for key screens',
        pt: 'Wireframes + UI básica',
      },
      standard: {
        en: 'Complete UI/UX for main flows and responsive states',
        pt: 'UI/UX + estados responsivos',
      },
      pro: {
        en: 'Full design system plus complex flows and handoff documentation',
        pt: 'Design system completo',
      },
    },
  },
  {
    id: 'design.templates_social',
    category: 'design',
    label: { en: 'Social Templates', pt: 'Templates Sociais' },
    description: {
      en: 'Design assets and templates for social media.',
      pt: 'Ativos de design e templates para redes sociais.',
    },
    tierDescriptions: {
      fast: {
        en: 'Pack of 3–5 simple reusable templates',
        pt: 'Pack de 3–5 templates simples reutilizáveis',
      },
      standard: {
        en: 'Pack of 8–12 templates (feed, stories, covers)',
        pt: 'Pack de 8–12 templates (feed, stories, capas)',
      },
      pro: {
        en: 'Large library with 15+ template variations and usage guide',
        pt: 'Biblioteca grande com 15+ variações de templates e guia de uso',
      },
    },
  },
  {
    id: 'design.design_system',
    category: 'design',
    label: { en: 'Design System', pt: 'Sistema de Design' },
    description: {
      en: 'Guides and design systems (components, rules).',
      pt: 'Guias e sistemas de design (componentes, regras).',
    },
    tierDescriptions: {
      fast: {
        en: 'Basic tokens (colors, typography, spacing)',
        pt: 'Tokens básicos (cores, tipografia, espaçamento)',
      },
      standard: {
        en: 'Component library for key UI elements with usage rules',
        pt: 'Biblioteca de componentes para elementos chave de UI + regras de uso',
      },
      pro: {
        en: 'Full multi-platform design system with documentation',
        pt: 'Sistema de design multi-plataforma completo com documentação',
      },
    },
  },
  {
    id: 'design.print_stationery',
    category: 'design',
    label: { en: 'Print & Stationery', pt: 'Impressão e Papelaria' },
    description: {
      en: 'Business cards, letterhead, envelopes, email signature.',
      pt: 'Cartões de visita, papel timbrado, envelopes, assinatura de email.',
    },
    tierDescriptions: {
      fast: {
        en: 'Business card plus simple letterhead',
        pt: 'Cartão de visita + papel timbrado simples',
      },
      standard: {
        en: 'Full stationery pack (cards, letterhead, envelopes, email signature)',
        pt: 'Pack completo de papelaria (cartões, papel timbrado, envelopes, assinatura de email)',
      },
      pro: {
        en: 'Extended pack with extra formats for events and print pieces',
        pt: 'Pack alargado com formatos extra para eventos e peças de impressão',
      },
    },
  },
  {
    id: 'design.event_kit',
    category: 'design',
    label: { en: 'Event Kit', pt: 'Kit de Eventos' },
    description: {
      en: 'Event graphics kit: posters, posts, invites, etc.',
      pt: 'Kit gráfico de eventos: posters, posts, convites, etc.',
    },
    tierDescriptions: {
      fast: {
        en: 'Basic event kit (poster + 2–3 social posts)',
        pt: 'Kit básico de evento (poster + 2–3 posts sociais)',
      },
      standard: {
        en: 'Extended kit (posters, banners, social pack, simple signage)',
        pt: 'Kit alargado (posters, banners, pack social, sinalética simples)',
      },
      pro: {
        en: 'Full event visual identity plus complete offline and online kit',
        pt: 'Identidade visual completa do evento + kit offline & online completo',
      },
    },
  },

  // Web
  {
    id: 'web.landing_page',
    category: 'web',
    label: { en: 'Landing Page', pt: 'Landing Page' },
    description: {
      en: 'Conversion-focused landing page.',
      pt: 'Landing page focada em conversão.',
    },
    tierDescriptions: {
      fast: {
        en: 'Single landing page with simple form',
        pt: 'Landing page única com formulário simples',
      },
      standard: {
        en: 'Landing page with extra sections, thank-you page and tracking',
        pt: 'Landing page com secções extra, página de obrigado e tracking',
      },
      pro: {
        en: 'High-converting funnel (landing + upsell/downsells + tests)',
        pt: 'Funil de alta conversão (landing + upsell/downsells + testes)',
      },
    },
  },
  {
    id: 'web.site_institutional',
    category: 'web',
    label: { en: 'Institutional Site', pt: 'Site Institucional' },
    description: {
      en: 'Institutional website with key pages, CMS and basic SEO.',
      pt: 'Site institucional com páginas chave, CMS e SEO básico.',
    },
    tierDescriptions: {
      fast: {
        en: 'Up to ~4 sections / 1–3 pages, simple layout',
        pt: 'Site com Layout simples',
      },
      standard: {
        en: 'Multi-page site (4–8 pages) plus blog or news',
        pt: 'Site multi-página + notícias',
      },
      pro: {
        en: 'Larger site (10+ pages), custom sections and integrations',
        pt: 'Site com secções customizadas',
      },
    },
  },
  {
    id: 'web.catalog',
    category: 'web',
    label: { en: 'Digital Catalog', pt: 'Catálogo Digital' },
    description: {
      en: 'Online catalog with search & filters.',
      pt: 'Catálogo online com pesquisa e filtros.',
    },
    tierDescriptions: {
      fast: {
        en: 'Small online catalog with basic filtering',
        pt: 'Catálogo online pequeno com filtros básicos',
      },
      standard: {
        en: 'Medium catalog with categories, search and admin area',
        pt: 'Catálogo médio com categorias, pesquisa e área de gestão',
      },
      pro: {
        en: 'Large catalog with advanced filters, comparisons and integrations',
        pt: 'Catálogo grande com filtros avançados, comparações e integrações',
      },
    },
  },
  {
    id: 'web.ecommerce',
    category: 'web',
    label: { en: 'E-commerce', pt: 'E-commerce' },
    description: {
      en: 'Online store setup (products, cart, checkout).',
      pt: 'Loja online (produtos, carrinho, checkout).',
    },
    tierDescriptions: {
      fast: {
        en: 'Small store (up to ~20 products), basic checkout',
        pt: 'Loja pequena (até ~20 produtos), checkout básico',
      },
      standard: {
        en: 'Medium store (up to ~100 products) plus coupons and basic automation',
        pt: 'Loja média (até ~100 produtos) + cupões e automações básicas',
      },
      pro: {
        en: 'Large store plus complex catalogs and advanced automations/integrations',
        pt: 'Loja grande + catálogos complexos + automações e integrações avançadas',
      },
    },
  },
  {
    id: 'web.booking_system',
    category: 'web',
    label: { en: 'Booking System', pt: 'Sistema de Reservas' },
    description: {
      en: 'Booking/appointments page + schedule + reminders.',
      pt: 'Página de reservas/marcações + agenda + lembretes.',
    },
    tierDescriptions: {
      fast: {
        en: 'Simple booking page with basic calendar',
        pt: 'Página de reservas simples com calendário básico',
      },
      standard: {
        en: 'Booking system with confirmations, reminders and admin view',
        pt: 'Sistema de reservas com confirmações, lembretes e vista de gestão',
      },
      pro: {
        en: 'Advanced booking platform with payments, resources and integrations',
        pt: 'Plataforma de reservas avançada com pagamentos, recursos e integrações',
      },
    },
  },
  {
    id: 'web.event_site',
    category: 'web',
    label: { en: 'Event Site', pt: 'Site de Eventos' },
    description: {
      en: 'Event page + registration forms + analytics.',
      pt: 'Página de evento + formulários de registo + analítica.',
    },
    tierDescriptions: {
      fast: {
        en: 'Single event page with key info and signup form',
        pt: 'Página única de evento com info principal e formulário de inscrição',
      },
      standard: {
        en: 'Event mini-site with schedule, speakers and email automation',
        pt: 'Mini-site de evento com programa, speakers e automações de email',
      },
      pro: {
        en: 'Full event site with multi-day agenda, ticketing and integrations',
        pt: 'Site de evento completo com agenda multi-dia, bilhética e integrações',
      },
    },
  },
  {
    id: 'web.ar_activation_page',
    category: 'web',
    label: { en: 'AR Activation Page', pt: 'Página de Ativação AR' },
    description: {
      en: 'Activation/microsite for AR/VR experience.',
      pt: 'Ativação/microsite para experiência AR/VR.',
    },
    tierDescriptions: {
      fast: {
        en: 'Simple landing to host 1 AR experience',
        pt: 'Landing simples para 1 experiência AR',
      },
      standard: {
        en: 'Activation site with 1–2 AR experiences and instructions',
        pt: 'Site de ativação com 1–2 experiências AR e instruções',
      },
      pro: {
        en: 'Rich microsite with multiple AR/VR scenes and gamified flows',
        pt: 'Microsite rico com múltiplas cenas AR/VR e fluxos gamificados',
      },
    },
  },
  {
    id: 'web.seo_technical',
    category: 'web',
    label: { en: 'SEO Technical', pt: 'SEO Técnico' },
    description: {
      en: 'Technical SEO & performance optimization.',
      pt: 'SEO técnico e otimização de performance.',
    },
    tierDescriptions: {
      fast: {
        en: 'Quick SEO/technical audit and key fixes',
        pt: 'Auditoria técnica e correções principais',
      },
      standard: {
        en: 'Full on-page optimization for core templates and pages',
        pt: 'Otimização on-page completa para templates e páginas principais',
      },
      pro: {
        en: 'Deep technical SEO, performance work and structured data',
        pt: 'Trabalho profundo de SEO técnico, performance e dados estruturados',
      },
    },
  },
  {
    id: 'web.integrations',
    category: 'web',
    label: { en: 'Integrations', pt: 'Integrações' },
    description: {
      en: 'Integrations & automations (CMS, DB, APIs).',
      pt: 'Integrações e automações (CMS, BD, APIs).',
    },
    tierDescriptions: {
      fast: {
        en: '1 simple integration (e.g. form → email/Sheets)',
        pt: '1 integração simples (ex: formulário → email/Sheets)',
      },
      standard: {
        en: '2–3 integrations between site, CRM and tools',
        pt: '2–3 integrações entre site, CRM e ferramentas',
      },
      pro: {
        en: 'Complex automations with multiple systems and error handling',
        pt: 'Automações complexas com múltiplos sistemas e gestão de erros',
      },
    },
  },
  {
    id: 'web.analytics',
    category: 'web',
    label: { en: 'Web Analytics', pt: 'Analítica Web' },
    description: {
      en: 'Analytics setup and dashboards.',
      pt: 'Configuração de analítica e dashboards.',
    },
    tierDescriptions: {
      fast: {
        en: 'Basic analytics (pageviews, events) + simple dashboard',
        pt: 'Analítica básica (pageviews, eventos) + dashboard simples',
      },
      standard: {
        en: 'Custom events + conversion tracking + monthly report',
        pt: 'Eventos customizados + tracking de conversões + relatório mensal',
      },
      pro: {
        en: 'Advanced funnels, user journeys, multi-property dashboards',
        pt: 'Funis avançados, jornadas, dashboards multi-propriedade',
      },
    },
  },

  // IA
  {
    id: 'ia.chatbot_support',
    category: 'ia',
    label: { en: 'Chatbot Support', pt: 'Chatbot de Suporte' },
    description: {
      en: 'General support chatbot (site or WhatsApp).',
      pt: 'Chatbot de suporte geral (site ou WhatsApp).',
    },
    tierDescriptions: {
      fast: {
        en: 'FAQ chatbot for 1 channel with basic flows',
        pt: 'Chatbot de FAQ para 1 canal com fluxos básicos',
      },
      standard: {
        en: 'Smarter support bot for 1–2 channels with intent routing',
        pt: 'Bot de suporte mais inteligente para 1–2 canais com routing de intenções',
      },
      pro: {
        en: 'Advanced assistant with escalation, integrations and reporting',
        pt: 'Assistente avançado com escalonamento, integrações e reporting',
      },
    },
  },
  {
    id: 'ia.chatbot_booking',
    category: 'ia',
    label: { en: 'Chatbot Booking', pt: 'Chatbot de Reservas' },
    description: {
      en: 'Chatbot for reservations/booking.',
      pt: 'Chatbot para reservas/marcações.',
    },
    tierDescriptions: {
      fast: {
        en: 'Simple booking bot for 1 service and basic slots',
        pt: 'Bot de reservas simples para 1 serviço e slots básicos',
      },
      standard: {
        en: 'Booking bot with multiple services, confirmations and reminders',
        pt: 'Bot de reservas com múltiplos serviços, confirmações e lembretes',
      },
      pro: {
        en: 'Full booking assistant with payments and calendar integrations',
        pt: 'Assistente de reservas completo com pagamentos e integrações de calendário',
      },
    },
  },
  {
    id: 'ia.chatbot_billing',
    category: 'ia',
    label: { en: 'Chatbot Billing', pt: 'Chatbot de Faturação' },
    description: {
      en: 'Chatbot for invoices/faturação.',
      pt: 'Chatbot para faturas/faturação.',
    },
    tierDescriptions: {
      fast: {
        en: 'Bot that answers basic billing questions',
        pt: 'Bot que responde a questões básicas de faturação',
      },
      standard: {
        en: 'Bot that fetches invoices and sends payment links',
        pt: 'Bot que vai buscar faturas e envia links de pagamento',
      },
      pro: {
        en: 'Billing assistant integrated with invoicing and CRM systems',
        pt: 'Assistente de faturação integrado com sistemas de faturação e CRM',
      },
    },
  },
  {
    id: 'ia.assistant_internal',
    category: 'ia',
    label: { en: 'Internal Assistant', pt: 'Assistente Interno' },
    description: {
      en: 'Internal copilot/dashboard (dashboards & copilots).',
      pt: 'Copilot interno/dashboard (dashboards & copilots).',
    },
    tierDescriptions: {
      fast: {
        en: 'Internal copilot for FAQ and documentation search',
        pt: 'Copilot interno para FAQ e pesquisa em documentação',
      },
      standard: {
        en: 'Internal assistant for 1–2 teams with dashboards and summaries',
        pt: 'Assistente interno para 1–2 equipas com dashboards e resumos',
      },
      pro: {
        en: 'Company-wide copilot integrated with tools and data sources',
        pt: 'Copilot transversal à empresa integrado com ferramentas e fontes de dados',
      },
    },
  },
  {
    id: 'ia.workflows_n8n',
    category: 'ia',
    label: { en: 'n8n Workflows', pt: 'Workflows n8n' },
    description: {
      en: 'Automations in n8n (lead routing, email, etc.).',
      pt: 'Automações no n8n (encaminhamento de leads, email, etc.).',
    },
    tierDescriptions: {
      fast: {
        en: '1 simple workflow (e.g. lead → email/Sheet)',
        pt: '1 workflow simples (ex: lead → email/Sheet)',
      },
      standard: {
        en: '2–3 workflows connecting several tools',
        pt: '2–3 workflows a ligar várias ferramentas',
      },
      pro: {
        en: 'Full automation map with many workflows and monitoring',
        pt: 'Mapa de automações com vários workflows e monitorização',
      },
    },
  },
  {
    id: 'ia.rag_content',
    category: 'ia',
    label: { en: 'RAG Content', pt: 'Conteúdo RAG' },
    description: {
      en: 'RAG & content automation (FAQs, docs-based bots).',
      pt: 'RAG e automação de conteúdo (FAQs, bots baseados em documentos).',
    },
    tierDescriptions: {
      fast: {
        en: 'Small RAG bot over 1–2 documents/FAQs',
        pt: 'Bot RAG pequeno sobre 1–2 documentos/FAQs',
      },
      standard: {
        en: 'Assistant over a structured knowledge base with updates',
        pt: 'Assistente sobre base de conhecimento estruturada com atualizações',
      },
      pro: {
        en: 'Robust RAG system with search, sources and admin tooling',
        pt: 'Sistema RAG robusto com pesquisa, fontes e ferramentas de gestão',
      },
    },
  },
  {
    id: 'ia.auto_replies_basic',
    category: 'ia',
    label: { en: 'Auto Replies Basic', pt: 'Respostas Automáticas' },
    description: {
      en: 'Auto-replies + contact capture.',
      pt: 'Respostas automáticas + captura de contacto.',
    },
    tierDescriptions: {
      fast: {
        en: 'Simple auto-replies and contact capture in 1 channel',
        pt: 'Respostas automáticas simples e captura de contacto num canal',
      },
      standard: {
        en: 'Rules-based auto-replies for common scenarios in 1–2 channels',
        pt: 'Auto-replies com regras para cenários comuns em 1–2 canais',
      },
      pro: {
        en: 'Smart auto-replies powered by AI and integrated with CRM',
        pt: 'Respostas automáticas inteligentes com IA e integração com CRM',
      },
    },
  },
  {
    id: 'ia.events_ai_assistant',
    category: 'ia',
    label: { en: 'Events AI Assistant', pt: 'Assistente IA Eventos' },
    description: {
      en: 'AI assistant for event FAQ + smart ticketing.',
      pt: 'Assistente IA para FAQ de eventos + bilhética inteligente.',
    },
    tierDescriptions: {
      fast: {
        en: 'Event FAQ assistant for 1 channel',
        pt: 'Assistente de FAQ de evento para 1 canal',
      },
      standard: {
        en: 'Assistant that handles FAQ plus basic registration/ticketing',
        pt: 'Assistente que trata FAQ + registo/bilhética básica',
      },
      pro: {
        en: 'Full events assistant across multiple channels and systems',
        pt: 'Assistente completo de eventos em múltiplos canais e sistemas',
      },
    },
  },
  {
    id: 'ia.local_seo_automation',
    category: 'ia',
    label: { en: 'Local SEO Automation', pt: 'Automação SEO Local' },
    description: {
      en: '50 citations/reviews + content tweaks.',
      pt: '50 citações/reviews + ajustes de conteúdo.',
    },
    tierDescriptions: {
      fast: {
        en: 'Basic setup plus a batch of local citations/reviews',
        pt: 'Setup básico + um conjunto de citações/reviews locais',
      },
      standard: {
        en: 'Ongoing local SEO routines plus monthly review push',
        pt: 'Rotinas contínuas de SEO local + impulso mensal de reviews',
      },
      pro: {
        en: 'Scaled local SEO automation across many locations',
        pt: 'Automação de SEO local em escala para múltiplas localizações',
      },
    },
  },
  {
    id: 'ia.reporting',
    category: 'ia',
    label: { en: 'IA Reporting', pt: 'Relatórios IA' },
    description: {
      en: 'Automated monthly reports.',
      pt: 'Relatórios mensais automatizados.',
    },
    tierDescriptions: {
      fast: {
        en: 'Automated monthly summary via email',
        pt: 'Resumo mensal automatizado por email',
      },
      standard: {
        en: 'Monthly report with charts and simple commentary',
        pt: 'Relatório mensal com gráficos e comentário simples',
      },
      pro: {
        en: 'Custom dashboards plus scheduled reports and alerts',
        pt: 'Dashboards customizados + relatórios e alertas agendados',
      },
    },
  },

  // Apps
  {
    id: 'apps.mvp_prototype',
    category: 'apps',
    label: { en: 'MVP Prototype', pt: 'Protótipo MVP' },
    description: {
      en: 'Navigable prototype, core screens, v1 web/app.',
      pt: 'Protótipo navegável, ecrãs principais, web/app v1.',
    },
    tierDescriptions: {
      fast: {
        en: 'Clickable prototype of the core flow',
        pt: 'Protótipo clicável do fluxo principal',
      },
      standard: {
        en: 'Prototype plus polished UI for key journeys',
        pt: 'Protótipo + UI polida para jornadas principais',
      },
      pro: {
        en: 'Prototype plus technical spike and roadmap for full product',
        pt: 'Protótipo + exploração técnica e roadmap para produto completo',
      },
    },
  },
  {
    id: 'apps.react_native_app',
    category: 'apps',
    label: { en: 'React Native App', pt: 'App React Native' },
    description: {
      en: 'Full iOS/Android app (React Native).',
      pt: 'App completa iOS/Android (React Native).',
    },
    tierDescriptions: {
      fast: {
        en: 'Slim v1 with core features on 1 platform',
        pt: 'v1 enxuta com funcionalidades nucleares numa plataforma',
      },
      standard: {
        en: 'Full app on iOS + Android with main modules',
        pt: 'App completa em iOS + Android com módulos principais',
      },
      pro: {
        en: 'Advanced app with extra modules, performance work and integrations',
        pt: 'App avançada com módulos extra, performance e integrações',
      },
    },
  },
  {
    id: 'apps.pwa',
    category: 'apps',
    label: { en: 'PWA', pt: 'PWA' },
    description: {
      en: 'PWA / multi-platform app.',
      pt: 'PWA / app multi-plataforma.',
    },
    tierDescriptions: {
      fast: {
        en: 'Simple PWA for 1 main use case',
        pt: 'PWA simples para 1 caso de uso principal',
      },
      standard: {
        en: 'PWA with offline basics and installability',
        pt: 'PWA com offline básico e instalabilidade',
      },
      pro: {
        en: 'Rich multi-platform PWA with advanced caching and integrations',
        pt: 'PWA multi-plataforma rica com caching avançado e integrações',
      },
    },
  },
  {
    id: 'apps.booking_app',
    category: 'apps',
    label: { en: 'Booking App', pt: 'App de Reservas' },
    description: {
      en: 'Booking/appointments app.',
      pt: 'App de reservas/marcações.',
    },
    tierDescriptions: {
      fast: {
        en: 'Basic booking app for 1 service type',
        pt: 'App de reservas básica para 1 tipo de serviço',
      },
      standard: {
        en: 'Booking app with multiple services and notifications',
        pt: 'App de reservas com múltiplos serviços e notificações',
      },
      pro: {
        en: 'Full booking product with payments, resources and admin area',
        pt: 'Produto de reservas completo com pagamentos, recursos e área de gestão',
      },
    },
  },
  {
    id: 'apps.ar_vr_experience',
    category: 'apps',
    label: { en: 'AR/VR Experience', pt: 'Experiência AR/VR' },
    description: {
      en: 'AR/VR rooms and experiences.',
      pt: 'Salas e experiências AR/VR.',
    },
    tierDescriptions: {
      fast: {
        en: 'Single AR/VR scene or small experience',
        pt: 'Cena única ou experiência AR/VR pequena',
      },
      standard: {
        en: 'Multi-scene AR/VR experience with simple UI',
        pt: 'Experiência AR/VR multi-cenário com UI simples',
      },
      pro: {
        en: 'Rich AR/VR product with interactions, levels and analytics',
        pt: 'Produto AR/VR rico com interações, níveis e analítica',
      },
    },
  },
  {
    id: 'apps.publication_analytics',
    category: 'apps',
    label: { en: 'Publication & Analytics', pt: 'Publicação & Analítica' },
    description: {
      en: 'Store publication + analytics setup.',
      pt: 'Publicação em loja + configuração de analítica.',
    },
    tierDescriptions: {
      fast: {
        en: 'Store publication plus basic analytics events',
        pt: 'Publicação em loja + eventos de analítica básicos',
      },
      standard: {
        en: 'Store publication plus full analytics and crash logging',
        pt: 'Publicação em loja + analítica completa e registo de crashes',
      },
      pro: {
        en: 'Publication plus advanced analytics dashboards and experiments',
        pt: 'Publicação + dashboards de analítica avançada e experiências',
      },
    },
  },
  {
    id: 'apps.cicd_performance',
    category: 'apps',
    label: { en: 'CI/CD & Performance', pt: 'CI/CD & Performance' },
    description: {
      en: 'CI/CD setup + performance optimization.',
      pt: 'Configuração de CI/CD + otimização de performance.',
    },
    tierDescriptions: {
      fast: {
        en: 'Simple CI/CD pipeline plus basic checks',
        pt: 'Pipeline CI/CD simples + checks básicos',
      },
      standard: {
        en: 'Robust CI/CD with staging and automated tests',
        pt: 'CI/CD robusto com staging e testes automatizados',
      },
      pro: {
        en: 'Full DevOps setup with performance monitoring and alerts',
        pt: 'Setup DevOps completo com monitorização de performance e alertas',
      },
    },
  },
];


// ⬇️ Now move getLocalizedData here from the bottom of the old constants.ts
export const getLocalizedData = (lang: 'en' | 'pt') => {
  return {
    CATEGORIES: RAW_CATEGORIES.map((c) => ({
      ...c,
      label: c.label[lang],
    })),
    TIERS: RAW_TIERS.map((t) => ({
      ...t,
      label: t.label[lang],
    })),
    TIER_DEFINITIONS: RAW_TIER_DEFINITIONS.map((td) => ({
      ...td,
      label: td.label[lang],
      description: td.description[lang],
    })),
    ATOMIC_SERVICES: RAW_ATOMIC_SERVICES.map((s) => ({
      ...s,
      label: s.label[lang],
      description: s.description[lang],
      // NEW: localize tierDescriptions if present
      tierDescriptions: s.tierDescriptions
        ? (Object.fromEntries(
            Object.entries(s.tierDescriptions).map(([tier, value]) => [
              tier,
              value[lang],
            ])
          ) as Record<Tier, string>)
        : undefined,
    })),
  };
};

