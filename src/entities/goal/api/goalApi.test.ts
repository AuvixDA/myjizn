import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../../../shared/api/db/schema';
import { buildReverseIndex } from '../../../shared/api/db/relations';
import { queryClient } from '../../../shared/api/queryClient';
import { createGoal, initGoalEventsSync, GOALS_QUERY_KEY } from './goalApi';
import { createTask, completeTask, deleteTask } from '../../task/api/taskApi';

// jsdom has no Worker implementation; search indexing is unrelated to what
// this test verifies (goal progress + query invalidation), so it's stubbed.
vi.mock('../../../shared/lib/search/searchClient', () => ({
  indexRecord: vi.fn(),
  removeSearchRecord: vi.fn(),
  initSearchIndex: vi.fn(),
  searchEntities: vi.fn(),
}));

// Regression test for a real bug: progress recompute correctly wrote to
// Dexie, but the React Query cache only got invalidated by a hook mounted
// on the Goals/Home page — so completing a linked task while neither page
// was open left the cache stale until some unrelated invalidation nudged
// it. The fix moved invalidation to a global, always-on subscription
// (initGoalEventsSync, bootstrapped once in app/main.tsx) instead of a
// component-scoped hook. This test asserts the fix without mounting any
// component at all, which is exactly the scenario that broke before.
describe('goal progress stays correct with no page mounted', () => {
  beforeAll(() => {
    initGoalEventsSync();
  });

  beforeEach(async () => {
    await db.transaction('rw', db.tables, () => Promise.all(db.tables.map((t) => t.clear())));
    await buildReverseIndex();
    queryClient.clear();
  });

  it('recomputes progress and invalidates the goals query on task completion', async () => {
    const goal = await createGoal({ title: 'Пробежать марафон' });
    const task = await createTask({
      title: 'Пробежать 10 км',
      relations: [{ targetId: goal.id, targetType: 'goal', type: 'supports' }],
    });

    // Simulates the Goals page having been visited once (populating the
    // cache) and then closed — no observer is mounted for what follows,
    // matching the scenario the bug happened in.
    await queryClient.fetchQuery({ queryKey: GOALS_QUERY_KEY, queryFn: () => db.goals.toArray() });

    await completeTask(task.id);
    // recomputeGoalProgress runs inside an async event handler — flush microtasks.
    await new Promise((resolve) => setTimeout(resolve, 0));

    const updatedGoal = await db.goals.get(goal.id);
    expect(updatedGoal?.progress).toBe(100);
    expect(queryClient.getQueryState(GOALS_QUERY_KEY)?.isInvalidated).toBe(true);
  });

  it('recomputes progress back down when the linked task is deleted', async () => {
    const goal = await createGoal({ title: 'Прочитать книги' });
    const task = await createTask({
      title: 'Прочитать книгу 1',
      relations: [{ targetId: goal.id, targetType: 'goal', type: 'supports' }],
    });
    await completeTask(task.id);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect((await db.goals.get(goal.id))?.progress).toBe(100);

    await deleteTask(task.id);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect((await db.goals.get(goal.id))?.progress).toBe(0);
  });
});
