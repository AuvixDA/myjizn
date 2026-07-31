import type { Goal } from '../../../entities/goal/model/types';
import type { Task } from '../../../entities/task/model/types';
import type { Habit } from '../../../entities/habit/model/types';
import type { FinanceEntry } from '../../../entities/finance/model/types';
import { todayKey } from '../../../entities/habit/model/streak';
import { pluralizeRu } from '../../../shared/lib/pluralize';

export interface Insight {
  id: string;
  text: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

// Local heuristics only — no external LLM calls, per PRD "AI Insight"
// decision (offline-only PWA, no server round-trips). Rules are tried in
// priority order; the first one with enough data to say something useful
// wins. Each rule is a pure function so it can be unit-tested in
// isolation without mounting anything.

function habitStreakAtRisk(habits: Habit[], today: string): Insight | null {
  const atRisk = habits.find((h) => h.frequency === 'daily' && h.streak >= 3 && !h.checkedDates.includes(today));
  if (!atRisk) return null;
  return {
    id: 'habit-streak-risk',
    text: `Не забудь отметить «${atRisk.title}» сегодня — серия из ${atRisk.streak} дней под угрозой.`,
  };
}

function goalStagnation(goals: Goal[], now: number): Insight | null {
  const stagnant = goals.find((g) => g.status === 'active' && g.progress === 0 && now - g.createdAt > WEEK_MS);
  if (!stagnant) return null;
  return {
    id: 'goal-stagnation',
    text: `Цель «${stagnant.title}» пока не продвигается. Добавь к ней задачи, чтобы начать?`,
  };
}

function weeklyTrend(tasks: Task[], now: number): Insight | null {
  const thisWeek = tasks.filter((t) => t.completedAt && t.completedAt >= now - WEEK_MS).length;
  const lastWeek = tasks.filter(
    (t) => t.completedAt && t.completedAt >= now - 2 * WEEK_MS && t.completedAt < now - WEEK_MS,
  ).length;
  if (lastWeek === 0) return null; // avoid noisy percentages on the first week of data

  if (thisWeek > lastWeek) {
    const diff = thisWeek - lastWeek;
    return {
      id: 'trend-up',
      text: `На этой неделе выполнено на ${diff} ${pluralizeRu(diff, ['задачу', 'задачи', 'задач'])} больше, чем на прошлой. Хороший темп!`,
    };
  }
  if (thisWeek < lastWeek) {
    return { id: 'trend-down', text: `На этой неделе выполнено задач меньше, чем на прошлой: ${thisWeek} против ${lastWeek}.` };
  }
  return null;
}

const TIME_OF_DAY_LABEL = { morning: 'по утрам', day: 'днём', evening: 'по вечерам', night: 'по ночам' } as const;

function productiveTimeOfDay(tasks: Task[]): Insight | null {
  const done = tasks.filter((t) => t.completedAt);
  if (done.length < 5) return null;

  const buckets = { morning: 0, day: 0, evening: 0, night: 0 };
  for (const t of done) {
    const hour = new Date(t.completedAt as number).getHours();
    if (hour >= 5 && hour < 12) buckets.morning++;
    else if (hour >= 12 && hour < 18) buckets.day++;
    else if (hour >= 18 && hour < 24) buckets.evening++;
    else buckets.night++;
  }

  const top = (Object.entries(buckets) as [keyof typeof buckets, number][]).sort((a, b) => b[1] - a[1])[0];
  if (!top || top[1] === 0) return null;
  return { id: 'productive-time', text: `Больше всего задач ты выполняешь ${TIME_OF_DAY_LABEL[top[0]]}.` };
}

function topExpenseCategory(finance: FinanceEntry[], now: number): Insight | null {
  const recent = finance.filter((f) => f.amount < 0 && f.date >= now - 30 * DAY_MS);
  if (recent.length < 3) return null;

  const byCategory = new Map<string, number>();
  for (const f of recent) byCategory.set(f.category, (byCategory.get(f.category) ?? 0) + Math.abs(f.amount));
  const top = [...byCategory.entries()].sort((a, b) => b[1] - a[1])[0];
  if (!top) return null;

  return { id: 'top-expense', text: `Больше всего за последние 30 дней потрачено на «${top[0]}».` };
}

export interface InsightData {
  goals: Goal[];
  tasks: Task[];
  habits: Habit[];
  finance: FinanceEntry[];
}

export function computeInsight(data: InsightData, now = Date.now()): Insight | null {
  const rules = [
    () => habitStreakAtRisk(data.habits, todayKey(new Date(now))),
    () => goalStagnation(data.goals, now),
    () => weeklyTrend(data.tasks, now),
    () => productiveTimeOfDay(data.tasks),
    () => topExpenseCategory(data.finance, now),
  ];

  for (const rule of rules) {
    const insight = rule();
    if (insight) return insight;
  }
  return null;
}
