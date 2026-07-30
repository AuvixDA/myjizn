import type { EntityKind } from '../../types/entity';
import type { db } from './schema';

export const ENTITY_TABLE: Record<EntityKind, keyof typeof db> = {
  goal: 'goals',
  task: 'tasks',
  habit: 'habits',
  diary: 'diary',
  note: 'notes',
  finance: 'finance',
  project: 'projects',
};
