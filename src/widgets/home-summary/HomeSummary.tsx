import { useGoals } from '../../entities/goal/api/goalApi';
import { useTodayTasks } from '../../entities/task/api/taskApi';
import { TaskCheckbox } from '../../features/complete-task/TaskCheckbox';
import { GlassCard } from '../../shared/ui/GlassCard';

export function HomeSummary() {
  const { data: goals } = useGoals();
  const { data: todayTasks } = useTodayTasks();
  const mainGoal = goals?.[0];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <GlassCard>
        <h2 className="text-sm text-white/50 mb-2">Главная цель</h2>
        {mainGoal ? (
          <div>
            <p className="text-lg font-medium">{mainGoal.title}</p>
            <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-accent" style={{ width: `${mainGoal.progress}%` }} />
            </div>
            <p className="mt-1 text-xs text-white/40">{mainGoal.progress}%</p>
          </div>
        ) : (
          <p className="text-white/40 text-sm">Пока нет целей</p>
        )}
      </GlassCard>

      <GlassCard>
        <h2 className="text-sm text-white/50 mb-2">Задачи на сегодня</h2>
        {todayTasks && todayTasks.length > 0 ? (
          <ul className="space-y-2">
            {todayTasks.map((task) => (
              <li key={task.id}>
                <TaskCheckbox task={task} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-white/40 text-sm">Нет задач на сегодня</p>
        )}
      </GlassCard>
    </div>
  );
}
