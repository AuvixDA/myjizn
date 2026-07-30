import { v4 as uuid } from 'uuid';
import { useQuery } from '@tanstack/react-query';
import { db } from '../../../shared/api/db/schema';
import { queryClient } from '../../../shared/api/queryClient';
import { reindexEntity } from '../../../shared/api/db/relations';
import { deleteEntity } from '../../../shared/api/db/delete';
import { indexRecord } from '../../../shared/lib/search/searchClient';
import { eventBus } from '../../../shared/lib/event-bus';
import type { Task } from '../model/types';
import type { EntityId, Relation } from '../../../shared/types/entity';

export const TASKS_QUERY_KEY = ['tasks'] as const;

export interface CreateTaskInput {
  title: string;
  dueDate?: number;
  priority?: Task['priority'];
  relations?: Relation[];
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const now = Date.now();
  const task: Task = {
    id: uuid(),
    createdAt: now,
    updatedAt: now,
    relations: input.relations ?? [],
    title: input.title,
    status: 'todo',
    priority: input.priority ?? 'medium',
    dueDate: input.dueDate,
  };
  await db.tasks.add(task);
  reindexEntity('task', task);
  indexRecord({ id: task.id, kind: 'task', title: task.title });
  eventBus.emit({ type: 'task.created', payload: { id: task.id } });
  return task;
}

export async function completeTask(id: string): Promise<void> {
  const completedAt = Date.now();
  await db.tasks.update(id, { status: 'done', completedAt, updatedAt: completedAt });
  eventBus.emit({ type: 'task.completed', payload: { id, completedAt } });
}

export async function updateTaskTitle(id: EntityId, title: string): Promise<void> {
  await db.tasks.update(id, { title, updatedAt: Date.now() });
  indexRecord({ id, kind: 'task', title });
  eventBus.emit({ type: 'task.updated', payload: { id } });
}

export async function deleteTask(id: EntityId): Promise<void> {
  const task = await db.tasks.get(id);
  const linkedGoalIds = (task?.relations ?? [])
    .filter((r) => r.type === 'supports' && r.targetType === 'goal')
    .map((r) => r.targetId);

  await deleteEntity('task', id);
  eventBus.emit({ type: 'task.deleted', payload: { id, linkedGoalIds } });
}

export function useTasks() {
  return useQuery({
    queryKey: TASKS_QUERY_KEY,
    queryFn: () => db.tasks.orderBy('updatedAt').reverse().toArray(),
  });
}

export function useTodayTasks() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = startOfDay.getTime() + 24 * 60 * 60 * 1000;

  return useQuery({
    queryKey: [...TASKS_QUERY_KEY, 'today'],
    queryFn: () =>
      db.tasks
        .where('dueDate')
        .between(startOfDay.getTime(), endOfDay)
        .and((t) => t.status !== 'done')
        .toArray(),
  });
}

// Global subscription, bootstrapped once in app/main.tsx — see PRD "Event
// Bus" rules and the goal-progress staleness bug this pattern fixes
// (component-mount-scoped invalidation misses events fired while the
// consuming page isn't open).
export function initTaskEventsSync(): void {
  const invalidate = () => queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
  eventBus.on('task.created', invalidate);
  eventBus.on('task.updated', invalidate);
  eventBus.on('task.completed', invalidate);
  eventBus.on('task.deleted', invalidate);
}
