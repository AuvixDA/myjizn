import { useTasks } from '../../entities/task/api/taskApi';
import { GlassCard } from '../../shared/ui/GlassCard';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function WeekProgress() {
  const { data: tasks } = useTasks();
  const weekAgo = Date.now() - WEEK_MS;
  const completedThisWeek = tasks?.filter((t) => t.status === 'done' && (t.completedAt ?? 0) >= weekAgo).length ?? 0;

  return (
    <GlassCard>
      <h2 className="text-sm text-white/50 mb-2">Прогресс недели</h2>
      <p className="text-2xl font-semibold">{completedThisWeek}</p>
      <p className="text-xs text-white/40">задач выполнено за 7 дней</p>
    </GlassCard>
  );
}
