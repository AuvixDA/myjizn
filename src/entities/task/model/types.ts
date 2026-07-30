import type { BaseEntity } from '../../../shared/types/entity';

export interface Task extends BaseEntity {
  title: string;
  notes?: string;
  status: 'todo' | 'in-progress' | 'done';
  dueDate?: number;
  priority: 'low' | 'medium' | 'high';
  completedAt?: number;
}
