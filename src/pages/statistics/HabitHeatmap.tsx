import { useHabits } from '../../entities/habit/api/habitApi';
import { todayKey } from '../../entities/habit/model/streak';
import { GlassCard } from '../../shared/ui/GlassCard';

const DAY_MS = 24 * 60 * 60 * 1000;
const DAYS = 30;

function lastNDayKeys(n: number): string[] {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return Array.from({ length: n }, (_, i) => todayKey(new Date(start.getTime() - (n - 1 - i) * DAY_MS)));
}

export function HabitHeatmap() {
  const { data: habits } = useHabits();
  if (!habits || habits.length === 0) return null;

  const days = lastNDayKeys(DAYS);

  return (
    <GlassCard>
      <h2 className="text-xs text-white/60 mb-4">Привычки — последние 30 дней</h2>
      <div className="flex flex-col gap-3 overflow-x-auto">
        {habits.map((habit) => (
          <div key={habit.id} className="flex items-center gap-3 min-w-max">
            <span className="text-sm w-28 truncate shrink-0">{habit.title}</span>
            <div className="flex gap-[3px]">
              {days.map((day) => (
                <span
                  key={day}
                  title={day}
                  className={`size-2.5 rounded-[3px] ${habit.checkedDates.includes(day) ? 'bg-accent-soft' : 'bg-white/[0.07]'}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
