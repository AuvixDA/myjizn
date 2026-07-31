import { motion } from 'framer-motion';
import { useTasks } from '../../entities/task/api/taskApi';
import { GlassCard } from '../../shared/ui/GlassCard';

const DAY_MS = 24 * 60 * 60 * 1000;
const DAYS = 30;

function lastNDayStarts(n: number): number[] {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return Array.from({ length: n }, (_, i) => start.getTime() - (n - 1 - i) * DAY_MS);
}

const WEEKDAY_LABEL = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

export function TaskTrendChart() {
  const { data: tasks } = useTasks();
  const days = lastNDayStarts(DAYS);

  const bars = days.map((dayStart) => ({
    dayStart,
    count: tasks?.filter((t) => t.completedAt && t.completedAt >= dayStart && t.completedAt < dayStart + DAY_MS).length ?? 0,
  }));
  const max = Math.max(1, ...bars.map((b) => b.count));

  return (
    <GlassCard>
      <h2 className="text-xs text-white/45 mb-4">Выполненные задачи — 30 дней</h2>
      <div className="overflow-x-auto">
        <div className="flex items-end gap-1.5 h-24 min-w-max px-0.5">
          {bars.map(({ dayStart, count }, i) => {
            const date = new Date(dayStart);
            const isToday = i === bars.length - 1;
            return (
              <div key={dayStart} className="flex flex-col items-center gap-1.5 w-4 shrink-0" title={date.toLocaleDateString('ru-RU')}>
                <div className="flex items-end h-16">
                  <motion.div
                    initial={{ height: 2 }}
                    animate={{ height: Math.max(2, Math.round((count / max) * 64)) }}
                    transition={{ duration: 0.5, delay: i * 0.012, ease: [0.16, 1, 0.3, 1] }}
                    className={`w-2 rounded-full ${isToday ? 'bg-gradient-to-t from-accent-dim to-accent-soft' : 'bg-white/15'}`}
                  />
                </div>
                {date.getDay() === 1 && <span className="text-[9px] text-white/30">{WEEKDAY_LABEL[date.getDay()]}</span>}
              </div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}
