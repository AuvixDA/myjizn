import { v4 as uuid } from 'uuid';
import { useQuery } from '@tanstack/react-query';
import { db } from '../../../shared/api/db/schema';
import { queryClient } from '../../../shared/api/queryClient';
import { reindexEntity } from '../../../shared/api/db/relations';
import { deleteEntity } from '../../../shared/api/db/delete';
import { indexRecord } from '../../../shared/lib/search/searchClient';
import { eventBus } from '../../../shared/lib/event-bus';
import type { Note } from '../model/types';
import type { EntityId, Relation } from '../../../shared/types/entity';

export const NOTES_QUERY_KEY = ['notes'] as const;

export interface CreateNoteInput {
  title: string;
  content: string;
  relations?: Relation[];
}

export async function createNote(input: CreateNoteInput): Promise<Note> {
  const now = Date.now();
  const note: Note = {
    id: uuid(),
    createdAt: now,
    updatedAt: now,
    relations: input.relations ?? [],
    title: input.title,
    content: input.content,
    pinned: false,
  };
  await db.notes.add(note);
  reindexEntity('note', note);
  indexRecord({ id: note.id, kind: 'note', title: `${note.title} ${note.content}` });
  eventBus.emit({ type: 'note.created', payload: { id: note.id } });
  return note;
}

export interface UpdateNoteInput {
  title: string;
  content: string;
}

export async function updateNote(id: EntityId, input: UpdateNoteInput): Promise<void> {
  await db.notes.update(id, { ...input, updatedAt: Date.now() });
  indexRecord({ id, kind: 'note', title: `${input.title} ${input.content}` });
  eventBus.emit({ type: 'note.updated', payload: { id } });
}

export async function deleteNote(id: EntityId): Promise<void> {
  await deleteEntity('note', id);
  eventBus.emit({ type: 'note.deleted', payload: { id } });
}

export function useNotes() {
  return useQuery({
    queryKey: NOTES_QUERY_KEY,
    queryFn: () => db.notes.orderBy('updatedAt').reverse().toArray(),
  });
}

// Global subscription, bootstrapped once in app/main.tsx (see taskApi's
// initTaskEventsSync for why this isn't a component-scoped hook).
export function initNoteEventsSync(): void {
  const invalidate = () => queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
  eventBus.on('note.created', invalidate);
  eventBus.on('note.updated', invalidate);
  eventBus.on('note.deleted', invalidate);
}
