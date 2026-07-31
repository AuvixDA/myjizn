import { motion } from 'framer-motion';
import { useTasks } from '../../entities/task/api/taskApi';
import { CreateTaskForm } from '../../features/create-task/CreateTaskForm';
import { TaskCheckbox } from '../../features/complete-task/TaskCheckbox';
import { GlassCard } from '../../shared/ui/GlassCard';
import { Skeleton } from '../../shared/ui/Skeleton';
import { VirtualList } from '../../shared/ui/VirtualList';
import type { Task } from '../../entities/task/model/types';

// Below this, a plain animated list looks and feels better (natural page
// height, entrance stagger); above it, a fixed-height virtualized scroll
// area keeps the DOM small regardless of how many tasks pile up.
const VIRTUALIZE_THRESHOLD = 30;

export function TasksPage() {
  const { data: tasks, isPending } = useTasks();

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Задачи</h1>
      <CreateTaskForm />
      <GlassCard>
        {isPending && (
          <div className="space-y-3.5">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-5 w-3/5" />
          </div>
        )}
        {tasks && tasks.length > VIRTUALIZE_THRESHOLD ? (
          <VirtualList
            items={tasks}
            estimateSize={44}
            getKey={(task) => task.id}
            renderItem={(task: Task) => (
              <div className="py-1.5">
                <TaskCheckbox task={task} />
              </div>
            )}
          />
        ) : (
          <ul className="space-y-3.5">
            {tasks?.map((task, i) => (
              <motion.li
                key={task.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: i * 0.03, ease: [0.16, 1, 0.3, 1] }}
              >
                <TaskCheckbox task={task} />
              </motion.li>
            ))}
            {tasks?.length === 0 && <p className="text-white/55 text-sm">Пока нет задач</p>}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}
