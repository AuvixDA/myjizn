import type { BaseEntity } from '../../../shared/types/entity';

export interface Habit extends BaseEntity {
  title: string;
  frequency: 'daily' | 'weekly';
  checkedDates: string[]; // ISO date strings, e.g. "2026-07-30"
  streak: number;
}
