import { describe, expect, it } from 'vitest';
import { computeDailyStreak, computeWeeklyStreak } from './streak';

// Thursday, fixed reference point so tests don't depend on the real date.
const TODAY = new Date('2026-07-30T12:00:00');

describe('computeDailyStreak', () => {
  it('counts consecutive days ending today', () => {
    const dates = ['2026-07-28', '2026-07-29', '2026-07-30'];
    expect(computeDailyStreak(dates, TODAY)).toBe(3);
  });

  it('stays alive if today is not checked yet but yesterday is', () => {
    const dates = ['2026-07-28', '2026-07-29'];
    expect(computeDailyStreak(dates, TODAY)).toBe(2);
  });

  it('breaks on a skipped day', () => {
    const dates = ['2026-07-26', '2026-07-27', '2026-07-29', '2026-07-30'];
    expect(computeDailyStreak(dates, TODAY)).toBe(2);
  });

  it('is 0 when nothing was checked recently', () => {
    expect(computeDailyStreak(['2026-07-01'], TODAY)).toBe(0);
  });

  it('is 0 for an empty history', () => {
    expect(computeDailyStreak([], TODAY)).toBe(0);
  });
});

describe('computeWeeklyStreak', () => {
  it('counts consecutive Monday-start weeks', () => {
    // Week of 2026-07-30 starts Monday 2026-07-27; prior week starts 2026-07-20.
    const dates = ['2026-07-21', '2026-07-28'];
    expect(computeWeeklyStreak(dates, 'monday', TODAY)).toBe(2);
  });

  it('breaks on a skipped week', () => {
    const dates = ['2026-07-06', '2026-07-28'];
    expect(computeWeeklyStreak(dates, 'monday', TODAY)).toBe(1);
  });

  it('respects a Sunday week start', () => {
    // Week of 2026-07-30 (Thu) with Sunday start begins 2026-07-26: current week checked.
    const dates = ['2026-07-26'];
    expect(computeWeeklyStreak(dates, 'sunday', TODAY)).toBe(1);
    // With a Monday start, 2026-07-26 (Sun) falls in the *prior* week
    // (starting 2026-07-20) — still a live streak of 1, since this
    // week (starting 2026-07-27) hasn't ended yet yet.
    expect(computeWeeklyStreak(dates, 'monday', TODAY)).toBe(1);
  });
});
