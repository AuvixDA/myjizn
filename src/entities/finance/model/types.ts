import type { BaseEntity } from '../../../shared/types/entity';

export interface FinanceEntry extends BaseEntity {
  amount: number; // positive = income, negative = expense, in minor units (cents)
  currency: string; // ISO 4217, e.g. "USD"
  category: string;
  note?: string;
  date: number; // unix ms
}
