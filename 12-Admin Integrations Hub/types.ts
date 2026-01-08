export enum HealthStatus {
  HEALTHY = 'HEALTHY',
  DEGRADED = 'DEGRADED',
  FAILED = 'FAILED',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING'
}

export interface Provider {
  id: string;
  name: string;
  logo: string;
  defaultFields: string[];
  authType: 'oauth2' | 'apikey' | 'basic';
}

export interface FieldMapping {
  sourceField: string;
  destinationField: string;
  transformer?: string; // e.g., "uppercase", "date_format"
}

export interface IntegrationConfig {
  apiKey?: string; // Stored securely (masked in UI)
  endpointUrl?: string;
  clientId?: string;
  clientSecret?: string;
}

export interface Integration {
  id: string;
  clientId: string;
  providerId: string;
  name: string;
  status: HealthStatus;
  enabled: boolean;
  lastSync?: string;
  config: IntegrationConfig;
  mappings: FieldMapping[];
  logs: LogEntry[];
}

export interface Client {
  id: string;
  name: string;
  contactEmail: string;
  logoUrl?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

// Available Providers (Dynamic registry simulation)
export const PROVIDERS: Record<string, Provider> = {
  salesforce: {
    id: 'salesforce',
    name: 'Salesforce CRM',
    logo: 'SF',
    defaultFields: ['Id', 'FirstName', 'LastName', 'Email', 'Company', 'Phone', 'Status'],
    authType: 'oauth2'
  },
  hubspot: {
    id: 'hubspot',
    name: 'HubSpot',
    logo: 'HS',
    defaultFields: ['vid', 'firstname', 'lastname', 'email', 'company', 'phone', 'lifecyclestage'],
    authType: 'apikey'
  },
  shopify: {
    id: 'shopify',
    name: 'Shopify',
    logo: 'SH',
    defaultFields: ['id', 'first_name', 'last_name', 'email', 'orders_count', 'total_spent', 'tags'],
    authType: 'apikey'
  },
  slack: {
    id: 'slack',
    name: 'Slack Notifications',
    logo: 'SL',
    defaultFields: ['channel_id', 'message_ts', 'user_id', 'text'],
    authType: 'oauth2'
  }
};