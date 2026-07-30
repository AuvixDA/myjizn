import { db } from './schema';
import { ENTITY_TABLE } from './tables';
import { getIncomingRelations, dropIncomingRelations } from './relations';
import { removeSearchRecord } from '../../lib/search/searchClient';
import type { BaseEntity, EntityId, EntityKind } from '../../types/entity';

type EntityTableLike = {
  get: (id: EntityId) => Promise<BaseEntity | undefined>;
  update: (id: EntityId, changes: Partial<BaseEntity>) => Promise<number>;
  delete: (id: EntityId) => Promise<void>;
};

// Deletes an entity and immediately strips it out of any other record's
// `relations[]` (via the reverse index) — a hard delete with synchronous
// Life Graph cleanup instead of the deferred soft-delete+worker sketched in
// the PRD, since the reverse index already gives us the dependents for
// free and there's no benefit to deferring the cleanup.
export async function deleteEntity(kind: EntityKind, id: EntityId): Promise<void> {
  const dependents = getIncomingRelations(id);

  await db.transaction('rw', db.tables, async () => {
    for (const dep of dependents) {
      const table = db[ENTITY_TABLE[dep.sourceType]] as unknown as EntityTableLike;
      const record = await table.get(dep.sourceId);
      if (record) {
        await table.update(dep.sourceId, { relations: record.relations.filter((r) => r.targetId !== id) });
      }
    }
    await (db[ENTITY_TABLE[kind]] as unknown as EntityTableLike).delete(id);
  });

  dropIncomingRelations(id);
  removeSearchRecord(id);
}
