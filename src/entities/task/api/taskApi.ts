import { useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { db } from '../../../shared/api/db/schema';
import { reindexEntity } from '../../../shared/api/db/relations';
import { indexRecord } from '../../../shared/lib/search/searchClient';
import { eventBus } from '../../../shared/lib/event-bus';
import type { Task } from '../model/types';
import type { Relation } from '../../../shared/types/entity';

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

// Subscribes the React Query cache to task events so widgets refresh on
// task.created/task.completed instead of polling (per PRD Event Bus rules).
// Mount once near the root (see AppLayout) rather than per-widget.
export function useTaskEventsSync(): void {
  const queryClient = useQueryClient();
  useEffect(() => {
    const invalidate = () => queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    const unsubCreated = eventBus.on('task.created', invalidate);
    const unsubCompleted = eventBus.on('task.completed', invalidate);
    return () => {
      unsubCreated();
      unsubCompleted();
    };
  }, [queryClient]);
}
