import { completeTask } from '../../entities/task/api/taskApi';
import { Checkbox } from '../../shared/ui/Checkbox';
import type { Task } from '../../entities/task/model/types';

const PRIORITY_DOT: Record<Task['priority'], string> = {
  low: 'bg-white/20',
  medium: 'bg-accent-soft',
  high: 'bg-rose-400',
};

interface TaskCheckboxProps {
  task: Task;
}

export function TaskCheckbox({ task }: TaskCheckboxProps) {
  const done = task.status === 'done';

  return (
    <div className="flex items-center gap-3">
      <Checkbox checked={done} disabled={done} onChange={() => completeTask(task.id)} />
      <span className={`flex-1 truncate transition-colors ${done ? 'line-through text-white/35' : 'text-white/90'}`}>
        {task.title}
      </span>
      {!done && <span className={`size-1.5 rounded-full shrink-0 ${PRIORITY_DOT[task.priority]}`} />}
    </div>
  );
}
