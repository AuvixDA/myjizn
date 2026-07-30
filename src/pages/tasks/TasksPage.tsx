import { useTasks, useTaskEventsSync } from '../../entities/task/api/taskApi';
import { CreateTaskForm } from '../../features/create-task/CreateTaskForm';
import { TaskCheckbox } from '../../features/complete-task/TaskCheckbox';
import { GlassCard } from '../../shared/ui/GlassCard';

export function TasksPage() {
  useTaskEventsSync();
  const { data: tasks } = useTasks();

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <h1 className="text-2xl font-semibold">Tasks</h1>
      <CreateTaskForm />
      <GlassCard>
        <ul className="space-y-3">
          {tasks?.map((task) => (
            <li key={task.id}>
              <TaskCheckbox task={task} />
            </li>
          ))}
          {tasks?.length === 0 && <p className="text-white/40 text-sm">Пока нет задач</p>}
        </ul>
      </GlassCard>
    </div>
  );
}
