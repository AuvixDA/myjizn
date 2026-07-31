import { TaskTrendChart } from './TaskTrendChart';
import { GoalsOverview } from './GoalsOverview';
import { ExpenseByCategory } from './ExpenseByCategory';
import { HabitHeatmap } from './HabitHeatmap';

export function StatisticsPage() {
  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Статистика</h1>
      <TaskTrendChart />
      <GoalsOverview />
      <HabitHeatmap />
      <ExpenseByCategory />
    </div>
  );
}
