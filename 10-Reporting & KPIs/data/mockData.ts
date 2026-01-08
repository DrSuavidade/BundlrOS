import { KPIRecord, KPIUnit } from "../types";

export const PERIODS = ['October 2023', 'September 2023', 'August 2023'];

export const MOCK_KPIS: KPIRecord[] = [
  // October 2023
  {
    id: '1',
    name: 'Monthly Recurring Revenue',
    value: 124500,
    previousValue: 115000,
    unit: KPIUnit.CURRENCY,
    period: 'October 2023',
    category: 'Financial'
  },
  {
    id: '2',
    name: 'Customer Acquisition Cost',
    value: 345,
    previousValue: 320,
    unit: KPIUnit.CURRENCY,
    period: 'October 2023',
    category: 'Financial'
  },
  {
    id: '3',
    name: 'Monthly Active Users',
    value: 15420,
    previousValue: 14200,
    unit: KPIUnit.NUMBER,
    period: 'October 2023',
    category: 'Growth'
  },
  {
    id: '4',
    name: 'Churn Rate',
    value: 2.1,
    previousValue: 2.4,
    unit: KPIUnit.PERCENTAGE,
    period: 'October 2023',
    category: 'Engagement'
  },
  {
    id: '5',
    name: 'Net Promoter Score',
    value: 48,
    previousValue: 45,
    unit: KPIUnit.NUMBER,
    period: 'October 2023',
    category: 'Engagement'
  },
  {
    id: '6',
    name: 'Gross Margin',
    value: 72,
    previousValue: 71,
    unit: KPIUnit.PERCENTAGE,
    period: 'October 2023',
    category: 'Financial'
  },

  // September 2023
  {
    id: '7',
    name: 'Monthly Recurring Revenue',
    value: 115000,
    previousValue: 112000,
    unit: KPIUnit.CURRENCY,
    period: 'September 2023',
    category: 'Financial'
  },
  {
    id: '8',
    name: 'Customer Acquisition Cost',
    value: 320,
    previousValue: 335,
    unit: KPIUnit.CURRENCY,
    period: 'September 2023',
    category: 'Financial'
  },
    {
    id: '9',
    name: 'Monthly Active Users',
    value: 14200,
    previousValue: 13900,
    unit: KPIUnit.NUMBER,
    period: 'September 2023',
    category: 'Growth'
  },
  {
    id: '10',
    name: 'Churn Rate',
    value: 2.4,
    previousValue: 2.2,
    unit: KPIUnit.PERCENTAGE,
    period: 'September 2023',
    category: 'Engagement'
  },
];
