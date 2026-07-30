import { v4 as uuid } from 'uuid';
import { useQuery } from '@tanstack/react-query';
import { db } from '../../../shared/api/db/schema';
import { queryClient } from '../../../shared/api/queryClient';
import { reindexEntity } from '../../../shared/api/db/relations';
import { deleteEntity } from '../../../shared/api/db/delete';
import { indexRecord } from '../../../shared/lib/search/searchClient';
import { eventBus } from '../../../shared/lib/event-bus';
import type { DiaryEntry } from '../model/types';
import type { EntityId } from '../../../shared/types/entity';

export const DIARY_QUERY_KEY = ['diary'] as const;

export interface SaveDiaryEntryInput {
  date: string; // ISO date, e.g. "2026-07-30" — one entry per day
  content: string;
  mood?: DiaryEntry['mood'];
}

// One entry per day: upserts by `date` instead of always inserting, since
// the entity itself has no natural per-day uniqueness constraint in Dexie.
export async function saveDiaryEntry(input: SaveDiaryEntryInput): Promise<DiaryEntry> {
  const existing = await db.diary.where('date').equals(input.date).first();
  const now = Date.now();

  const entry: DiaryEntry = existing
    ? { ...existing, content: input.content, mood: input.mood, updatedAt: now }
    : {
        id: uuid(),
        createdAt: now,
        updatedAt: now,
        relations: [],
        date: input.date,
        content: input.content,
        mood: input.mood,
      };

  await db.diary.put(entry);
  reindexEntity('diary', entry);
  indexRecord({ id: entry.id, kind: 'diary', title: entry.content });
  eventBus.emit({ type: 'diary.saved', payload: { id: entry.id } });
  return entry;
}

export async function deleteDiaryEntry(id: EntityId): Promise<void> {
  await deleteEntity('diary', id);
  eventBus.emit({ type: 'diary.deleted', payload: { id } });
}

export function useDiaryEntries() {
  return useQuery({
    queryKey: DIARY_QUERY_KEY,
    queryFn: () => db.diary.orderBy('date').reverse().toArray(),
  });
}

export function initDiaryEventsSync(): void {
  const invalidate = () => queryClient.invalidateQueries({ queryKey: DIARY_QUERY_KEY });
  eventBus.on('diary.saved', invalidate);
  eventBus.on('diary.deleted', invalidate);
}
