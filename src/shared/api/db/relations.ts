import type { EntityId, EntityKind, Relation, BaseEntity } from '../../types/entity';
import { db } from './schema';

const TABLES: Record<EntityKind, keyof typeof db> = {
  goal: 'goals',
  task: 'tasks',
  habit: 'habits',
  diary: 'diary',
  note: 'notes',
  finance: 'finance',
  project: 'projects',
};

// In-memory reverse index: targetId -> incoming relations.
// Rebuilt once at startup (buildReverseIndex), kept in sync via
// upsertEntity/removeEntity — the Life Graph never scans all tables.
const reverseIndex = new Map<EntityId, Array<{ sourceId: EntityId; sourceType: EntityKind; relation: Relation }>>();

export async function buildReverseIndex(): Promise<void> {
  reverseIndex.clear();
  for (const [kind, table] of Object.entries(TABLES) as [EntityKind, keyof typeof db][]) {
    const rows = (await (db[table] as unknown as { toArray: () => Promise<BaseEntity[]> }).toArray());
    for (const entity of rows) {
      indexRelations(kind, entity);
    }
  }
}

function indexRelations(sourceType: EntityKind, entity: BaseEntity): void {
  for (const relation of entity.relations) {
    const incoming = reverseIndex.get(relation.targetId) ?? [];
    incoming.push({ sourceId: entity.id, sourceType, relation });
    reverseIndex.set(relation.targetId, incoming);
  }
}

export function getIncomingRelations(targetId: EntityId) {
  return reverseIndex.get(targetId) ?? [];
}

// Called after a soft-delete to drop relations pointing at the removed
// entity from the reverse index (the owning records are cleaned up lazily
// by the maintenance worker, see PRD "Life Graph" / "Data Model").
export function dropIncomingRelations(targetId: EntityId): void {
  reverseIndex.delete(targetId);
}

export function reindexEntity(kind: EntityKind, entity: BaseEntity): void {
  indexRelations(kind, entity);
}
