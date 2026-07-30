import FlexSearch from 'flexsearch';
import type { SearchWorkerRequest, SearchWorkerResponse, SearchableRecord } from './types';

// The bundled build only ships a default export (see flexsearch dist),
// there is no named `Document` export to import directly.
const { Document } = FlexSearch;

// Runs off the main thread so indexing/querying never blocks UI rendering
// or input (see PRD "SEARCH" / "PERFORMANCE").
const index = new Document<SearchableRecord, string[]>({
  document: {
    id: 'id',
    index: ['title'],
    store: ['id', 'kind'],
  },
  tokenize: 'forward',
});

self.onmessage = (event: MessageEvent<SearchWorkerRequest>) => {
  const message = event.data;

  if (message.type === 'index') {
    for (const record of message.records) index.add(record);
    return;
  }

  if (message.type === 'upsert') {
    index.update(message.record);
    return;
  }

  if (message.type === 'remove') {
    index.remove(message.id);
    return;
  }

  if (message.type === 'query') {
    const results = index.search<true>(message.text, undefined, { enrich: true });
    const hits = results.flatMap((fieldResult) => fieldResult.result.map((r) => ({ id: r.doc.id, kind: r.doc.kind })));
    const response: SearchWorkerResponse = { type: 'result', queryId: message.queryId, hits };
    (self as unknown as Worker).postMessage(response);
  }
};
