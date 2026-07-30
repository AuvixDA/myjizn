import type { BaseEntity } from '../../../shared/types/entity';

export interface Goal extends BaseEntity {
  title: string;
  description?: string;
  status: 'active' | 'paused' | 'completed' | 'archived';
  targetDate?: number;
  progress: number; // 0..100, derived from linked task/habit completion
}
