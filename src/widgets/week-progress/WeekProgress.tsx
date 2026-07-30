import { motion } from 'framer-motion';
import { useTasks } from '../../entities/task/api/taskApi';
import { GlassCard } from '../../shared/ui/GlassCard';

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAY_LABEL = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

function lastSevenDays(): number[] {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => startOfToday.getTime() - (6 - i) * DAY_MS);
}

export function WeekProgress() {
  const { data: tasks } = useTasks();
  const days = lastSevenDays();

  const bars = days.map((dayStart) => ({
    dayStart,
    count: tasks?.filter((t) => t.completedAt && t.completedAt >= dayStart && t.completedAt < dayStart + DAY_MS).length ?? 0,
  }));
  const total = bars.reduce((sum, b) => sum + b.count, 0);
  const max = Math.max(1, ...bars.map((b) => b.count));

  return (
    <GlassCard delay={0.1}>
      <h2 className="text-xs text-white/45 mb-3">Прогресс недели</h2>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-3xl font-semibold bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
            {total}
          </p>
          <p className="text-xs text-white/40 mt-1">задач за 7 дней</p>
        </div>
        <div className="flex items-end gap-2">
          {bars.map(({ dayStart, count }, i) => (
            <div key={dayStart} className="flex flex-col items-center gap-1.5 w-6">
              <div className="flex items-end h-12">
                <motion.div
                  initial={{ height: 3 }}
                  animate={{ height: Math.max(3, Math.round((count / max) * 48)) }}
                  transition={{ duration: 0.6, delay: 0.1 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  className="w-2.5 rounded-full bg-gradient-to-t from-accent-dim to-accent-soft"
                />
              </div>
              <span className="text-[10px] text-white/35">{WEEKDAY_LABEL[new Date(dayStart).getDay()]}</span>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
