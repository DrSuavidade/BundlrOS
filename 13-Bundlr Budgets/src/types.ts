export type Category = 'marketing' | 'design' | 'web' | 'ia' | 'apps';
export type Tier = 'fast' | 'standard' | 'pro';

export interface AtomicService {
  id: string;
  category: Category;
  label: string;
  description: string;
  tierDescriptions?: Record<Tier, string>;
}

export interface TierDefinition {
  category: Category;
  tier: Tier;
  label: string;
  description: string; // The scope definition (bullet points usually)
}

export interface SelectedService {
  serviceId: string;
  tier: Tier;
}

// Internal state structure for easier manipulation
export interface BudgetSelectionState {
  [category: string]: {
    tier: Tier;
    serviceIds: string[];
  };
}

export interface Budget {
  id: string;
  clientId: string; // Linked to Module 2: Client
  contractId: string; // Linked to Module 2: Contract
  clientName: string; // Cached for display, but ID is source of truth
  projectName: string;
  notes?: string;
  // The final output format requested
  items: SelectedService[];
  // Helper for UI state reconstruction, strictly implies the derived data
  _meta?: BudgetSelectionState;
}

export interface PlanSummary {
  tier: Tier;
  totalHours: number;
  totalPrice: number;
}

export interface TemplateBudgetOutput {
  id: string;
  clientName: string;
  projectName: string;
  notes?: string;
  // High-level summary for the three bundles (Fast / Standard / Pro)
  plans: PlanSummary[];
}
export interface TemplatePlan {
  tier: Tier;
  totalHours: number;
  totalPrice: number;
}

export interface TemplateBudgetOutput {
  id: string;
  clientName: string;
  projectName: string;
  notes?: string;
  plans: TemplatePlan[];
}

