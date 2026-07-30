import { useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { db } from '../../../shared/api/db/schema';
import { reindexEntity, getIncomingRelations } from '../../../shared/api/db/relations';
import { indexRecord } from '../../../shared/lib/search/searchClient';
import { eventBus } from '../../../shared/lib/event-bus';
import type { Goal } from '../model/types';

export const GOALS_QUERY_KEY = ['goals'] as const;

export interface CreateGoalInput {
  title: string;
  description?: string;
  targetDate?: number;
}

export async function createGoal(input: CreateGoalInput): Promise<Goal> {
  const now = Date.now();
  const goal: Goal = {
    id: uuid(),
    createdAt: now,
    updatedAt: now,
    relations: [],
    title: input.title,
    description: input.description,
    status: 'active',
    targetDate: input.targetDate,
    progress: 0,
  };
  await db.goals.add(goal);
  reindexEntity('goal', goal);
  indexRecord({ id: goal.id, kind: 'goal', title: goal.title });
  eventBus.emit({ type: 'goal.created', payload: { id: goal.id } });
  return goal;
}

// Progress = share of linked tasks (relation type "supports") that are done.
// Recomputed on demand rather than stored redundantly on every task write.
export async function recomputeGoalProgress(goalId: string): Promise<number> {
  const incoming = getIncomingRelations(goalId).filter(
    (r) => r.sourceType === 'task' && r.relation.type === 'supports',
  );
  if (incoming.length === 0) return 0;

  const tasks = await db.tasks.bulkGet(incoming.map((r) => r.sourceId));
  const done = tasks.filter((t) => t?.status === 'done').length;
  const progress = Math.round((done / incoming.length) * 100);

  await db.goals.update(goalId, { progress, updatedAt: Date.now() });
  return progress;
}

export function useGoals() {
  return useQuery({
    queryKey: GOALS_QUERY_KEY,
    queryFn: () => db.goals.orderBy('updatedAt').reverse().toArray(),
  });
}

export function useGoalEventsSync(): void {
  const queryClient = useQueryClient();
  useEffect(() => {
    const invalidate = () => queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY });
    const unsubCreated = eventBus.on('goal.created', invalidate);
    const unsubUpdated = eventBus.on('goal.updated', invalidate);
    // A completed task may change a linked goal's progress.
    const unsubTaskCompleted = eventBus.on('task.completed', invalidate);
    return () => {
      unsubCreated();
      unsubUpdated();
      unsubTaskCompleted();
    };
  }, [queryClient]);
}
