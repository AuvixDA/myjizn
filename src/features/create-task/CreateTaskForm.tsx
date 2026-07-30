import { useState, type FormEvent } from 'react';
import { createTask } from '../../entities/task/api/taskApi';
import { Button } from '../../shared/ui/Button';

interface CreateTaskFormProps {
  onCreated?: () => void;
}

export function CreateTaskForm({ onCreated }: CreateTaskFormProps) {
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await createTask({ title: title.trim() });
      setTitle('');
      onCreated?.();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Новая задача…"
        className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <Button type="submit" disabled={submitting || !title.trim()}>
        Добавить
      </Button>
    </form>
  );
}
