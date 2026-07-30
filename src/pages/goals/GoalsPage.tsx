import { useGoals, useGoalEventsSync } from '../../entities/goal/api/goalApi';
import { CreateGoalForm } from '../../features/create-goal/CreateGoalForm';
import { GlassCard } from '../../shared/ui/GlassCard';

export function GoalsPage() {
  useGoalEventsSync();
  const { data: goals } = useGoals();

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <h1 className="text-2xl font-semibold">Goals</h1>
      <CreateGoalForm />
      <div className="flex flex-col gap-2">
        {goals?.map((goal) => (
          <GlassCard key={goal.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium">{goal.title}</p>
              <p className="text-xs text-white/40">{goal.status}</p>
            </div>
            <span className="text-sm text-white/60">{goal.progress}%</span>
          </GlassCard>
        ))}
        {goals?.length === 0 && <p className="text-white/40 text-sm">Пока нет целей</p>}
      </div>
    </div>
  );
}
