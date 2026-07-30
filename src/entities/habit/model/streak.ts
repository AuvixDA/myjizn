export type WeekStartsOn = 'monday' | 'sunday';

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getWeekStart(date: Date, weekStartsOn: WeekStartsOn): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 = Sunday .. 6 = Saturday
  const diff = weekStartsOn === 'monday' ? (day === 0 ? 6 : day - 1) : day;
  d.setDate(d.getDate() - diff);
  return d;
}

// A streak stays "alive" through the current day/week even if today isn't
// checked yet — it only breaks once a full day/week is skipped, matching
// how habit trackers commonly behave (you have until the period ends).
export function computeDailyStreak(checkedDates: string[], today = new Date()): number {
  const checked = new Set(checkedDates);
  const cursor = new Date(today);
  cursor.setHours(0, 0, 0, 0);
  if (!checked.has(toDateOnly(cursor))) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  while (checked.has(toDateOnly(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function computeWeeklyStreak(checkedDates: string[], weekStartsOn: WeekStartsOn, today = new Date()): number {
  const checkedWeekStarts = new Set(checkedDates.map((d) => toDateOnly(getWeekStart(new Date(d), weekStartsOn))));
  const cursor = getWeekStart(today, weekStartsOn);
  if (!checkedWeekStarts.has(toDateOnly(cursor))) cursor.setDate(cursor.getDate() - 7);

  let streak = 0;
  while (checkedWeekStarts.has(toDateOnly(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
}

export function computeStreak(
  checkedDates: string[],
  frequency: 'daily' | 'weekly',
  weekStartsOn: WeekStartsOn,
  today = new Date(),
): number {
  return frequency === 'daily'
    ? computeDailyStreak(checkedDates, today)
    : computeWeeklyStreak(checkedDates, weekStartsOn, today);
}

export function todayKey(date = new Date()): string {
  return toDateOnly(date);
}
