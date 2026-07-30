import type { EntityId, EntityKind } from '../../types/entity';

export interface SearchableRecord {
  id: EntityId;
  kind: EntityKind;
  title: string; // main searchable text, e.g. Task.title, Note.title + content
}

export interface SearchHit {
  id: EntityId;
  kind: EntityKind;
}

export type SearchWorkerRequest =
  | { type: 'index'; records: SearchableRecord[] }
  | { type: 'upsert'; record: SearchableRecord }
  | { type: 'query'; queryId: number; text: string };

export type SearchWorkerResponse = { type: 'result'; queryId: number; hits: SearchHit[] };
