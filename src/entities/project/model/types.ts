import type { BaseEntity } from '../../../shared/types/entity';

export interface Project extends BaseEntity {
  title: string;
  description?: string;
  status: 'active' | 'on-hold' | 'completed' | 'archived';
}
