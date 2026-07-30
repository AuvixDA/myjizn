import { v4 as uuid } from 'uuid';
import { useQuery } from '@tanstack/react-query';
import { db } from '../../../shared/api/db/schema';
import { queryClient } from '../../../shared/api/queryClient';
import { reindexEntity } from '../../../shared/api/db/relations';
import { deleteEntity } from '../../../shared/api/db/delete';
import { indexRecord } from '../../../shared/lib/search/searchClient';
import { eventBus } from '../../../shared/lib/event-bus';
import { getWeekStartsOn } from '../../settings/api/settingsApi';
import { computeStreak, todayKey } from '../model/streak';
import type { Habit } from '../model/types';
import type { EntityId } from '../../../shared/types/entity';

export const HABITS_QUERY_KEY = ['habits'] as const;

export interface CreateHabitInput {
  title: string;
  frequency: Habit['frequency'];
}

export async function createHabit(input: CreateHabitInput): Promise<Habit> {
  const now = Date.now();
  const habit: Habit = {
    id: uuid(),
    createdAt: now,
    updatedAt: now,
    relations: [],
    title: input.title,
    frequency: input.frequency,
    checkedDates: [],
    streak: 0,
  };
  await db.habits.add(habit);
  reindexEntity('habit', habit);
  indexRecord({ id: habit.id, kind: 'habit', title: habit.title });
  eventBus.emit({ type: 'habit.created', payload: { id: habit.id } });
  return habit;
}

// Toggles today (or, for weekly habits, "this week is done", using today's
// date as the week's marker) and recomputes the streak from scratch rather
// than incrementing/decrementing it — cheap at habit-list scale and immune
// to drift.
export async function toggleHabitToday(id: EntityId): Promise<void> {
  const habit = await db.habits.get(id);
  if (!habit) return;

  const today = todayKey();
  const checkedDates = habit.checkedDates.includes(today)
    ? habit.checkedDates.filter((d) => d !== today)
    : [...habit.checkedDates, today];

  const weekStartsOn = await getWeekStartsOn();
  const streak = computeStreak(checkedDates, habit.frequency, weekStartsOn);

  await db.habits.update(id, { checkedDates, streak, updatedAt: Date.now() });
  eventBus.emit({ type: 'habit.checked', payload: { id, date: today } });
}

export async function updateHabitTitle(id: EntityId, title: string): Promise<void> {
  await db.habits.update(id, { title, updatedAt: Date.now() });
  indexRecord({ id, kind: 'habit', title });
  eventBus.emit({ type: 'habit.updated', payload: { id } });
}

export async function deleteHabit(id: EntityId): Promise<void> {
  await deleteEntity('habit', id);
  eventBus.emit({ type: 'habit.deleted', payload: { id } });
}

export function useHabits() {
  return useQuery({
    queryKey: HABITS_QUERY_KEY,
    queryFn: () => db.habits.orderBy('updatedAt').reverse().toArray(),
  });
}

export function initHabitEventsSync(): void {
  const invalidate = () => queryClient.invalidateQueries({ queryKey: HABITS_QUERY_KEY });
  eventBus.on('habit.created', invalidate);
  eventBus.on('habit.updated', invalidate);
  eventBus.on('habit.checked', invalidate);
  eventBus.on('habit.deleted', invalidate);
}
