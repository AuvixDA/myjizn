import { HomeSummary } from '../../widgets/home-summary/HomeSummary';
import { WeekProgress } from '../../widgets/week-progress/WeekProgress';
import { useTaskEventsSync } from '../../entities/task/api/taskApi';
import { useGoalEventsSync } from '../../entities/goal/api/goalApi';

export function HomePage() {
  useTaskEventsSync();
  useGoalEventsSync();

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      <h1 className="text-2xl font-semibold">Home</h1>
      <HomeSummary />
      <WeekProgress />
    </div>
  );
}
