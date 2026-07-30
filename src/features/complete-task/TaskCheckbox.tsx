import { useState } from 'react';
import { completeTask, updateTaskTitle, deleteTask } from '../../entities/task/api/taskApi';
import { Checkbox } from '../../shared/ui/Checkbox';
import { Input } from '../../shared/ui/Input';
import { IconButton } from '../../shared/ui/IconButton';
import { PencilIcon, TrashIcon, CheckIcon, XIcon } from '../../shared/ui/icons';
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
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const done = task.status === 'done';

  async function handleSave() {
    const trimmed = title.trim();
    if (trimmed && trimmed !== task.title) await updateTaskTitle(task.id, trimmed);
    setEditing(false);
  }

  function handleCancel() {
    setTitle(task.title);
    setEditing(false);
  }

  function handleDelete() {
    if (window.confirm(`Удалить задачу «${task.title}»?`)) void deleteTask(task.id);
  }

  if (editing) {
    return (
      <form
        className="flex items-center gap-1.5"
        onSubmit={(e) => {
          e.preventDefault();
          void handleSave();
        }}
      >
        <Input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} className="flex-1 py-1.5" />
        <IconButton type="submit" label="Сохранить">
          <CheckIcon className="size-4" />
        </IconButton>
        <IconButton type="button" label="Отмена" onClick={handleCancel}>
          <XIcon className="size-4" />
        </IconButton>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Checkbox checked={done} disabled={done} onChange={() => completeTask(task.id)} />
      <span className={`flex-1 truncate transition-colors ${done ? 'line-through text-white/35' : 'text-white/90'}`}>
        {task.title}
      </span>
      {!done && <span className={`size-1.5 rounded-full shrink-0 ${PRIORITY_DOT[task.priority]}`} />}
      <IconButton label="Редактировать" className="opacity-60 hover:opacity-100" onClick={() => setEditing(true)}>
        <PencilIcon className="size-3.5" />
      </IconButton>
      <IconButton label="Удалить" variant="danger" className="opacity-60 hover:opacity-100" onClick={handleDelete}>
        <TrashIcon className="size-3.5" />
      </IconButton>
    </div>
  );
}
