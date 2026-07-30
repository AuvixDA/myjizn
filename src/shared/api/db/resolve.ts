import { db } from './schema';
import { ENTITY_TABLE } from './tables';
import type { EntityId, EntityKind } from '../../types/entity';

// Search only indexes ids/kinds (see shared/lib/search) — the display
// title always comes from Dexie, the single source of truth, per PRD
// "Event Bus" rule of never trusting payloads for current state.
export async function resolveEntityTitle(kind: EntityKind, id: EntityId): Promise<string | undefined> {
  const table = db[ENTITY_TABLE[kind]] as unknown as { get: (id: EntityId) => Promise<unknown> };
  const record = await table.get(id);
  if (!record) return undefined;

  switch (kind) {
    case 'diary':
      return (record as { content: string }).content;
    case 'finance': {
      const finance = record as { category: string; amount: number };
      return `${finance.category} · ${finance.amount}`;
    }
    default:
      return (record as { title: string }).title;
  }
}
