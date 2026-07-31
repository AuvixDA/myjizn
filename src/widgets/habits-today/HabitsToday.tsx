import { useHabits, toggleHabitToday } from '../../entities/habit/api/habitApi';
import { todayKey } from '../../entities/habit/model/streak';
import { Checkbox } from '../../shared/ui/Checkbox';
import { GlassCard } from '../../shared/ui/GlassCard';
import { FlameIcon } from '../../shared/ui/icons';

interface HabitsTodayProps {
  delay?: number;
}

export function HabitsToday({ delay = 0 }: HabitsTodayProps) {
  const { data: habits, isPending } = useHabits();
  const today = todayKey();

  if (!isPending && (!habits || habits.length === 0)) return null;

  return (
    <GlassCard delay={delay}>
      <h2 className="text-xs text-white/60 mb-3">Привычки</h2>
      <ul className="space-y-3">
        {habits?.map((habit) => (
          <li key={habit.id} className="flex items-center gap-3">
            <Checkbox
              checked={habit.checkedDates.includes(today)}
              onChange={() => toggleHabitToday(habit.id)}
              aria-label={`Отметить «${habit.title}» на сегодня`}
            />
            <span className="flex-1 truncate text-sm">{habit.title}</span>
            {habit.streak > 0 && (
              <span className="flex items-center gap-1 text-xs text-orange-300 shrink-0">
                <FlameIcon className="size-3.5" />
                {habit.streak}
              </span>
            )}
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
