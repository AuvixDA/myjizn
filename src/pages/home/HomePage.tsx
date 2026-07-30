import { HomeSummary } from '../../widgets/home-summary/HomeSummary';
import { WeekProgress } from '../../widgets/week-progress/WeekProgress';
import { HabitsToday } from '../../widgets/habits-today/HabitsToday';
import { FinanceSummary } from '../../widgets/finance-summary/FinanceSummary';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return 'Доброй ночи';
  if (hour < 12) return 'Доброе утро';
  if (hour < 18) return 'Добрый день';
  return 'Добрый вечер';
}

const DATE_FORMAT = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', weekday: 'long' });

export function HomePage() {
  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{greeting()}</h1>
        <p className="text-sm text-white/40 mt-0.5 capitalize">{DATE_FORMAT.format(new Date())}</p>
      </div>
      <HomeSummary />
      <div className="grid gap-4 md:grid-cols-2">
        <HabitsToday delay={0.08} />
        <FinanceSummary delay={0.12} />
      </div>
      <WeekProgress />
    </div>
  );
}
