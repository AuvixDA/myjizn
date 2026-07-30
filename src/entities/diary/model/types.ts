import type { BaseEntity } from '../../../shared/types/entity';

export interface DiaryEntry extends BaseEntity {
  date: string; // ISO date, one entry per day
  content: string;
  mood?: 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
}
