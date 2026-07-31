import { describe, expect, it } from 'vitest';
import { computeInsight, type InsightData } from './insightEngine';
import type { Habit } from '../../../entities/habit/model/types';
import type { Goal } from '../../../entities/goal/model/types';
import type { Task } from '../../../entities/task/model/types';

const NOW = new Date('2026-07-30T18:00:00').getTime();
const DAY_MS = 24 * 60 * 60 * 1000;

function emptyData(): InsightData {
  return { goals: [], tasks: [], habits: [], finance: [] };
}

function habit(overrides: Partial<Habit>): Habit {
  return {
    id: 'h1',
    createdAt: NOW,
    updatedAt: NOW,
    relations: [],
    title: 'Медитация',
    frequency: 'daily',
    checkedDates: [],
    streak: 0,
    ...overrides,
  };
}

function goal(overrides: Partial<Goal>): Goal {
  return {
    id: 'g1',
    createdAt: NOW,
    updatedAt: NOW,
    relations: [],
    title: 'Марафон',
    status: 'active',
    progress: 0,
    ...overrides,
  };
}

function task(overrides: Partial<Task>): Task {
  return {
    id: 't1',
    createdAt: NOW,
    updatedAt: NOW,
    relations: [],
    title: 'Пробежка',
    status: 'done',
    priority: 'medium',
    ...overrides,
  };
}

describe('computeInsight', () => {
  it('returns null when there is no data at all', () => {
    expect(computeInsight(emptyData(), NOW)).toBeNull();
  });

  it('warns about a daily habit streak at risk of breaking today', () => {
    const data = emptyData();
    data.habits = [habit({ streak: 5, checkedDates: ['2026-07-29'] })];
    const insight = computeInsight(data, NOW);
    expect(insight?.id).toBe('habit-streak-risk');
    expect(insight?.text).toContain('5');
  });

  it('does not warn once the habit is already checked today', () => {
    const data = emptyData();
    data.habits = [habit({ streak: 5, checkedDates: ['2026-07-30'] })];
    expect(computeInsight(data, NOW)).toBeNull();
  });

  it('flags a stagnant goal older than a week with 0% progress', () => {
    const data = emptyData();
    data.goals = [goal({ createdAt: NOW - 10 * DAY_MS, progress: 0 })];
    const insight = computeInsight(data, NOW);
    expect(insight?.id).toBe('goal-stagnation');
  });

  it('does not flag a recently created goal', () => {
    const data = emptyData();
    data.goals = [goal({ createdAt: NOW - 2 * DAY_MS, progress: 0 })];
    expect(computeInsight(data, NOW)).toBeNull();
  });

  it('reports a positive weekly trend once there is two weeks of history', () => {
    const data = emptyData();
    data.tasks = [
      task({ id: 't1', completedAt: NOW - 1 * DAY_MS }),
      task({ id: 't2', completedAt: NOW - 2 * DAY_MS }),
      task({ id: 't3', completedAt: NOW - 9 * DAY_MS }),
    ];
    const insight = computeInsight(data, NOW);
    expect(insight?.id).toBe('trend-up');
  });

  it('falls back through rules in priority order', () => {
    const data = emptyData();
    data.habits = [habit({ streak: 5, checkedDates: ['2026-07-30'] })]; // satisfied, no insight
    data.goals = [goal({ createdAt: NOW - 2 * DAY_MS, progress: 0 })]; // too recent, no insight
    data.tasks = [task({ id: 't1', completedAt: NOW - 1 * DAY_MS })]; // no prior week to compare
    data.finance = [
      { id: 'f1', createdAt: NOW, updatedAt: NOW, relations: [], amount: -500, currency: 'RUB', category: 'Еда', date: NOW },
      { id: 'f2', createdAt: NOW, updatedAt: NOW, relations: [], amount: -300, currency: 'RUB', category: 'Еда', date: NOW },
      { id: 'f3', createdAt: NOW, updatedAt: NOW, relations: [], amount: -100, currency: 'RUB', category: 'Транспорт', date: NOW },
    ];
    const insight = computeInsight(data, NOW);
    expect(insight?.id).toBe('top-expense');
    expect(insight?.text).toContain('Еда');
  });
});
