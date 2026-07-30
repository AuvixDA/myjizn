export type EntityId = string; // uuid v4

export type EntityKind =
  | 'goal'
  | 'task'
  | 'habit'
  | 'diary'
  | 'note'
  | 'finance'
  | 'project';

export type RelationType =
  | 'blocks'
  | 'supports'
  | 'relates-to'
  | 'derived-from'
  | 'tracks'
  | 'part-of';

export interface Relation {
  targetId: EntityId;
  targetType: EntityKind;
  type: RelationType;
}

export interface BaseEntity {
  id: EntityId;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
  relations: Relation[];
}
