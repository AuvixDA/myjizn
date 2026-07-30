import type { BaseEntity } from '../../../shared/types/entity';

export interface Note extends BaseEntity {
  title: string;
  content: string;
  pinned: boolean;
}
