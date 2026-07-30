import { useState, useEffect } from 'react';
import { searchEntities } from '../../shared/lib/search/searchClient';
import type { SearchHit } from '../../shared/lib/search/types';
import { GlassCard } from '../../shared/ui/GlassCard';

const KIND_LABEL: Record<SearchHit['kind'], string> = {
  goal: 'Goal',
  task: 'Task',
  habit: 'Habit',
  diary: 'Diary',
  note: 'Note',
  finance: 'Finance',
  project: 'Project',
};

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<SearchHit[]>([]);

  useEffect(() => {
    let cancelled = false;
    searchEntities(query).then((result) => {
      if (!cancelled) setHits(result);
    });
    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <h1 className="text-2xl font-semibold">Search</h1>
      <input
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Искать по всем сущностям…"
        className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-accent"
      />
      <div className="flex flex-col gap-2">
        {hits.map((hit) => (
          <GlassCard key={`${hit.kind}-${hit.id}`} className="flex items-center justify-between py-2">
            <span className="text-xs uppercase tracking-wide text-white/40">{KIND_LABEL[hit.kind]}</span>
            <span className="text-sm text-white/40">{hit.id}</span>
          </GlassCard>
        ))}
        {query && hits.length === 0 && <p className="text-white/40 text-sm">Ничего не найдено</p>}
      </div>
    </div>
  );
}
