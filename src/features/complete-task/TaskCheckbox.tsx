import { completeTask } from '../../entities/task/api/taskApi';
import type { Task } from '../../entities/task/model/types';

interface TaskCheckboxProps {
  task: Task;
}

export function TaskCheckbox({ task }: TaskCheckboxProps) {
  const done = task.status === 'done';

  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={done}
        disabled={done}
        onChange={() => completeTask(task.id)}
        className="size-4 rounded accent-accent"
      />
      <span className={done ? 'line-through text-white/40' : 'text-white/90'}>{task.title}</span>
    </label>
  );
}
