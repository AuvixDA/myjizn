import { v4 as uuid } from 'uuid';
import { useQuery } from '@tanstack/react-query';
import { db } from '../../../shared/api/db/schema';
import { queryClient } from '../../../shared/api/queryClient';
import { reindexEntity } from '../../../shared/api/db/relations';
import { deleteEntity } from '../../../shared/api/db/delete';
import { eventBus } from '../../../shared/lib/event-bus';
import type { FinanceEntry } from '../model/types';
import type { EntityId } from '../../../shared/types/entity';

export const FINANCE_QUERY_KEY = ['finance'] as const;
export const DEFAULT_CURRENCY = 'RUB';

export interface CreateFinanceEntryInput {
  amount: number; // minor units, signed (positive = income, negative = expense)
  category: string;
  note?: string;
  date: number;
  currency?: string;
}

export async function createFinanceEntry(input: CreateFinanceEntryInput): Promise<FinanceEntry> {
  const now = Date.now();
  const entry: FinanceEntry = {
    id: uuid(),
    createdAt: now,
    updatedAt: now,
    relations: [],
    amount: input.amount,
    currency: input.currency ?? DEFAULT_CURRENCY,
    category: input.category,
    note: input.note,
    date: input.date,
  };
  await db.finance.add(entry);
  reindexEntity('finance', entry);
  eventBus.emit({ type: 'finance.created', payload: { id: entry.id, amount: entry.amount } });
  return entry;
}

export interface UpdateFinanceEntryInput {
  amount: number;
  category: string;
  note?: string;
}

export async function updateFinanceEntry(id: EntityId, input: UpdateFinanceEntryInput): Promise<void> {
  await db.finance.update(id, { ...input, updatedAt: Date.now() });
  eventBus.emit({ type: 'finance.updated', payload: { id } });
}

export async function deleteFinanceEntry(id: EntityId): Promise<void> {
  await deleteEntity('finance', id);
  eventBus.emit({ type: 'finance.deleted', payload: { id } });
}

export function useFinanceEntries() {
  return useQuery({
    queryKey: FINANCE_QUERY_KEY,
    queryFn: () => db.finance.orderBy('date').reverse().toArray(),
  });
}

export function initFinanceEventsSync(): void {
  const invalidate = () => queryClient.invalidateQueries({ queryKey: FINANCE_QUERY_KEY });
  eventBus.on('finance.created', invalidate);
  eventBus.on('finance.updated', invalidate);
  eventBus.on('finance.deleted', invalidate);
}
