import { useGoals } from '../../entities/goal/api/goalApi';
import { CreateGoalForm } from '../../features/create-goal/CreateGoalForm';
import { GoalCard } from '../../features/manage-goal/GoalCard';
import { Skeleton } from '../../shared/ui/Skeleton';

export function GoalsPage() {
  const { data: goals, isPending } = useGoals();

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Цели</h1>
      <CreateGoalForm />
      <div className="flex flex-col gap-2">
        {isPending && (
          <>
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </>
        )}
        {goals?.map((goal, i) => (
          <GoalCard key={goal.id} goal={goal} delay={i * 0.04} />
        ))}
        {goals?.length === 0 && <p className="text-white/40 text-sm">Пока нет целей</p>}
      </div>
    </div>
  );
}
