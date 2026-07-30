import { useHabits } from '../../entities/habit/api/habitApi';
import { CreateHabitForm } from '../../features/create-habit/CreateHabitForm';
import { HabitCard } from '../../features/manage-habit/HabitCard';
import { Skeleton } from '../../shared/ui/Skeleton';

export function HabitsPage() {
  const { data: habits, isPending } = useHabits();

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Привычки</h1>
      <CreateHabitForm />
      <div className="flex flex-col gap-2">
        {isPending && (
          <>
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </>
        )}
        {habits?.map((habit, i) => (
          <HabitCard key={habit.id} habit={habit} delay={i * 0.04} />
        ))}
        {habits?.length === 0 && <p className="text-white/40 text-sm">Пока нет привычек</p>}
      </div>
    </div>
  );
}
