import { useState, useEffect } from 'react';
import { searchEntities } from '../../shared/lib/search/searchClient';
import { resolveEntityTitle } from '../../shared/api/db/resolve';
import type { SearchHit } from '../../shared/lib/search/types';
import { GlassCard } from '../../shared/ui/GlassCard';
import { Input } from '../../shared/ui/Input';
import { ENTITY_KIND_LABEL } from '../../shared/config/labels';

interface ResolvedHit extends SearchHit {
  title: string;
}

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<ResolvedHit[]>([]);

  useEffect(() => {
    let cancelled = false;

    searchEntities(query).then(async (result) => {
      const resolved = await Promise.all(
        result.map(async (hit) => ({ ...hit, title: (await resolveEntityTitle(hit.kind, hit.id)) ?? '' })),
      );
      if (!cancelled) setHits(resolved.filter((hit) => hit.title));
    });

    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Поиск</h1>
      <Input
        autoFocus
        aria-label="Поиск"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Искать по всем сущностям…"
        className="px-4 py-3"
      />
      <div className="flex flex-col gap-2">
        {hits.map((hit, i) => (
          <GlassCard key={`${hit.kind}-${hit.id}`} delay={i * 0.03} className="flex items-center gap-3 py-2.5">
            <span className="shrink-0 text-xs uppercase tracking-wide text-white/40">
              {ENTITY_KIND_LABEL[hit.kind]}
            </span>
            <span className="truncate text-sm text-white/90">{hit.title}</span>
          </GlassCard>
        ))}
        {query && hits.length === 0 && <p className="text-white/55 text-sm">Ничего не найдено</p>}
      </div>
    </div>
  );
}
