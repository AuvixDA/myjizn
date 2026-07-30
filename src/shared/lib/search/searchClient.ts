import { db } from '../../api/db/schema';
import type { SearchWorkerRequest, SearchWorkerResponse, SearchHit, SearchableRecord } from './types';

let worker: Worker | null = null;
let nextQueryId = 0;
const pending = new Map<number, (hits: SearchHit[]) => void>();

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('./search.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (event: MessageEvent<SearchWorkerResponse>) => {
      const resolve = pending.get(event.data.queryId);
      resolve?.(event.data.hits);
      pending.delete(event.data.queryId);
    };
  }
  return worker;
}

function post(request: SearchWorkerRequest): void {
  getWorker().postMessage(request);
}

// Builds the in-memory index once at startup from all Dexie tables. Called
// alongside buildReverseIndex() in app/main.tsx.
export async function initSearchIndex(): Promise<void> {
  const [goals, tasks, notes, habits, projects, diary, finance] = await Promise.all([
    db.goals.toArray(),
    db.tasks.toArray(),
    db.notes.toArray(),
    db.habits.toArray(),
    db.projects.toArray(),
    db.diary.toArray(),
    db.finance.toArray(),
  ]);

  const records: SearchableRecord[] = [
    ...goals.map((g) => ({ id: g.id, kind: 'goal' as const, title: g.title })),
    ...tasks.map((t) => ({ id: t.id, kind: 'task' as const, title: t.title })),
    ...notes.map((n) => ({ id: n.id, kind: 'note' as const, title: `${n.title} ${n.content}` })),
    ...habits.map((h) => ({ id: h.id, kind: 'habit' as const, title: h.title })),
    ...projects.map((p) => ({ id: p.id, kind: 'project' as const, title: p.title })),
    ...diary.map((d) => ({ id: d.id, kind: 'diary' as const, title: d.content })),
    ...finance.map((f) => ({ id: f.id, kind: 'finance' as const, title: `${f.category} ${f.note ?? ''}` })),
  ];

  post({ type: 'index', records });
}

export function indexRecord(record: SearchableRecord): void {
  post({ type: 'upsert', record });
}

export function removeSearchRecord(id: SearchableRecord['id']): void {
  post({ type: 'remove', id });
}

export function searchEntities(text: string): Promise<SearchHit[]> {
  if (!text.trim()) return Promise.resolve([]);
  const queryId = nextQueryId++;
  return new Promise((resolve) => {
    pending.set(queryId, resolve);
    post({ type: 'query', queryId, text });
  });
}
