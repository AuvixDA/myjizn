import { v4 as uuid } from 'uuid';
import { useQuery } from '@tanstack/react-query';
import { db } from '../../../shared/api/db/schema';
import { reindexEntity } from '../../../shared/api/db/relations';
import { indexRecord } from '../../../shared/lib/search/searchClient';
import { eventBus } from '../../../shared/lib/event-bus';
import type { Note } from '../model/types';
import type { Relation } from '../../../shared/types/entity';

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

export function useNotes() {
  return useQuery({
    queryKey: NOTES_QUERY_KEY,
    queryFn: () => db.notes.orderBy('updatedAt').reverse().toArray(),
  });
}
