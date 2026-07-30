import { v4 as uuid } from 'uuid';
import { useQuery } from '@tanstack/react-query';
import { db } from '../../../shared/api/db/schema';
import { queryClient } from '../../../shared/api/queryClient';
import { reindexEntity, getIncomingRelations } from '../../../shared/api/db/relations';
import { deleteEntity } from '../../../shared/api/db/delete';
import { indexRecord } from '../../../shared/lib/search/searchClient';
import { eventBus } from '../../../shared/lib/event-bus';
import type { Goal } from '../model/types';
import type { EntityId } from '../../../shared/types/entity';

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

export async function updateGoalTitle(id: EntityId, title: string): Promise<void> {
  await db.goals.update(id, { title, updatedAt: Date.now() });
  indexRecord({ id, kind: 'goal', title });
  eventBus.emit({ type: 'goal.updated', payload: { id } });
}

export async function deleteGoal(id: EntityId): Promise<void> {
  await deleteEntity('goal', id);
  eventBus.emit({ type: 'goal.deleted', payload: { id } });
}

// Progress = share of linked tasks (relation type "supports") that are done.
// Recomputed on demand rather than stored redundantly on every task write —
// see initGoalEventsSync, which triggers this from task lifecycle events.
export async function recomputeGoalProgress(goalId: EntityId): Promise<void> {
  const incoming = getIncomingRelations(goalId).filter(
    (r) => r.sourceType === 'task' && r.relation.type === 'supports',
  );
  const progress =
    incoming.length === 0
      ? 0
      : Math.round(
          ((await db.tasks.bulkGet(incoming.map((r) => r.sourceId))).filter((t) => t?.status === 'done').length /
            incoming.length) *
            100,
        );

  await db.goals.update(goalId, { progress, updatedAt: Date.now() });
  eventBus.emit({ type: 'goal.updated', payload: { id: goalId } });
}

async function recomputeFromTask(taskId: EntityId): Promise<void> {
  const task = await db.tasks.get(taskId);
  const linkedGoalIds = (task?.relations ?? [])
    .filter((r) => r.type === 'supports' && r.targetType === 'goal')
    .map((r) => r.targetId);
  await Promise.all(linkedGoalIds.map(recomputeGoalProgress));
}

export function useGoals() {
  return useQuery({
    queryKey: GOALS_QUERY_KEY,
    queryFn: () => db.goals.orderBy('updatedAt').reverse().toArray(),
  });
}

// Global subscription, bootstrapped once in app/main.tsx — not a React
// hook, so it stays active (keeping both the query cache and linked goal
// progress correct) whether or not any goal-related page is mounted.
export function initGoalEventsSync(): void {
  const invalidate = () => queryClient.invalidateQueries({ queryKey: GOALS_QUERY_KEY });
  eventBus.on('goal.created', invalidate);
  eventBus.on('goal.updated', invalidate);
  eventBus.on('goal.deleted', invalidate);

  eventBus.on('task.created', ({ payload }) => recomputeFromTask(payload.id));
  eventBus.on('task.completed', ({ payload }) => recomputeFromTask(payload.id));
  eventBus.on('task.deleted', ({ payload }) => {
    payload.linkedGoalIds.forEach(recomputeGoalProgress);
  });
}
