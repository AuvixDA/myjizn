import { useGoals } from '../../entities/goal/api/goalApi';
import { useTodayTasks } from '../../entities/task/api/taskApi';
import { TaskCheckbox } from '../../features/complete-task/TaskCheckbox';
import { GlassCard } from '../../shared/ui/GlassCard';
import { CircularProgress } from '../../shared/ui/CircularProgress';
import { Skeleton } from '../../shared/ui/Skeleton';

export function HomeSummary() {
  const { data: goals, isPending: goalsPending } = useGoals();
  const { data: todayTasks, isPending: tasksPending } = useTodayTasks();
  const mainGoal = goals?.[0];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <GlassCard className="flex items-center gap-4">
        {goalsPending ? (
          <>
            <Skeleton className="size-[72px] rounded-full shrink-0" />
            <Skeleton className="h-5 w-32" />
          </>
        ) : mainGoal ? (
          <>
            <CircularProgress value={mainGoal.progress} />
            <div className="min-w-0">
              <h2 className="text-xs text-white/45 mb-1">Главная цель</h2>
              <p className="text-lg font-medium truncate">{mainGoal.title}</p>
            </div>
          </>
        ) : (
          <div>
            <h2 className="text-xs text-white/45 mb-1">Главная цель</h2>
            <p className="text-white/40 text-sm">Пока нет целей</p>
          </div>
        )}
      </GlassCard>

      <GlassCard delay={0.05}>
        <h2 className="text-xs text-white/45 mb-3">Задачи на сегодня</h2>
        {tasksPending ? (
          <Skeleton className="h-5 w-2/3" />
        ) : todayTasks && todayTasks.length > 0 ? (
          <ul className="space-y-3">
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
